import { prisma } from "@infra-scope/db";
import type { CreateSystemInput, UpdateSystemInput } from "../schemas/system.schema.js";
import * as ActivityService from "../services/activity.service.js";

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
  await ActivityService.logActivity(`created system ${system.hostname}`, userId, system.id);
  return system;
}

export async function getSystems(userId: number, userRole: string) {
  // Admins see all systems, users only see their own
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

  await ActivityService.logActivity(`updated system ${updated.hostname}`, userId, updated.id);
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
  await ActivityService.logActivity(`deleted system ${system.hostname}`, userId, id);
  return { message: "System deleted" };
}

export async function scanSystem(id: number, userId: number, userRole: string) {
  const system = await prisma.system.findUnique({ where: { id } });

  if (!system) {
    throw new Error("System not found");
  }

  if (userRole !== "ADMIN" && system.ownerId !== userId) {
    throw new Error("Access denied");
  }

  // Set status to scanning
  await prisma.system.update({ where: { id }, data: { status: "SCANNING" } });

  // Simulate scan delay (3 seconds)
  await new Promise(resolve => {
    // eslint-disable-next-line no-undef
    setTimeout(resolve, 3000);
  });

  // 80% success rate
  const success = Math.random() > 0.2;
  const status = success ? "ACTIVE" : "ERROR";

  const updated = await prisma.system.update({
    where: { id },
    data: { status, lastScannedAt: new Date() },
    include: { owner: { select: { id: true, email: true } } },
  });

  await ActivityService.logActivity(`scanned system ${updated.hostname} (${status.toLowerCase()})`, userId, updated.id);
  return updated;
}
