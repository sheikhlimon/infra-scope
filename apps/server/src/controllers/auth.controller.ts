import type { Response } from "express";
import { register, login } from "../services/auth.service.js";
import type { RegisterInput, LoginInput } from "../schemas/auth.schema.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

export async function registerController(req: AuthRequest, res: Response) {
  try {
    const { email, password } = req.body as RegisterInput;
    const { user, token } = await register(email, password);
    res.status(201).json({ user: { id: user.id, email: user.email, role: user.role }, token });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function loginController(req: AuthRequest, res: Response) {
  try {
    const { email, password } = req.body as LoginInput;
    const { user, token } = await login(email, password);
    res.status(200).json({ user: { id: user.id, email: user.email, role: user.role }, token });
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
}

export async function meController(req: AuthRequest, res: Response) {
  res.status(200).json({ user: req.user });
}
