import { Router } from "express";
import { getActivityLogsController } from "../controllers/activity.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getActivityLogsController);

export default router;
