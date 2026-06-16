const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const password = "SuperAdmin123!";
  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = await prisma.user.update({
    where: { email: "superadmin@spi-cam.cm" },
    data: { password: hashedPassword },
  });

  console.log("✅ Mot de passe réinitialisé pour:", user.email);
  console.log("🔐 Hash:", hashedPassword);

  // Vérifier que le hash fonctionne
  const isValid = bcrypt.compareSync(password, hashedPassword);
  console.log("✅ Vérification bcrypt:", isValid);
}

main()
  .catch((e) => { console.error("❌ Erreur:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
