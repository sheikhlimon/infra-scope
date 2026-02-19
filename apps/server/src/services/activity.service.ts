import { prisma } from "@infra-scope/db";

export async function logActivity(action: string, userId: number, systemId?: number) {
  await prisma.activityLog.create({
    data: {
      action,
      userId,
      systemId,
    },
  });
}

export async function getActivityLogs(userId: number, userRole: string) {
  if (userRole === "ADMIN") {
    return await prisma.activityLog.findMany({
      include: {
        user: { select: { id: true, email: true } },
        system: { select: { id: true, hostname: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return await prisma.activityLog.findMany({
    where: { userId },
    include: {
      user: { select: { id: true, email: true } },
      system: { select: { id: true, hostname: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
