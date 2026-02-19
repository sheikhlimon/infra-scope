import { z } from "zod";

export const systemStatusEnum = z.enum(["ACTIVE", "INACTIVE", "SCANNING", "ERROR"], {
  errorMap: () => ({ message: "Status must be ACTIVE, INACTIVE, SCANNING, or ERROR" }),
});

export const createSystemSchema = z.object({
  hostname: z.string().min(1, "Hostname is required"),
  ipAddress: z.string().min(1, "IP address is required"),
  os: z.string().min(1, "OS is required"),
  cpuCores: z.number().int().positive().optional(),
  memoryGB: z.number().int().positive().optional(),
  status: systemStatusEnum.optional(),
  connectionType: z.string().optional(),
  credentialsConfigured: z.boolean().optional(),
});

export const updateSystemSchema = z.object({
  hostname: z.string().min(1, "Hostname is required").optional(),
  ipAddress: z.string().min(1, "IP address is required").optional(),
  os: z.string().min(1, "OS is required").optional(),
  cpuCores: z.number().int().positive().optional(),
  memoryGB: z.number().int().positive().optional(),
  status: systemStatusEnum.optional(),
  connectionType: z.string().optional(),
  credentialsConfigured: z.boolean().optional(),
});

export type CreateSystemInput = z.infer<typeof createSystemSchema>;
export type UpdateSystemInput = z.infer<typeof updateSystemSchema>;
