import { Router } from "express";
import { sseAuthMiddleware } from "../middleware/sse-auth.middleware.js";
import { sseHandler } from "../controllers/sse.controller.js";

const router = Router();

router.get("/", sseAuthMiddleware, sseHandler);

export default router;
