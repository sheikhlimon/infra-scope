import { exec } from "child_process";
import net from "net";
import { prisma } from "@infra-scope/db";
import type { CreateSystemInput, UpdateSystemInput } from "../schemas/system.schema.js";
import * as ActivityService from "../services/activity.service.js";
import { infraEvents } from "./events.service.js";

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
  await ActivityService.logActivity("system.created", userId, system.id);
  infraEvents.emitEvent("system.created", {
    systemId: system.id,
    hostname: system.hostname,
    ownerId: userId,
  });
  infraEvents.emitEvent("stats.updated", {});
  return system;
}

export async function getSystems(userId: number, userRole: string, page = 1, limit = 10) {
  const where = userRole === "ADMIN" ? {} : { ownerId: userId };
  const skip = (page - 1) * limit;

  const [systems, total] = await Promise.all([
    prisma.system.findMany({
      where,
      include: { owner: { select: { id: true, email: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.system.count({ where }),
  ]);

  return {
    systems,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
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

export async function updateSystem(
  id: number,
  userId: number,
  userRole: string,
  data: UpdateSystemInput
) {
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

  await ActivityService.logActivity("system.updated", userId, updated.id);
  infraEvents.emitEvent("system.updated", { systemId: updated.id, hostname: updated.hostname });
  infraEvents.emitEvent("stats.updated", {});
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
  await ActivityService.logActivity("system.deleted", userId, id);
  infraEvents.emitEvent("system.deleted", { systemId: id, hostname: system.hostname });
  infraEvents.emitEvent("stats.updated", {});
  return { message: "System deleted" };
}

interface ProbeResult {
  status: "ACTIVE" | "ERROR";
  latencyMs: number;
  method: "ping" | "tcp" | "unreachable";
}

export function probeSystem(hostname: string, ipAddress: string): Promise<ProbeResult> {
  return new Promise((resolve) => {
    const start = Date.now();
    const target = hostname && !hostname.includes(" ") ? hostname : ipAddress;

    // Fast, credential-free reachability check (no SSH login or OTP required)
    exec(`ping -c 1 -W 2 ${target}`, { timeout: 3000 }, (pingError) => {
      const latencyMs = Date.now() - start;
      if (!pingError) {
        return resolve({
          status: "ACTIVE",
          latencyMs,
          method: "ping",
        });
      }

      // Cloud container fallback: test TCP handshake on standard port 443
      // Render containers often block raw ICMP echo sockets while permitting standard TCP traffic
      const socket = new net.Socket();
      socket.setTimeout(2500);

      const onConnect = () => {
        socket.destroy();
        resolve({
          status: "ACTIVE",
          latencyMs: Date.now() - start,
          method: "tcp",
        });
      };

      const onError = () => {
        socket.destroy();
        resolve({
          status: "ERROR",
          latencyMs: Date.now() - start,
          method: "unreachable",
        });
      };

      socket.once("connect", onConnect);
      socket.once("timeout", onError);
      socket.once("error", onError);

      socket.connect(443, target);
    });
  });
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
  infraEvents.emitEvent("system.status_changed", {
    systemId: id,
    status: "SCANNING",
    hostname: system.hostname,
  });

  // Execute real live probe
  const probe = await probeSystem(system.hostname, system.ipAddress);

  const updated = await prisma.system.update({
    where: { id },
    data: {
      status: probe.status,
      lastScannedAt: new Date(),
    },
    include: { owner: { select: { id: true, email: true } } },
  });

  await ActivityService.logActivity(
    `system.scanned (${probe.method}: ${probe.status}, ${probe.latencyMs}ms)`,
    userId,
    updated.id
  );
  infraEvents.emitEvent("system.status_changed", {
    systemId: updated.id,
    status: updated.status,
    hostname: updated.hostname,
  });
  infraEvents.emitEvent("stats.updated", {});
  return updated;
}

export async function getSystemStats(userId: number, userRole: string) {
  const where = userRole === "ADMIN" ? {} : { ownerId: userId };

  const [total, byStatus, byOS, recent] = await Promise.all([
    prisma.system.count({ where }),
    prisma.system.groupBy({
      by: ["status"],
      where,
      _count: { status: true },
    }),
    prisma.system.groupBy({
      by: ["os"],
      where,
      _count: { os: true },
      orderBy: { _count: { os: "desc" } },
      take: 6,
    }),
    prisma.activityLog.findMany({
      where: userRole === "ADMIN" ? {} : { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { email: true } }, system: { select: { hostname: true } } },
    }),
  ]);

  return { total, byStatus, byOS, recent };
}
