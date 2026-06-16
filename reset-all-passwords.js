const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const users = [
    { email: "admin@spi-cam.cm", password: "Admin123!" },
    { email: "agent@spi-cam.cm", password: "Agent123!" },
  ];

  for (const user of users) {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    await prisma.user.update({
      where: { email: user.email },
      data: { password: hashedPassword },
    });
    console.log("✅ Mot de passe réinitialisé pour:", user.email);
  }
}

main()
  .catch((e) => { console.error("❌ Erreur:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
