// src/middleware/apiKeyAuth.ts
import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { ApiKey, ApiKeyStatus } from "../entity/ApiKey";
import { hashSecret, safeCompare } from "../utils/apiKeyUtils";
import { logger } from "../logger"; // assume you have logger.ts

export interface AuthenticatedRequest extends Request {
  apiKey?: ApiKey;
}

const headerName = "authorization"; // use Authorization: ApiKey <kid>.<secret>

export async function apiKeyAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const raw = (req.header(headerName) || "").trim();
    if (!raw) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    // Accept "ApiKey <kid>.<secret>" or raw "<kid>.<secret>"
    let token = raw;
    if (/^ApiKey\s+/i.test(raw)) {
      token = raw.replace(/^ApiKey\s+/i, "");
    }

    const parts = token.split(".");
    if (parts.length !== 2) {
      logger.warn("API key parse failed", { tokenPreview: token.slice(0, 20) });
      return res.status(401).json({ error: "Invalid API key format" });
    }
    const [kid, secret] = parts;
    
    if (!kid) {
      logger.warn("Kid is undefined", { tokenPreview: token.slice(0, 20) });
      return res.status(401).json({ error: "Invalid API key" });
    }
    
    const repo = AppDataSource.getRepository(ApiKey);
    const apiKey = await repo.findOneBy({ kid });

    if (!apiKey) {
      logger.warn("API key not found", { kid });
      return res.status(401).json({ error: "Invalid API key" });
    }

    if (apiKey.status !== "active") {
      logger.warn("API key inactive/revoked", { kid, status: apiKey.status });
      return res.status(403).json({ error: "API key is not active" });
    }

    // optional: check expiry
    if (apiKey.expires_at && new Date() > apiKey.expires_at) {
      logger.warn("API key expired", { kid });
      apiKey.status = ApiKeyStatus.REVOKED; // Use the correct enum value
      await repo.save(apiKey);
      return res.status(403).json({ error: "API key expired" });
    }

    // compute hash and compare (constant-time)
    if (secret === undefined) {
      logger.warn("Secret is undefined", { kid });
      return res.status(401).json({ error: "Invalid API key" });
    }
    const providedHash = hashSecret(secret);
    if (!safeCompare(providedHash, apiKey.secret_hash)) {
      logger.warn("API key secret mismatch", { kid });
      // optionally: throttle / delay here to mitigate brute force
      return res.status(401).json({ error: "Invalid API key" });
    }

    // optional: check allowed IPs (if set). Implement CIDR checks if required.
    // Example quick check (exact match):
    if (apiKey.allowed_ips) {
      const ips = JSON.parse(apiKey.allowed_ips as string) as string[];
      const remoteIp = (req.ip || req.socket.remoteAddress) || "";
      // naive check; production: use ipaddr.js to match CIDR ranges
      if (ips.length && !ips.includes(remoteIp)) {
        logger.warn("IP not allowed for API key", { kid, remoteIp });
        return res.status(403).json({ error: "IP not allowed" });
      }
    }

    // mark last used / increment usage_count (non blocking)
    apiKey.last_used = new Date();
    // increment safely (TypeORM returns bigint as string in some drivers)
    apiKey.usage_count = (BigInt(apiKey.usage_count as any || 0) + BigInt(1)).toString();
    // best effort save (don't block request on DB but we do await to avoid race; alternative: push to queue)
    await repo.save(apiKey);

    // attach to request for handlers
    req.apiKey = apiKey;
    next();
  } catch (err) {
    logger.error("Error in apiKeyAuth middleware", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

