import { prisma } from "@infra-scope/db";
import type { CreateSystemInput, UpdateSystemInput } from "../schemas/system.schema.js";

export async function createSystem(userId: number, data: CreateSystemInput) {
  const system = await prisma.system.create({
    data: {
      ...data,
      ownerId: userId,
      status: data.status || "INACTIVE",
      connectionType: data.connectionType || "manual",
      credentialsConfigured: data.credentialsConfigured || false,
    },
  });
  return system;
}

export async function getSystems(userId: number, userRole: string) {
  if (userRole === "ADMIN") {
    return await prisma.system.findMany({
      include: { owner: { select: { id: true, email: true } } },
    });
  }
  return await prisma.system.findMany({
    where: { ownerId: userId },
    include: { owner: { select: { id: true, email: true } } },
  });
}

export async function getSystemById(id: number, userId: number, userRole: string) {
  const system = await prisma.system.findUnique({
    where: { id },
    include: { owner: { select: { id: true, email: true } } },
  });

  if (!system) {
    throw new Error("System not found");
  }

  if (userRole !== "ADMIN" && system.ownerId !== userId) {
    throw new Error("Access denied");
  }

  return system;
}

export async function updateSystem(id: number, userId: number, userRole: string, data: UpdateSystemInput) {
  const system = await prisma.system.findUnique({ where: { id } });

  if (!system) {
    throw new Error("System not found");
  }

  if (userRole !== "ADMIN" && system.ownerId !== userId) {
    throw new Error("Access denied");
  }

  const updated = await prisma.system.update({
    where: { id },
    data,
    include: { owner: { select: { id: true, email: true } } },
  });

  return updated;
}

export async function deleteSystem(id: number, userId: number, userRole: string) {
  const system = await prisma.system.findUnique({ where: { id } });

  if (!system) {
    throw new Error("System not found");
  }

  if (userRole !== "ADMIN" && system.ownerId !== userId) {
    throw new Error("Access denied");
  }

  await prisma.system.delete({ where: { id } });
  return { message: "System deleted" };
}
