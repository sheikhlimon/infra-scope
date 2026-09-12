import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import yaml from "yaml";

const prisma = new PrismaClient();

function resolveInventoryDir(): string {
  if (process.env.ANSIBLE_INVENTORY_PATH && fs.existsSync(process.env.ANSIBLE_INVENTORY_PATH)) {
    return process.env.ANSIBLE_INVENTORY_PATH;
  }
  const cwd = process.cwd();
  const candidates = [path.resolve(cwd, "inventory")];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }

  if (!process.env.ANSIBLE_INVENTORY_PATH) {
    throw new Error("ANSIBLE_INVENTORY_PATH environment variable is required but not set.");
  }

  return process.env.ANSIBLE_INVENTORY_PATH;
}

const DEFAULT_INVENTORY_DIR = resolveInventoryDir();
const ADMIN_EMAIL = "admin@infrascope.dev";

export interface ParsedAnsibleHost {
  hostname: string;
  ipAddress: string;
  os: string;
  cpuCores: number;
  memoryGB: number;
  datacenter?: string;
  vmhost?: string;
  groups: string[];
}

export function parseAnsibleInventory(inventoryDir = DEFAULT_INVENTORY_DIR): ParsedAnsibleHost[] {
  if (!fs.existsSync(inventoryDir)) {
    throw new Error(`Ansible inventory directory not found at: ${inventoryDir}`);
  }

  const hostVarsDir = path.join(inventoryDir, "host_vars");
  const hostGroups = new Map<string, Set<string>>();
  const invFiles = ["inventory", "builders", "hardware", "cloud", "backups"];

  // Parse inventory group memberships
  for (const file of invFiles) {
    const fPath = path.join(inventoryDir, file);
    if (!fs.existsSync(fPath)) continue;

    const lines = fs.readFileSync(fPath, "utf8").split("\n");
    let currentGroup: string | null = null;

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith("#") || line.startsWith(";")) continue;

      if (line.startsWith("[") && line.endsWith("]")) {
        currentGroup = line.slice(1, -1).split(":")[0]?.trim() || null;
      } else if (currentGroup && !line.startsWith("[")) {
        const host = line.split(/\s+/)[0];
        if (host) {
          if (!hostGroups.has(host)) {
            hostGroups.set(host, new Set());
          }
          hostGroups.get(host)!.add(currentGroup);
        }
      }
    }
  }

  if (!fs.existsSync(hostVarsDir)) {
    throw new Error(`host_vars directory not found at: ${hostVarsDir}`);
  }

  const files = fs.readdirSync(hostVarsDir);
  const parsedHosts: ParsedAnsibleHost[] = [];

  for (const file of files) {
    const filePath = path.join(hostVarsDir, file);
    try {
      const content = fs.readFileSync(filePath, "utf8");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = yaml.parse(content) || {};
      const hostname = file;

      // Extract IP address from various possible host_vars fields
      let ip =
        data.eth0_ipv4_ip ||
        data.br0_ipv4_ip ||
        data.public_ip ||
        data.ip ||
        (data.network_connections &&
          data.network_connections[0]?.ip?.address?.[0]?.split("/")[0]) ||
        "";

      // Fallback or cleanup jinja expressions
      if (typeof ip !== "string" || ip.includes("{{") || !ip) {
        ip = hostname;
      }

      // Infer operating system from kickstart URLs or release definitions
      let os = "Fedora Linux";
      const ks = String(
        (data.ks_repo || "") + " " + (data.ks_url || "") + " " + (data.fedora_release || "")
      );

      if (/RHEL10|rhel-10/i.test(ks)) os = "Red Hat Enterprise Linux 10";
      else if (/RHEL9|rhel-9/i.test(ks)) os = "Red Hat Enterprise Linux 9";
      else if (/RHEL8|rhel-8/i.test(ks)) os = "Red Hat Enterprise Linux 8";
      else if (/CentOS/i.test(ks)) os = "CentOS Stream";
      else if (/releases\/44/i.test(ks)) os = "Fedora 44 Server";
      else if (/releases\/43/i.test(ks)) os = "Fedora 43 Server";
      else if (/releases\/42/i.test(ks)) os = "Fedora 42 Server";
      else if (/releases\/41/i.test(ks)) os = "Fedora 41 Server";
      else if (/releases\/40/i.test(ks)) os = "Fedora 40 Server";

      const groups = Array.from(hostGroups.get(hostname) || []);

      // Extract CPU cores
      let cpuCores = 4;
      if (data.num_cpus) cpuCores = parseInt(String(data.num_cpus), 10) || 4;
      else if (data.cpus) cpuCores = parseInt(String(data.cpus), 10) || 4;
      else if (/buildhw|bvmhost|vmhost/i.test(hostname)) cpuCores = 32;
      else if (/db-|koji/i.test(hostname)) cpuCores = 16;
      else if (/buildvm/i.test(hostname)) cpuCores = 8;

      // Extract Memory in GB
      let memoryGB = 8;
      const rawMem = data.mem_size || data.max_mem_size || data.memory;
      if (rawMem && !String(rawMem).includes("{{")) {
        const parsed = parseInt(String(rawMem), 10);
        if (parsed > 0) {
          memoryGB = parsed >= 1024 ? Math.round(parsed / 1024) : parsed;
        }
      } else if (/buildhw|bvmhost|vmhost/i.test(hostname)) {
        memoryGB = 128;
      } else if (/db-|koji/i.test(hostname)) {
        memoryGB = 64;
      } else if (/buildvm/i.test(hostname)) {
        memoryGB = 16;
      }

      if (!isPublicEdgeHost(hostname, ip)) {
        continue;
      }

      parsedHosts.push({
        hostname,
        ipAddress: ip.trim(),
        os,
        cpuCores,
        memoryGB,
        datacenter: data.datacenter,
        vmhost: data.vmhost,
        groups: groups.slice(0, 5),
      });
    } catch {
      // Continue parsing remaining files if one fails
    }
  }

  return parsedHosts;
}

