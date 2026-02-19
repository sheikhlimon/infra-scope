import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.middleware.js";

/**
 * Role-based authorization middleware
 * Usage: router.delete("/:id", requireRole(["ADMIN"]), deleteController)
 */
export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Safety check - authMiddleware should have set this
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden - insufficient permissions" });
    }

    next();
  };
}
