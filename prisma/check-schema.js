const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Checking Prisma schema fields...\n");

  try {
    // Try to get schema info by creating a minimal object
    const test = await prisma.$queryRaw`PRAGMA table_info(Enterprise)`;
    console.log("Enterprise table columns:");
    console.log(JSON.stringify(test, null, 2));
  } catch (e) {
    console.error("Error getting schema:", e.message);
  }

  // Also try a simple count
  try {
    const count = await prisma.enterprise.count();
    console.log("\nCurrent enterprise count:", count);
  } catch (e) {
    console.error("Error counting:", e.message);
  }

  // Try to find one
  try {
    const one = await prisma.enterprise.findFirst();
    console.log("\nFirst enterprise:", one ? one.referenceSPI : "none");
  } catch (e) {
    console.error("Error finding first:", e.message);
  }
}

main()
  .catch((e) => {
    console.error("Fatal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
