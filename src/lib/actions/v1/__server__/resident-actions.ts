"use server";

import prisma from "@/src/lib/prisma";
import { getSessionUser } from "@/src/lib/with-tenant";
import { ok, fail } from "@/src/lib/result";
import type { ActionResult } from "@/src/lib/result";
import { normalizeNigerianPhone, isValidNigerianPhone } from "@/src/lib/phone";
import bcrypt from "bcrypt";
import { generateTempPassword } from "@/src/lib/password";
import { z } from "zod";

const residentSchema = z.object({
  phone: z.string().refine((s: string) => isValidNigerianPhone(s), "Invalid Nigerian phone number"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  streetAddress: z.string().optional(),
  landmark: z.string().optional(),
  zoneId: z.string().optional(),
});

export async function importResidents(_prevState: unknown, formData: FormData): Promise<ActionResult<any>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN") return fail("Forbidden");

  const file = formData.get("file") as File;
  if (!file) return fail("No file provided");

  const text = await file.text();
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h: string) => h.trim());

  const requiredCols = ["phone", "firstName", "lastName"];
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
    const cols = lines[i].split(",");
    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => {
      raw[h] = cols[idx]?.trim() ?? "";
    });

    const parsed = residentSchema.safeParse(raw);
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
      const existing = allZones.find(
        (z) => z.name === parsed.data.zoneId || z.id === parsed.data.zoneId
      );
      if (existing) {
        resolvedZoneId = existing.id;
      } else {
        const created = await prisma.zone.create({
          data: {
            name: parsed.data.zoneId,
            organizationId: user.organizationId,
          },
        });
        allZones.push(created);
        resolvedZoneId = created.id;
      }
    }

    try {
      const existing = await prisma.user.findUnique({
        where: { phone: normalized },
      });

      if (existing) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            streetAddress: parsed.data.streetAddress ?? null,
            landmark: parsed.data.landmark ?? null,
            zoneId: resolvedZoneId ?? undefined,
            organizationId: user.organizationId,
          },
        });
        results.updated++;
      } else {
        const tempPassword = generateTempPassword();
        await prisma.user.create({
          data: {
            organizationId: user.organizationId,
            phone: normalized,
            email: `${normalized}@example.com`,
            passwordHash: await bcrypt.hash(tempPassword, 10),
            role: "RESIDENT",
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            streetAddress: parsed.data.streetAddress ?? null,
            landmark: parsed.data.landmark ?? null,
            zoneId: resolvedZoneId ?? null,
            accountStatus: "CLAIMED",
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

const updateResidentSchema = z.object({
  residentId: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().refine((s: string) => isValidNigerianPhone(s), "Invalid Nigerian phone number"),
  streetAddress: z.string().optional(),
  landmark: z.string().optional(),
  zoneId: z.string().optional(),
});

export async function updateResident(_prevState: unknown, formData: FormData): Promise<ActionResult<any>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN") return fail("Forbidden");

  const raw = {
    residentId: formData.get("residentId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    streetAddress: (formData.get("streetAddress") as string) || undefined,
    landmark: (formData.get("landmark") as string) || undefined,
    zoneId: (formData.get("zoneId") as string) || undefined,
  };

  const parsed = updateResidentSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const normalized = normalizeNigerianPhone(parsed.data.phone);
  if (!normalized) return fail("Invalid phone number");

  const resident = await prisma.user.findFirst({
    where: { id: parsed.data.residentId, organizationId: user.organizationId, role: "RESIDENT" },
    select: { id: true },
  });
  if (!resident) return fail("Resident not found");

  const dup = await prisma.user.findFirst({
    where: {
      organizationId: user.organizationId,
      phone: normalized,
      NOT: { id: resident.id },
    },
    select: { id: true },
  });
  if (dup) return fail("A resident with this phone number already exists");

  let resolvedZoneId: string | null = null;
  if (parsed.data.zoneId) {
    const allZones = await prisma.zone.findMany({
      where: { organizationId: user.organizationId },
      select: { id: true, name: true },
    });
    const zone = allZones.find((z) => z.id === parsed.data.zoneId || z.name === parsed.data.zoneId);
    if (zone) resolvedZoneId = zone.id;
  }

  await prisma.user.update({
    where: { id: resident.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: normalized,
      streetAddress: parsed.data.streetAddress ?? null,
      landmark: parsed.data.landmark ?? null,
      zoneId: resolvedZoneId ?? null,
    },
  });

  return ok({ updated: true });
}

const toggleBlockSchema = z.object({ residentId: z.string() });

export async function toggleResidentBlock(_prevState: unknown, formData: FormData): Promise<ActionResult<any>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN") return fail("Forbidden");

  const parsed = toggleBlockSchema.safeParse({ residentId: formData.get("residentId") });
  if (!parsed.success) return fail("Invalid input");

  const resident = await prisma.user.findFirst({
    where: { id: parsed.data.residentId, organizationId: user.organizationId, role: "RESIDENT" },
    select: { id: true, accountStatus: true },
  });
  if (!resident) return fail("Resident not found");

  const next = resident.accountStatus === "CLAIMED" ? "UNCLAIMED" : "CLAIMED";
  await prisma.user.update({
    where: { id: resident.id },
    data: { accountStatus: next },
  });

  return ok({ blocked: next === "UNCLAIMED" });
}

const bulkResidentActionSchema = z.object({
  ids: z.string(),
  action: z.enum(["delete", "suspend", "unsuspend", "assignZone"]),
  zoneId: z.string().optional(),
});

export async function bulkResidentAction(_prevState: unknown, formData: FormData): Promise<ActionResult<any>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN") return fail("Forbidden");

  const parsed = bulkResidentActionSchema.safeParse({
    ids: formData.get("ids"),
    action: formData.get("action"),
    zoneId: (formData.get("zoneId") as string) || undefined,
  });
  if (!parsed.success) return fail("Invalid input");

  let ids: string[];
  try {
    ids = JSON.parse(parsed.data.ids);
  } catch {
    return fail("Invalid selection");
  }
  if (!Array.isArray(ids) || ids.length === 0) return fail("No residents selected");

  const valid = await prisma.user.findMany({
    where: {
      id: { in: ids },
      organizationId: user.organizationId,
      role: "RESIDENT",
    },
    select: { id: true },
  });
  const validIds = valid.map((r) => r.id);

  switch (parsed.data.action) {
    case "delete":
      await prisma.$transaction(async (tx) => {
        await tx.pickupStop.deleteMany({ where: { residentId: { in: validIds } } });
        await tx.serviceRequest.deleteMany({ where: { residentId: { in: validIds } } });
        await tx.invoice.deleteMany({ where: { residentId: { in: validIds } } });
        await tx.payment.deleteMany({ where: { residentId: { in: validIds } } });
        await tx.user.deleteMany({ where: { id: { in: validIds }, role: "RESIDENT" } });
      }, { timeout: 60000 });
      return ok({ deleted: validIds.length });

    case "suspend":
      await prisma.user.updateMany({
        where: { id: { in: validIds } },
        data: { accountStatus: "UNCLAIMED" },
      });
      return ok({ updated: validIds.length });

    case "unsuspend":
      await prisma.user.updateMany({
        where: { id: { in: validIds } },
        data: { accountStatus: "CLAIMED" },
      });
      return ok({ updated: validIds.length });

    case "assignZone": {
      if (!parsed.data.zoneId) return fail("Zone is required");
      const zone = await prisma.zone.findFirst({
        where: { id: parsed.data.zoneId, organizationId: user.organizationId },
        select: { id: true },
      });
      if (!zone) return fail("Zone not found");
      await prisma.user.updateMany({
        where: { id: { in: validIds } },
        data: { zoneId: zone.id },
      });
      return ok({ updated: validIds.length });
    }

    default:
      return fail("Unknown action");
  }
}

const deleteResidentSchema = z.object({ residentId: z.string() });

const createResidentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().refine((s: string) => isValidNigerianPhone(s), "Invalid Nigerian phone number"),
  streetAddress: z.string().optional(),
  landmark: z.string().optional(),
  zoneId: z.string().optional(),
});

