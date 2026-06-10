const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seedUsers() {
  console.log("🌱 Seeding users...");

  const hashedPassword = await bcrypt.hash("SpiCam2026!", 10);

  const users = [
    { email: "superadmin@spi-cam.cm", name: "Super Administrateur", password: hashedPassword, role: "SUPER_ADMIN" },
    { email: "admin@spi-cam.cm", name: "Administrateur", password: hashedPassword, role: "ADMIN" },
    { email: "agent1@spi-cam.cm", name: "Agent 1", password: hashedPassword, role: "AGENT_SAISIE" },
    { email: "agent2@spi-cam.cm", name: "Agent 2", password: hashedPassword, role: "AGENT_SAISIE" },
  ];

  let created = 0;
  let updated = 0;

  for (const user of users) {
    try {
      await prisma.user.upsert({
        where: { email: user.email },
        update: { password: user.password, name: user.name, role: user.role },
        create: user,
      });
      console.log(`  ✅ User ${user.email} ready`);
      created++;
    } catch (e) {
      console.error(`  ❌ Error ${user.email}:`, e.message);
    }
  }

  console.log(`📊 Users: ${created} ready`);
}

seedUsers()
  .catch((e) => {
    console.error("❌ Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
