"use client";

import { useEffect, useState, createElement, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useSSEEvents } from "@/contexts/sse-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  UserPlus,
  Server,
  RefreshCw,
  Trash2,
  Edit,
  Key,
  ExternalLink,
  Radio,
  Cpu,
  Package,
} from "lucide-react";

interface ActivityLog {
  id: number;
  action: string;
  userId: number;
  systemId: number | null;
  createdAt: string;
  user: {
    id: number;
    email: string;
  };
  system?: {
    id: number;
    hostname: string;
  };
}

interface FedoraLiveEvent {
  id: string;
  category: "buildsys" | "bodhi" | "ansible" | "other";
  action: string;
  host?: string;
  summary: string;
  timestamp: string;
  url?: string;
}

const actionConfig: Record<
  string,
  {
    label: string;
    iconName: "user-plus" | "key" | "server" | "edit" | "trash-2" | "refresh-cw" | "file-text";
    color: string;
    bg: string;
  }
> = {
  "user.registered": {
    label: "USER_REGISTERED",
    iconName: "user-plus",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
  },
  "user.login": {
    label: "USER_LOGIN",
    iconName: "key",
    color: "text-foreground",
    bg: "bg-muted/50 border-border/60",
  },
  "system.created": {
    label: "SYSTEM_CREATED",
    iconName: "server",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
  },
  "system.updated": {
    label: "SYSTEM_UPDATED",
    iconName: "edit",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  "system.deleted": {
    label: "SYSTEM_DELETED",
    iconName: "trash-2",
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-200",
  },
  "system.scanned": {
    label: "SYSTEM_SCANNED",
    iconName: "refresh-cw",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
  "ansible.synced": {
    label: "ANSIBLE_SYNCED",
    iconName: "refresh-cw",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
  },
};

const iconMap: Record<string, React.ElementType> = {
  "user-plus": UserPlus,
  key: Key,
  server: Server,
  edit: Edit,
  "trash-2": Trash2,
  "refresh-cw": RefreshCw,
  "file-text": FileText,
};

const getActionConfig = (action: string) => {
  return (
    actionConfig[action] || {
      label: action.toUpperCase().replace(".", "_"),
      iconName: "file-text",
      color: "text-muted-foreground",
      bg: "bg-muted/30 border-border/50",
    }
  );
};

export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState<"audit" | "fedora">("audit");
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [fedoraEvents, setFedoraEvents] = useState<FedoraLiveEvent[]>([]);
  const [fedoraLoading, setFedoraLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscribe } = useSSEEvents();

  const fetchLogs = useCallback(async () => {
    try {
      const data = await api.get<ActivityLog[]>("/activity");
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({
        title: "Failed to load activity",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchFedoraEvents = useCallback(async () => {
    setFedoraLoading(true);
    try {
      const data = await api.get<FedoraLiveEvent[]>("/activity/fedora-live");
      setFedoraEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({
        title: "Failed to load Fedora stream",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setFedoraLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    const unsub = subscribe("activity.new", () => fetchLogs());
    return unsub;
  }, [subscribe, fetchLogs]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-mono font-bold tracking-tight">ACTIVITY_STREAM</h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            {activeTab === "audit"
              ? user.role === "ADMIN"
                ? "System-wide local audit trail (PostgreSQL)"
                : "Your local activity history"
              : "Live real-time infrastructure and build events from Fedora Messaging"}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-border/60 p-1 rounded-sm bg-muted/20">
            <button
              onClick={() => setActiveTab("audit")}
              className={`px-3 py-1 text-xs font-mono rounded-sm transition-colors ${
                activeTab === "audit"
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              LOCAL_AUDIT_LOG
            </button>
            <button
              onClick={() => {
                setActiveTab("fedora");
                if (fedoraEvents.length === 0) fetchFedoraEvents();
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-sm transition-colors ${
                activeTab === "fedora"
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              FEDORA_LIVE_FEED
            </button>
          </div>

          {activeTab === "fedora" && (
            <Button
              variant="outline"
              size="sm"
              onClick={fetchFedoraEvents}
              disabled={fedoraLoading}
              className="font-mono text-xs h-8 rounded-sm"
            >
              <RefreshCw className={`h-3 w-3 mr-1.5 ${fedoraLoading ? "animate-spin" : ""}`} />
              REFRESH
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <Card className="border-border/60 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/30" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/30" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/30" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/30" />

        <div className="p-6">
          {activeTab === "audit" ? (
            /* Tab 1: Local Audit Log */
            loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs text-muted-foreground font-mono">LOADING_AUDIT_LOGS...</p>
                </div>
              </div>
            ) : !logs || logs.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 rounded-full border-2 border-dashed border-border/60 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">NO_ACTIVITY_LOGS_FOUND</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => {
                  const config = getActionConfig(log.action);
                  const timestamp = new Date(log.createdAt);
                  const dateStr = timestamp.toLocaleDateString();
                  const timeStr = timestamp.toLocaleTimeString();

                  return (
                    <div
                      key={log.id}
                      className={`group flex gap-3 sm:gap-4 py-3 ${
                        index !== logs.length - 1 ? "border-b border-border/40" : ""
                      } hover:bg-muted/5 transition-colors`}
                    >
                      <div className="hidden sm:flex flex-shrink-0 w-32 text-right">
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-muted-foreground font-mono">{dateStr}</p>
                          <p className="text-xs font-mono">{timeStr}</p>
                        </div>
                      </div>

                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div
                          className={`h-8 w-8 rounded border flex items-center justify-center ${config.bg}`}
                        >
                          {createElement(iconMap[config.iconName], {
                            className: `h-4 w-4 ${config.color}`,
                          })}
                        </div>
                        {index !== logs.length - 1 && (
                          <div className="w-px flex-1 bg-border/40 min-h-[3rem]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 sm:gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-mono uppercase px-2 py-0.5 ${config.bg} ${config.color}`}
                              >
                                {config.label}
                              </Badge>
                              {user.role === "ADMIN" && (
                                <span className="text-xs text-muted-foreground font-mono">
                                  by {log.user.email}
                                </span>
                              )}
                            </div>
                            {log.system && (
                              <p className="text-xs text-muted-foreground font-mono">
                                System:{" "}
                                <span className="text-foreground">{log.system.hostname}</span>
                              </p>
                            )}
                            <p className="sm:hidden text-[10px] text-muted-foreground font-mono">
                              {dateStr} {timeStr}
                            </p>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            #{log.id.toString().padStart(4, "0")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : /* Tab 2: Fedora Live Feed */
          fedoraLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground font-mono">
                  FETCHING_LIVE_FEDORA_MESSAGES...
                </p>
              </div>
            </div>
          ) : !fedoraEvents || fedoraEvents.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Radio className="h-8 w-8 text-muted-foreground/40 animate-pulse" />
                <p className="text-xs text-muted-foreground font-mono">
                  NO_FEDORA_LIVE_EVENTS_RECEIVED
                </p>
                <Button size="sm" variant="outline" onClick={fetchFedoraEvents}>
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {fedoraEvents.map((evt, index) => {
                const timestamp = new Date(evt.timestamp);
                const dateStr = timestamp.toLocaleDateString();
                const timeStr = timestamp.toLocaleTimeString();

                const isKoji = evt.category === "buildsys";
                const isBodhi = evt.category === "bodhi";
                const isAnsible = evt.category === "ansible";

                const badgeClass = isKoji
                  ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                  : isBodhi
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : isAnsible
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-muted/30 text-muted-foreground border-border/50";

                const IconComp = isKoji ? Cpu : isBodhi ? Package : Server;

                return (
                  <div
                    key={`${evt.id}-${index}`}
                    className={`group flex gap-3 sm:gap-4 py-3 ${
                      index !== fedoraEvents.length - 1 ? "border-b border-border/40" : ""
                    } hover:bg-muted/5 transition-colors`}
                  >
                    <div className="hidden sm:flex flex-shrink-0 w-32 text-right">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground font-mono">{dateStr}</p>
                        <p className="text-xs font-mono">{timeStr}</p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div
                        className={`h-8 w-8 rounded border flex items-center justify-center ${badgeClass}`}
                      >
                        <IconComp className="h-4 w-4" />
                      </div>
                      {index !== fedoraEvents.length - 1 && (
                        <div className="w-px flex-1 bg-border/40 min-h-[3rem]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-mono uppercase px-2 py-0.5 ${badgeClass}`}
                            >
                              {evt.action}
                            </Badge>
                            {evt.host && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-muted/40 text-foreground border border-border/40">
                                <Server className="h-3 w-3 text-primary" />
                                {evt.host}
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-mono text-muted-foreground line-clamp-2">
                            {evt.summary}
                          </p>

                          <p className="sm:hidden text-[10px] text-muted-foreground font-mono">
                            {dateStr} {timeStr}
                          </p>
                        </div>

                        {evt.url && (
                          <a
                            href={evt.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary p-1.5 rounded transition-colors"
                            title="Open in Fedora tool"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
