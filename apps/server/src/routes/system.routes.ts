import { Router } from "express";
import * as SystemController from "../controllers/system.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/systems - List all systems (admin sees all, user sees own)
router.get("/", SystemController.getSystemsController);

// POST /api/systems - Create new system
router.post("/", SystemController.createSystemController);

// GET /api/systems/:id - Get one system
router.get("/:id", SystemController.getSystemByIdController);

// PUT /api/systems/:id - Update system
router.put("/:id", SystemController.updateSystemController);

// DELETE /api/systems/:id - Delete system (admin only)
router.delete("/:id", requireRole(["ADMIN"]), SystemController.deleteSystemController);

// POST /api/systems/:id/scan - Simulate scanning a system
router.post("/:id/scan", SystemController.scanSystemController);

export default router;