export function isPublicEdgeHost(hostname: string, ip: string): boolean {
  const h = hostname.toLowerCase();

  // Exclude private RFC1918 subnets
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("172.")) {
    return false;
  }

  // Exclude internal datacenter domains
  if (h.includes(".rdu3.") || h.includes(".stg.") || h.includes(".s390.")) {
    return false;
  }

  // Include public Fedora edge infrastructure
  if (
    h.includes("proxy") ||
    h.includes("bastion") ||
    h.includes("ns0") ||
    h.includes("ns1") ||
    h.includes("torrent") ||
    h.includes("download") ||
    h.includes("copr-fe") ||
    h.includes("people") ||
    h.includes("aarch64-test") ||
    h.includes("osuosl") ||
    h.includes("ibiblio")
  ) {
    return true;
  }

  // Public IPv4 addresses
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    return true;
  }

  return false;
}

async function main() {
  console.log("Parsing Fedora Ansible inventory...");
  const hosts = parseAnsibleInventory();
  console.log(`Found ${hosts.length} hosts in inventory.`);

  // Find admin user to assign ownership
  let admin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (!admin) {
    admin = await prisma.user.findFirst();
  }

  if (!admin) {
    throw new Error("No user found in database. Run 'npm run db:seed' first.");
  }

  // Remove mock preseed data
  const mockHostnames = ["web-server-1", "web-server-2", "Candice Mcclain"];
  const deletedMock = await prisma.system.deleteMany({
    where: {
      hostname: { in: mockHostnames },
    },
  });
  if (deletedMock.count > 0) {
    console.log(`Removed ${deletedMock.count} mock preseeded systems.`);
  }

  // Prune internal private hosts not in the public edge fleet
  const activeEdgeHostnames = hosts.map((h) => h.hostname);
  const pruned = await prisma.system.deleteMany({
    where: {
      hostname: { notIn: activeEdgeHostnames },
    },
  });
  if (pruned.count > 0) {
    console.log(`Pruned ${pruned.count} internal private hosts from database.`);
  }

  // Fetch all existing systems to avoid duplicate inserts
  const existing = await prisma.system.findMany({
    select: { id: true, hostname: true },
  });
  const existingMap = new Map(existing.map((s) => [s.hostname, s.id]));

  let createdCount = 0;
  let updatedCount = 0;

  // Process in concurrent batches for speed
  const BATCH_SIZE = 25;
  for (let i = 0; i < hosts.length; i += BATCH_SIZE) {
    const batch = hosts.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (host) => {
        const existingId = existingMap.get(host.hostname);
        if (existingId) {
          await prisma.system.update({
            where: { id: existingId },
            data: {
              ipAddress: host.ipAddress,
              os: host.os,
              cpuCores: host.cpuCores,
              memoryGB: host.memoryGB,
              status: "ACTIVE",
              connectionType: "ansible",
              credentialsConfigured: true,
            },
          });
          updatedCount++;
        } else {
          await prisma.system.create({
            data: {
              hostname: host.hostname,
              ipAddress: host.ipAddress,
              os: host.os,
              cpuCores: host.cpuCores,
              memoryGB: host.memoryGB,
              connectionType: "ansible",
              credentialsConfigured: true,
              status: "ACTIVE",
              ownerId: admin.id,
            },
          });
          createdCount++;
        }
      })
    );
  }

  console.log(`✓ Inventory sync complete:`);
  console.log(`  Created: ${createdCount}`);
  console.log(`  Updated: ${updatedCount}`);
  console.log(`  Total managed hosts: ${createdCount + updatedCount}`);
}

if (process.argv[1]?.endsWith("sync-ansible.ts")) {
  main()
    .catch((e) => {
      console.error("Sync error:", e.message);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
