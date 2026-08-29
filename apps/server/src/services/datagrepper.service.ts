export interface FedoraLiveEvent {
  id: string;
  category: "buildsys" | "bodhi" | "ansible" | "other";
  action: string;
  host?: string;
  summary: string;
  timestamp: string;
  url?: string;
}

export async function fetchFedoraLiveEvents(limit = 25): Promise<FedoraLiveEvent[]> {
  const url = `https://apps.fedoraproject.org/datagrepper/raw?rows_per_page=${limit}&category=buildsys&category=bodhi&category=ansible`;

  try {
    const controller = new globalThis.AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), 6000);

    const response = await globalThis.fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    globalThis.clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Datagrepper returned status ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json();
    const rawMessages = data.raw_messages || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rawMessages.map((msgItem: any, index: number): FedoraLiveEvent => {
      const topic = String(msgItem.topic || "");
      const msg = msgItem.msg || {};
      const info = msg.info || {};

      let category: FedoraLiveEvent["category"] = "other";
      let action = "FEDORA_EVENT";
      let summary = topic;
      let host: string | undefined = undefined;
      let eventUrl: string | undefined = undefined;

      // Extract server hostname if available
      if (info.host_name) {
        host = String(info.host_name);
      } else if (msg.host) {
        host = String(msg.host);
      } else if (typeof msgItem.host === "string") {
        host = msgItem.host;
      }

      if (topic.includes("buildsys")) {
        category = "buildsys";

        if (topic.includes("build.state.change")) {
          const nvr = msg.name ? `${msg.name}-${msg.version}-${msg.release}` : "";
          const stateMap: Record<number, string> = {
            0: "BUILDING",
            1: "COMPLETE",
            2: "DELETED",
            3: "FAILED",
            4: "CANCELED",
          };
          const stateName = stateMap[msg.new] || (msg.new === 1 ? "COMPLETE" : "UPDATE");
          action = `KOJI_BUILD_${stateName}`;
          summary = nvr ? `${nvr} (${stateName})` : `Build #${msg.build_id || msg.task_id || ""}`;
          if (msg.build_id) {
            eventUrl = `https://koji.fedoraproject.org/koji/buildinfo?buildID=${msg.build_id}`;
          }
        } else if (topic.includes("buildsys.tag")) {
          const nvr = msg.name ? `${msg.name}-${msg.version}-${msg.release}` : "";
          action = "KOJI_TAG";
          summary = nvr ? `Tagged ${nvr} → ${msg.tag || ""}` : `Tag ${msg.tag || ""}`;
          if (msg.build_id) {
            eventUrl = `https://koji.fedoraproject.org/koji/buildinfo?buildID=${msg.build_id}`;
          }
        } else {
          const method = info.method || "build";
          const arch = info.arch ? ` (${info.arch})` : "";
          action = `KOJI_${String(method).toUpperCase()}`;

          const reqPackage =
            Array.isArray(info.request) && typeof info.request[0] === "string"
              ? info.request[0].split("/").pop()
              : info.label || "";

          summary = reqPackage
            ? `${method}${arch}: ${reqPackage}`
            : `Task #${info.id || msg.id || msgItem.msg_id || ""}${arch}`;

          const taskId = info.id || msg.id || msg.task_id;
          if (taskId) {
            eventUrl = `https://koji.fedoraproject.org/koji/taskinfo?taskID=${taskId}`;
          }
        }
      } else if (topic.includes("bodhi")) {
        category = "bodhi";
        action = "BODHI_UPDATE";
        const updateTitle = msg.update?.title || msg.title || "";
        summary = updateTitle ? `Update: ${updateTitle}` : "Bodhi update activity";
        if (msg.update?.alias) {
          eventUrl = `https://bodhi.fedoraproject.org/updates/${msg.update.alias}`;
        }
      } else if (topic.includes("ansible")) {
        category = "ansible";
        action = "ANSIBLE_PLAYBOOK";
        summary = msg.playbook ? `Playbook: ${msg.playbook}` : "Ansible playbook execution";
      }

      const timestampIso = msgItem.timestamp
        ? new Date(msgItem.timestamp * 1000).toISOString()
        : new Date().toISOString();

      return {
        id: String(msgItem.msg_id || `${info.id || "evt"}-${index}`),
        category,
        action,
        host,
        summary,
        timestamp: timestampIso,
        url: eventUrl,
      };
    });
  } catch (error) {
    console.error("Failed to fetch from Datagrepper:", (error as Error).message);
    return [];
  }
}
