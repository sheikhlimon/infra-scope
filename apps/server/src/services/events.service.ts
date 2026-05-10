import { EventEmitter } from "events";

export interface SSEEventMap {
  "system.status_changed": { systemId: number; status: string; hostname: string };
  "system.created": { systemId: number; hostname: string; ownerId: number };
  "system.updated": { systemId: number; hostname: string };
  "system.deleted": { systemId: number; hostname: string };
  "activity.new": { action: string; userId: number; systemId?: number };
  "stats.updated": Record<string, never>;
}

interface SSEPayload<K extends keyof SSEEventMap> {
  event: K;
  data: SSEEventMap[K];
  timestamp: string;
}

class InfraEventEmitter extends EventEmitter {
  emitEvent<K extends keyof SSEEventMap>(event: K, data: SSEEventMap[K]): void {
    this.emit(event, { event, data, timestamp: new Date().toISOString() } as SSEPayload<K>);
  }
}

export const infraEvents = new InfraEventEmitter();
