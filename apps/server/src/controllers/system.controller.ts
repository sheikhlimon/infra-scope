import type { Response } from "express";
import * as SystemService from "../services/system.service.js";
import type { CreateSystemInput, UpdateSystemInput } from "../schemas/system.schema.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

export async function createSystemController(req: AuthRequest, res: Response) {
  try {
    const data = req.body as CreateSystemInput;
    const system = await SystemService.createSystem(req.user!.userId, data);
    res.status(201).json(system);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getSystemsController(req: AuthRequest, res: Response) {
  try {
    const systems = await SystemService.getSystems(req.user!.userId, req.user!.role);
    res.status(200).json(systems);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function getSystemByIdController(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id!);
    const system = await SystemService.getSystemById(id, req.user!.userId, req.user!.role);
    res.status(200).json(system);
  } catch (error) {
    const message = (error as Error).message;
    const status = message === "System not found" ? 404 : message === "Access denied" ? 403 : 500;
    res.status(status).json({ error: message });
  }
}

export async function updateSystemController(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id!);
    const data = req.body as UpdateSystemInput;
    const system = await SystemService.updateSystem(id, req.user!.userId, req.user!.role, data);
    res.status(200).json(system);
  } catch (error) {
    const message = (error as Error).message;
    const status = message === "System not found" ? 404 : message === "Access denied" ? 403 : 400;
    res.status(status).json({ error: message });
  }
}

export async function deleteSystemController(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id!);
    const result = await SystemService.deleteSystem(id, req.user!.userId, req.user!.role);
    res.status(200).json(result);
  } catch (error) {
    const message = (error as Error).message;
    const status = message === "System not found" ? 404 : message === "Access denied" ? 403 : 500;
    res.status(status).json({ error: message });
  }
}

export async function scanSystemController(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id!);
    const system = await SystemService.scanSystem(id, req.user!.userId, req.user!.role);
    res.status(200).json(system);
  } catch (error) {
    const message = (error as Error).message;
    const status = message === "System not found" ? 404 : message === "Access denied" ? 403 : 500;
    res.status(status).json({ error: message });
  }
}