export async function createResident(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN") return fail("Forbidden");

  const parsed = createResidentSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    streetAddress: formData.get("streetAddress") || undefined,
    landmark: formData.get("landmark") || undefined,
    zoneId: formData.get("zoneId") || undefined,
  });
  if (!parsed.success) {
    return fail("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const normalized = normalizeNigerianPhone(parsed.data.phone);
  if (!normalized) return fail("Invalid phone number");

  const existing = await prisma.user.findUnique({ where: { phone: normalized } });
  if (existing) return fail("Phone number already registered");

  const tempPassword = generateTempPassword();

  const resident = await prisma.user.create({
    data: {
      organizationId: user.organizationId,
      phone: normalized,
      passwordHash: await bcrypt.hash(tempPassword, 10),
      role: "RESIDENT",
      accountStatus: "CLAIMED",
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      streetAddress: parsed.data.streetAddress ?? null,
      landmark: parsed.data.landmark ?? null,
      zoneId: parsed.data.zoneId ?? null,
    },
  });

  return ok({ id: resident.id });
}

export async function deleteResident(_prevState: unknown, formData: FormData): Promise<ActionResult<any>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN") return fail("Forbidden");

  const parsed = deleteResidentSchema.safeParse({ residentId: formData.get("residentId") });
  if (!parsed.success) return fail("Invalid input");

  const resident = await prisma.user.findFirst({
    where: { id: parsed.data.residentId, organizationId: user.organizationId, role: "RESIDENT" },
    select: { id: true },
  });
  if (!resident) return fail("Resident not found");

  await prisma.$transaction(async (tx) => {
    await tx.pickupStop.deleteMany({ where: { residentId: resident.id } });
    await tx.serviceRequest.deleteMany({ where: { residentId: resident.id } });
    await tx.invoice.deleteMany({ where: { residentId: resident.id } });
    await tx.payment.deleteMany({ where: { residentId: resident.id } });
    await tx.user.delete({ where: { id: resident.id } });
  }, { timeout: 60000 });

  return ok({ deleted: true });
}

const regeneratePasswordSchema = z.object({ userId: z.string() });

export async function regenerateResidentPassword(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult<{ phone: string | null; password: string }>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN") return fail("Forbidden");

  const parsed = regeneratePasswordSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return fail("Invalid input");

  const resident = await prisma.user.findFirst({
    where: { id: parsed.data.userId, organizationId: user.organizationId, role: "RESIDENT" },
    select: { id: true, phone: true },
  });
  if (!resident) return fail("Resident not found");

  const password = generateTempPassword();
  await prisma.user.update({
    where: { id: resident.id },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });

  return ok({ phone: resident.phone, password });
}
