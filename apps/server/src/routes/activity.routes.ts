import { Router } from "express";
import {
  getActivityLogsController,
  getFedoraLiveEventsController,
} from "../controllers/activity.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getActivityLogsController);
router.get("/fedora-live", getFedoraLiveEventsController);

export default router;
