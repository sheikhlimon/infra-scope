import { prisma } from "@infra-scope/db";
import { hashPassword, comparePasswords } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import * as ActivityService from "../services/activity.service.js";

export async function register(email: string, password: string) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  const token = signToken({ userId: user.id, role: user.role });
  await ActivityService.logActivity("registered", user.id);
  return { user, token };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValid = await comparePasswords(password, user.password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  const token = signToken({ userId: user.id, role: user.role });
  await ActivityService.logActivity("logged in", user.id);
  return { user, token };
}
