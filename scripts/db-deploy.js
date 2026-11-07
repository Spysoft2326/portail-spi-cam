/**
 * Mise à jour de la base au déploiement (lancé par `npm run db:deploy`, dans le build Render).
 *
 * 1. `prisma db push` : aligne la base sur prisma/schema.prisma (nouvelles tables / colonnes).
 *    SANS --accept-data-loss : si un changement devait supprimer des données, Prisma refuse
 *    et le build échoue — la base et le site en ligne restent intacts.
 * 2. Reprise des anciennes saisies mono-produit : chaque déclaration sans ligne produit mais avec
 *    une production physique / quantité reçoit une ligne produit. Idempotent : relançable sans doublon.
 *
 * 3. Référentiels : nomenclature des activités (CITI Rév.4) et filières, puis rattachement
 *    à une filière des entreprises qui n'en ont pas (jamais celles fixées manuellement).
 *
 * La base utilisée est celle de la variable d'environnement DATABASE_URL.
 */
const { execSync } = require("child_process");

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

async function reprendreAnciennesSaisies() {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const anciennes = await prisma.production.findMany({
      where: {
        lignes: { none: {} },
        OR: [{ productionPhysique: { not: null } }, { quantite: { not: null } }],
      },
      select: { id: true, produit: true, quantite: true, unite: true, productionPhysique: true },
    });
    if (anciennes.length === 0) {
      console.log("Reprise des anciennes saisies : rien à faire.");
      return;
    }
    // L'ancien formulaire enregistrait la production physique en tonnes
    const lignes = anciennes.map((p) => ({
      productionId: p.id,
      produit: (p.produit && p.produit.trim()) || "Production physique (ancienne saisie)",
      quantite: p.productionPhysique ?? p.quantite,
      unite: (p.unite && p.unite.trim()) || "t",
    }));
    await prisma.$transaction(lignes.map((data) => prisma.ligneProduction.create({ data })));
    console.log(`Reprise des anciennes saisies : ${lignes.length} déclaration(s) converties en lignes produit.`);
  } finally {
    await prisma.$disconnect();
  }
}

(async () => {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL n'est pas définie : impossible de mettre la base à jour.");
    process.exit(1);
  }
  const schema = process.argv[2] ? ` --schema ${process.argv[2]}` : "";
  run(`npx prisma db push --skip-generate${schema}`);
  await reprendreAnciennesSaisies();

  // 3. Référentiels (nomenclature CITI Rév.4, filières) puis rattachement des entreprises non classées
  const { PrismaClient } = require("@prisma/client");
  const { chargerReferentiels, reclasserEntreprises } = require("./referentiels");
  const prisma = new PrismaClient();
  try {
    await chargerReferentiels(prisma);
    await reclasserEntreprises(prisma);
  } finally {
    await prisma.$disconnect();
  }
  console.log("\nBase de données à jour.");
})().catch((e) => {
  console.error("\nÉchec de la mise à jour de la base :", e.message);
  process.exit(1);
});
