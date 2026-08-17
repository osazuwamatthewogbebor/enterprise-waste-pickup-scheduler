"use server";

import prisma from "@/src/lib/prisma";
import { getSessionUser } from "@/src/lib/with-tenant";
import { ok, fail } from "@/src/lib/result";
import type { ActionResult } from "@/src/lib/result";
import { normalizeNigerianPhone, isValidNigerianPhone } from "@/src/lib/phone";
import bcrypt from "bcrypt";
import { z } from "zod";

const createDriverSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().refine((s: string) => isValidNigerianPhone(s), "Invalid Nigerian phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  zoneId: z.string().optional(),
});

export async function createDriver(_prevState: unknown, formData: FormData): Promise<ActionResult<any>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN") return fail("Forbidden");

  const raw = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    zoneId: formData.get("zoneId") || undefined,
  };

  const parsed = createDriverSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const normalized = normalizeNigerianPhone(parsed.data.phone);
  if (!normalized) return fail("Invalid phone number");

  const existing = await prisma.user.findUnique({
    where: { phone: normalized },
  });
  if (existing) return fail("A user with this phone number already exists");

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const driver = await prisma.user.create({
    data: {
      organizationId: user.organizationId,
      email: null,
      phone: normalized,
      passwordHash,
      role: "DRIVER",
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      accountStatus: "CLAIMED",
      zoneId: parsed.data.zoneId ?? null,
    },
  });

  return ok({ id: driver.id });
}

const updateDriverSchema = z.object({
  driverId: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().refine((s: string) => isValidNigerianPhone(s), "Invalid Nigerian phone number"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  zoneId: z.string().optional(),
});

export async function updateDriver(_prevState: unknown, formData: FormData): Promise<ActionResult<any>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN") return fail("Forbidden");

  const raw = {
    driverId: formData.get("driverId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    password: formData.get("password") || undefined,
    zoneId: formData.get("zoneId") || undefined,
  };

  const parsed = updateDriverSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const normalized = normalizeNigerianPhone(parsed.data.phone);
  if (!normalized) return fail("Invalid phone number");

  const data: any = {
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    phone: normalized,
    zoneId: parsed.data.zoneId ?? null,
  };

  if (parsed.data.password) {
    data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  }

  const driver = await prisma.user.update({
    where: { id: parsed.data.driverId },
    data,
  });

  return ok({ id: driver.id });
}

export async function deleteDriver(_prevState: unknown, formData: FormData): Promise<ActionResult<any>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN") return fail("Forbidden");

  const driverId = formData.get("driverId") as string;
  if (!driverId) return fail("Driver ID is required");

  const driver = await prisma.user.findFirst({
    where: { id: driverId, organizationId: user.organizationId, role: "DRIVER" },
    select: { id: true },
  });

  if (!driver) return fail("Driver not found");

  await prisma.user.update({
    where: { id: driverId },
    data: { accountStatus: "UNCLAIMED" },
  });

  return ok({ deleted: true });
}

const driverRowSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().refine((s: string) => isValidNigerianPhone(s), "Invalid Nigerian phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  zoneId: z.string().optional(),
});

export async function importDrivers(_prevState: unknown, formData: FormData): Promise<ActionResult<any>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN") return fail("Forbidden");

  const file = formData.get("file") as File;
  if (!file) return fail("No file provided");

  const text = await file.text();
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h: string) => h.trim());

  const requiredCols = ["firstName", "lastName", "phone", "password"];
  const missing = requiredCols.filter((col) => !headers.includes(col));
  if (missing.length > 0) {
    return fail(`Missing required columns: ${missing.join(", ")}`);
  }

  const results = { created: 0, updated: 0, skipped: 0, errors: [] as Array<{ row: number; message: string }> };

  const allZones = await prisma.zone.findMany({
    where: { organizationId: user.organizationId },
    select: { id: true, name: true },
  });

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = lines[i].split(",");
    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => {
      raw[h] = cols[idx]?.trim() ?? "";
    });

    const parsed = driverRowSchema.safeParse(raw);
    if (!parsed.success) {
      const firstIssue = (parsed.error as any).issues?.[0]?.message ?? "Validation error";
      results.errors.push({ row: i + 1, message: firstIssue as string });
      results.skipped++;
      continue;
    }

    const normalized = normalizeNigerianPhone(parsed.data.phone);
    if (!normalized) {
      results.errors.push({ row: i + 1, message: "Invalid phone number" });
      results.skipped++;
      continue;
    }

    let resolvedZoneId: string | null = null;
    if (parsed.data.zoneId) {
      const zone = allZones.find((z) => z.name === parsed.data.zoneId || z.id === parsed.data.zoneId);
      if (zone) resolvedZoneId = zone.id;
    }

    try {
      const passwordHash = await bcrypt.hash(parsed.data.password, 10);
      const existing = await prisma.user.findUnique({ where: { phone: normalized } });

      if (existing) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            passwordHash,
            role: "DRIVER",
            accountStatus: "CLAIMED",
            zoneId: resolvedZoneId ?? null,
            organizationId: user.organizationId,
          },
        });
        results.updated++;
      } else {
        await prisma.user.create({
          data: {
            organizationId: user.organizationId,
            email: null,
            phone: normalized,
            passwordHash,
            role: "DRIVER",
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            accountStatus: "CLAIMED",
            zoneId: resolvedZoneId ?? null,
          },
        });
        results.created++;
      }
    } catch {
      results.errors.push({ row: i + 1, message: "Database error" });
    }
  }

  return ok(results);
}
