/**
 * RÉINITIALISATION DES COMPTES — supprime TOUS les comptes utilisateurs, puis crée le seul compte
 * super administrateur « Spysoft » (identifiant : spysoft, mot de passe par défaut : SpiCam2026!,
 * changement obligatoire à la première connexion).
 *
 * Les données métier (entreprises, déclarations, journal d'audit) sont conservées : elles sont
 * simplement détachées des comptes supprimés.
 *
 * Usage (la base est celle de DATABASE_URL) :
 *   node scripts/reinitialiser-comptes.js --confirmer
 */
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const MOT_DE_PASSE_PAR_DEFAUT = "SpiCam2026!";
const SUPER_ADMIN = { identifiant: "spysoft", email: "spysoft@spi-cam.cm", name: "Spysoft", role: "SUPER_ADMIN" };

async function main() {
  if (!process.argv.includes("--confirmer")) {
    console.error("Opération destructive : tous les comptes seront supprimés.\nRelancez avec : node scripts/reinitialiser-comptes.js --confirmer");
    process.exit(2);
  }
  const prisma = new PrismaClient();
  try {
    const avant = await prisma.user.count();
    const ids = (await prisma.user.findMany({ select: { id: true } })).map((u) => u.id);
    await prisma.$transaction([
      prisma.production.updateMany({ where: { saisiePar: { in: ids } }, data: { saisiePar: null } }),
      prisma.production.updateMany({ where: { validePar: { in: ids } }, data: { validePar: null } }),
      prisma.entreprise.updateMany({ where: { agentId: { in: ids } }, data: { agentId: null } }),
      prisma.auditLog.updateMany({ where: { userId: { in: ids } }, data: { userId: null } }),
      prisma.session.deleteMany({}),
      prisma.account.deleteMany({}),
      prisma.user.deleteMany({}),
    ]);
    const spysoft = await prisma.user.create({
      data: {
        ...SUPER_ADMIN,
        password: await bcrypt.hash(MOT_DE_PASSE_PAR_DEFAUT, 12),
        doitChangerMotDePasse: true,
        actif: true,
      },
    });
    await prisma.auditLog.create({
      data: { action: "COMPTES_REINITIALISES", entity: "User", entityId: spysoft.id, userId: spysoft.id, details: `${avant} compte(s) supprimé(s), super admin Spysoft créé` },
    });
    console.log(`✅ ${avant} compte(s) supprimé(s). Compte unique : identifiant « spysoft » (super administrateur).`);
    console.log(`   Mot de passe provisoire : ${MOT_DE_PASSE_PAR_DEFAUT} — changement imposé à la première connexion.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
