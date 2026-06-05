const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function fixPasswords() {
  const hashedPassword = await bcrypt.hash("SpiCam2026!", 10);
  
  const users = [
    { email: "superadmin@spi-cam.cm", name: "Super Admin", role: "SUPER_ADMIN" },
    { email: "admin@spi-cam.cm", name: "Admin", role: "ADMIN" },
    { email: "agent1@spi-cam.cm", name: "Agent 1", role: "AGENT_SAISIE" },
    { email: "agent2@spi-cam.cm", name: "Agent 2", role: "AGENT_SAISIE" },
  ];

  for (const user of users) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (existing) {
      await prisma.user.update({ where: { email: user.email }, data: { password: hashedPassword } });
      console.log(`Updated ${user.email}`);
    } else {
      await prisma.user.create({ data: { ...user, password: hashedPassword, isActive: true } });
      console.log(`Created ${user.email}`);
    }
  }

  console.log("Done!");
}

fixPasswords()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

