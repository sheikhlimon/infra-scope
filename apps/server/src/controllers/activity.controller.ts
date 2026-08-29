import type { Response } from "express";
import * as ActivityService from "../services/activity.service.js";
import * as DatagrepperService from "../services/datagrepper.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

export async function getActivityLogsController(req: AuthRequest, res: Response) {
  try {
    const logs = await ActivityService.getActivityLogs(req.user!.userId, req.user!.role);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function getFedoraLiveEventsController(_req: AuthRequest, res: Response) {
  try {
    const events = await DatagrepperService.fetchFedoraLiveEvents(25);
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
