import type { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import type { AuthRequest } from "./auth.middleware.js";

export function sseAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.query.token as string | undefined;

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
