import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined");
    }
    if(token) {
        const decoded = jwt.verify(token, jwtSecret as string) as any;

        if (decoded.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
        }

        (req as any).admin = decoded;
        next();
    } else {
        return res.status(401).json({ message: "Invalid token" });        
    }
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

