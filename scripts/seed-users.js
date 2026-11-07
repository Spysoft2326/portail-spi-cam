/**
 * Compte initial : crée le super administrateur « Spysoft » s'il n'existe aucun super admin.
 * (Ne supprime rien. Pour repartir de zéro : node scripts/reinitialiser-comptes.js --confirmer)
 * Les autres comptes sont créés par Spysoft depuis Paramètres > Utilisateurs.
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const existant = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  if (existant) {
    console.log(`ℹ️  Un super administrateur existe déjà (${existant.identifiant || existant.email}) : rien à faire.`);
    return;
  }
  await prisma.user.create({
    data: {
      identifiant: "spysoft",
      email: "spysoft@spi-cam.cm",
      name: "Spysoft",
      role: "SUPER_ADMIN",
      password: await bcrypt.hash("SpiCam2026!", 12),
      doitChangerMotDePasse: true,
    },
  });
  console.log("✅ Super administrateur créé : identifiant « spysoft », mot de passe provisoire SpiCam2026! (à changer à la 1re connexion)");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
