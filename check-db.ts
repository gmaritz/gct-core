import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const contentCount = await prisma.hotelContent.count({ where: { provider: 'hotelbeds' } });
  const totalContent = await prisma.hotelContent.count();
  const catalogueCount = await prisma.hotelCatalogueEntry.count();
  console.log("Cleanup Count Result:", JSON.stringify({ contentCount, totalContent, catalogueCount }));
}
main().catch(console.error).finally(() => prisma.$disconnect());
