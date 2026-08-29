import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type LookupSeed = {
  code: string;
  name: string;
  active?: boolean;
};

// Explicit canonical values from SPEC-027 (itinerary_status).
const itineraryStatuses: LookupSeed[] = [
  { code: "DRAFT", name: "Draft", active: true },
  { code: "PLANNED", name: "Planned", active: true },
  { code: "CONFIRMED", name: "Confirmed", active: true },
  { code: "COMPLETED", name: "Completed", active: true },
  { code: "CANCELLED", name: "Cancelled", active: true },
];

const customerTypes: LookupSeed[] = [
  { code: "ANONYMOUS_BOOKING", name: "Anonymous Booking Customer", active: true },
];

async function main(): Promise<void> {
  for (const row of itineraryStatuses) {
    await prisma.itineraryStatus.upsert({
      where: { code: row.code },
      update: {
        name: row.name,
        active: row.active ?? true,
      },
      create: {
        code: row.code,
        name: row.name,
        active: row.active ?? true,
      },
    });
  }

  for (const row of customerTypes) {
    await prisma.customerType.upsert({
      where: { code: row.code },
      update: { name: row.name, active: row.active ?? true },
      create: { code: row.code, name: row.name, active: row.active ?? true },
    });
  }

  // No other canonical lookup values are explicitly defined in approved specs.
  // Tables are created by migration and intentionally left empty in this seed pass.
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("Seed failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
