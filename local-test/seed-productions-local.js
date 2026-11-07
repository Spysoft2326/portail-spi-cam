// Données de production de TEST pour la base SQLite locale uniquement.
// Lancé par local-test/setup-local.bat — ne touche jamais la base Render.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const PRODUITS = [
  ["Ciment", "tonnes"], ["Boissons", "hectolitres"], ["Aluminium", "tonnes"],
  ["Huile de palme", "tonnes"], ["Savon", "tonnes"], ["Sucre", "tonnes"],
];

async function main() {
  const agent = await prisma.user.findFirst({ where: { role: "AGENT_SAISIE" } });
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const entreprises = await prisma.entreprise.findMany({ take: 20, orderBy: { referenceSPI: "asc" } });
  if (!agent || !admin || entreprises.length === 0) {
    throw new Error("Utilisateurs ou entreprises manquants : lancer d'abord les seeds users et entreprises.");
  }

  await prisma.production.deleteMany();
  let n = 0;
  for (const [i, e] of entreprises.entries()) {
    const [produit, unite] = PRODUITS[i % PRODUITS.length];
    for (const [annee, trimestre] of [[2025, 3], [2025, 4], [2026, 1], [2026, 2]]) {
      const base = 10000 + i * 3500;
      const quantite = Math.round(base * (1 + 0.04 * trimestre) * (annee === 2026 ? 1.06 : 1));
      // Les trimestres les plus récents restent en attente de validation
      const statut = annee === 2026 && trimestre === 2 ? (i % 3 === 0 ? "REJETE" : "EN_ATTENTE") : "VALIDE";
      await prisma.production.create({
        data: {
          entrepriseId: e.id,
          produit, unite, quantite,
          productionPhysique: quantite,
          periode: `T${trimestre} ${annee}`,
          annee, trimestre,
          chiffreAffaires: quantite * 35000,
          effectifs: 80 + i * 25,
          commentaire: "Donnée de test locale",
          statut,
          saisiePar: agent.id,
          validePar: statut === "EN_ATTENTE" ? null : admin.id,
          dateValidation: statut === "EN_ATTENTE" ? null : new Date(),
        },
      });
      n++;
    }
  }
  console.log(`✅ ${n} productions de test créées pour ${entreprises.length} entreprises`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
