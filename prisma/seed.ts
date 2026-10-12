import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: "lagos-waste" },
    update: {},
    create: {
      name: "Lagos Waste Co",
      slug: "lagos-waste",
    },
  });

  const adminHash = await bcrypt.hash("admin1234", 10);
  const driverHash = await bcrypt.hash("driver1234", 10);

  const _admin = await prisma.user.upsert({
    where: { organizationId_phone: { organizationId: org.id, phone: "+2348000000000" } },
    update: {
      email: "admin@company.com",
      passwordHash: adminHash,
      firstName: "Admin",
      lastName: "User",
    },
    create: {
      organizationId: org.id,
      phone: "+2348000000000",
      email: "admin@company.com",
      passwordHash: adminHash,
      role: "ADMIN",
      accountStatus: "CLAIMED",
      firstName: "Admin",
      lastName: "User",
    },
  });

  const driver1Phone = "+2348012345678";
  const driver2Phone = "+2348098765432";

  const driver1 = await prisma.user.upsert({
    where: { organizationId_phone: { organizationId: org.id, phone: driver1Phone } },
    update: {},
    create: {
      organizationId: org.id,
      phone: driver1Phone,
      passwordHash: driverHash,
      role: "DRIVER",
      accountStatus: "CLAIMED",
      firstName: "Driver",
      lastName: "One",
    },
  });

  const _driver2 = await prisma.user.upsert({
    where: { organizationId_phone: { organizationId: org.id, phone: driver2Phone } },
    update: {},
    create: {
      organizationId: org.id,
      phone: driver2Phone,
      passwordHash: driverHash,
      role: "DRIVER",
      accountStatus: "CLAIMED",
      firstName: "Driver",
      lastName: "Two",
    },
  });

  const zones: Array<{ id: string; name: string; description: string | null }> = [];
  for (const name of ["Victoria Island", "Ikoyi", "Lekki"]) {
    const existing = await prisma.zone.findFirst({
      where: { name, organizationId: org.id },
    });
    if (existing) {
      zones.push(existing);
    } else {
      zones.push(
        await prisma.zone.create({
          data: {
            organizationId: org.id,
            name,
            description: `${name} service area`,
          },
        })
      );
    }
  }

  const residents = [
    { firstName: "Adebayo", lastName: "Okonkwo", phone: "+2347011111111", streetAddress: "15 Akin Adesola St, Victoria Island", zone: zones[0] },
    { firstName: "Chidinma", lastName: "Eze", phone: "+2347022222222", streetAddress: "22A Ozumba Mbadiwe, Victoria Island", zone: zones[0] },
    { firstName: "Oluwaseun", lastName: "Adeyemi", phone: "+2347033333333", streetAddress: "8 Ligali Ayorinde, Ikoyi", zone: zones[1] },
    { firstName: "Fatima", lastName: "Bello", phone: "+2347044444444", streetAddress: "14A Bourdillon Rd, Ikoyi", zone: zones[1] },
    { firstName: "Emeka", lastName: "Nwosu", phone: "+2347055555555", streetAddress: "35 Admiralty Way, Lekki", zone: zones[2] },
    { firstName: "Ngozi", lastName: "Okafor", phone: "+2347066666666", streetAddress: "12 Lekki Phase 1, Lekki", zone: zones[2] },
  ];

  const residentUsers: Array<{ id: string; phone: string }> = [];

  for (const r of residents) {
    const user = await prisma.user.upsert({
      where: { organizationId_phone: { organizationId: org.id, phone: r.phone } },
      update: {},
      create: {
        organizationId: org.id,
        phone: r.phone,
        firstName: r.firstName,
        lastName: r.lastName,
        streetAddress: r.streetAddress,
        zoneId: r.zone.id,
        role: "RESIDENT",
        accountStatus: "CLAIMED",
      },
    });
    residentUsers.push({ id: user.id, phone: r.phone });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(6, 0, 0, 0);

  const route = await prisma.route.create({
    data: {
      organizationId: org.id,
      driverId: driver1.id,
      zoneId: zones[0].id,
      name: "Victoria Island Morning Route",
      date: tomorrow,
      status: "SCHEDULED",
    },
  });

  const zoneResidents = await prisma.user.findMany({
    where: { organizationId: org.id, zoneId: zones[0].id, role: "RESIDENT" },
    orderBy: [{ streetAddress: "asc" }, { id: "asc" }],
  });

  const stopData = zoneResidents.map((resident, index) => ({
    organizationId: org.id,
    routeId: route.id,
    residentId: resident.id,
    zoneId: zones[0].id,
    stopOrder: index + 1,
    address: resident.streetAddress ?? "",
  }));

  await prisma.pickupStop.createMany({ data: stopData });

  await prisma.serviceRequest.upsert({
    where: { id: "seed-sr-1" },
    update: {},
    create: {
      id: "seed-sr-1",
      organizationId: org.id,
      residentId: residentUsers[0].id,
      type: "MISSED_PICKUP",
      status: "PENDING",
       address: residents[0].streetAddress,
    },
  });

  await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-SEED-001" },
    update: {},
    create: {
      invoiceNumber: "INV-SEED-001",
      organizationId: org.id,
      residentId: residentUsers[0].id,
      amount: 5000,
      status: "DRAFT",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
