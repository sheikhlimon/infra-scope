import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { infraEvents } from "../services/events.service.js";
import type { SSEEventMap } from "../services/events.service.js";

const clients = new Set<Response>();

const EVENT_NAMES: (keyof SSEEventMap)[] = [
  "system.status_changed",
  "system.created",
  "system.updated",
  "system.deleted",
  "activity.new",
  "stats.updated",
];

export function sseHandler(req: AuthRequest, res: Response): void {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  res.write(`event: connected\ndata: {}\n\n`);

  const forwardEvent = (payload: { event: string; data: unknown; timestamp: string }) => {
    res.write(`event: ${payload.event}\ndata: ${JSON.stringify(payload)}\n\n`);
  };

  EVENT_NAMES.forEach((name) => infraEvents.on(name, forwardEvent));
  clients.add(res);

  // eslint-disable-next-line no-undef
  const heartbeat = setInterval(() => {
    res.write(`:heartbeat\n\n`);
  }, 30000);

  req.on("close", () => {
    // eslint-disable-next-line no-undef
    clearInterval(heartbeat);
    EVENT_NAMES.forEach((name) => infraEvents.off(name, forwardEvent));
    clients.delete(res);
  });
}
