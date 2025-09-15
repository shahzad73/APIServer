// src/routes/admin/apiKeys.ts
import express from "express";
import { AppDataSource } from "../data-source";
import { ApiKey, ApiKeyStatus } from "../entity/ApiKey";
import { generateApiKeyPair, hashSecret } from "../utils/apiKeyUtils";

const router = express.Router();

/*
    Create a key (admin)

    owner → A string describing who the key is for.
    Example: "Partner A", "Mobile App", or "Internal Service".

    allowed_ips → (Optional) An array of IP addresses or CIDR ranges allowed to use this key.
    Example: ["203.0.113.10", "198.51.100.0/24"].
    If not provided, the key works from any IP.

    scopes → (Optional) An array of permission strings that define what the API key can access.
    Example: ["read:users", "write:orders"].
    If not used, you can allow global access or handle defaults.

    ttl_days → (Optional) How many days until the key expires.
    Example: 30 means the key expires in 30 days.
    If not provided or set to 0, it won’t expire.
*/ 
router.post("/createAPIKey", async (req, res) => {

  const { owner, allowed_ips, scopes, ttl_days } = req.body;
  const repo = AppDataSource.getRepository(ApiKey);

  const { kid, secret, apiKey } = generateApiKeyPair();

  const secret_hash = hashSecret(secret);

  const expires_at = ttl_days && Number(ttl_days) > 0
    ? new Date(Date.now() + Number(ttl_days) * 24 * 60 * 60 * 1000)
    : null;

  const key = repo.create({
    kid,
    secret_hash,
    owner,
    allowed_ips: allowed_ips ? JSON.stringify(allowed_ips) : null,
    scopes: scopes ? JSON.stringify(scopes) : null,
    status: ApiKeyStatus.ACTIVE,
    expires_at,
  });

  await repo.save(key);

  // IMPORTANT: only return plaintext once
  return res.status(201).json({
    message: "API key created. Save this value securely; it will not be shown again.",
    apiKey, // the plaintext kid.secret
    kid,
    owner,
    expires_at,
  });
});

// Deactivate / revoke
router.post("/revokeAPIKey", async (req, res) => {
  const { kid } = req.body;
  const repo = AppDataSource.getRepository(ApiKey);
  const key = await repo.findOneBy({ kid });
  if (!key) return res.status(404).json({ error: "Not found" });
  key.status = ApiKeyStatus.REVOKED;
  await repo.save(key);
  return res.json({ ok: true });
});

// List keys (no secret)
router.get("/getAllAPIKeys", async (req, res) => {
  const repo = AppDataSource.getRepository(ApiKey);
  const keys = await repo.find();
  // omit secret_hash from output
  const out = keys.map(k => ({
    id: k.id,
    kid: k.kid,
    owner: k.owner,
    status: k.status,
    expires_at: k.expires_at,
    usage_count: k.usage_count,
    last_used: k.last_used,
    allowed_ips: k.allowed_ips ? JSON.parse(k.allowed_ips) : null,
    scopes: k.scopes ? JSON.parse(k.scopes) : null,
    created_at: k.created_at,
  }));
  res.json(out);
});

export default router;