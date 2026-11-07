// Données de TEST pour la base SQLite locale uniquement (lancé par local-test/setup-local.bat).
// Crée un catalogue de plusieurs produits par entreprise et des déclarations trimestrielles
// multi-produits dans les trois statuts du workflow. Ne touche jamais la base Render.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Catalogues types par filière : une entreprise fabrique 1 à 3 produits
const CATALOGUES = {
  AGRO: [["Bière", "hl"], ["Boissons gazeuses", "hl"], ["Eau minérale", "hl"]],
  FORET_BOIS: [["Sciages", "m3"], ["Contreplaqué", "m3"]],
  MATERIAUX_BTP: [["Ciment CPJ 42.5", "t"], ["Ciment CPJ 32.5", "t"], ["Clinker", "t"]],
  HYDROCARBURES: [["Pétrole brut", "barils"], ["Gaz naturel", "m3"]],
  CHIMIE_PHARMA: [["Savon de ménage", "cartons"], ["Détergents", "t"]],
  MINES_METAL: [["Aluminium primaire", "t"], ["Tôles aluminium", "t"]],
  PLASTIQUE: [["Emballages plastiques", "t"], ["Bouteilles PET", "unités"]],
  PAPIER: [["Cahiers", "unités"], ["Imprimés", "unités"]],
  TEXTILE: [["Tissus", "m"]],
  ENERGIE: [["Électricité", "MWh"]],
  AUTRE: [["Production", "t"]],
};
const catalogue = (filiere) => CATALOGUES[filiere] || CATALOGUES.AUTRE;

async function main() {
  const agent = await prisma.user.findFirst({ where: { email: "agent1@spi-cam.cm" } });
  const agent2 = await prisma.user.findFirst({ where: { email: "agent2@spi-cam.cm" } });
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  // 20 entreprises industrielles, prises à intervalles réguliers pour varier les filières
  const industrielles = await prisma.entreprise.findMany({ where: { champIndustriel: true, statut: "ACTIF" }, orderBy: { referenceSPI: "asc" } });
  const pas = Math.max(1, Math.floor(industrielles.length / 20));
  const entreprises = industrielles.filter((_, k) => k % pas === 0).slice(0, 20);
  if (!agent || !admin || entreprises.length === 0) {
    throw new Error("Utilisateurs ou entreprises manquants : lancer d'abord les seeds users et entreprises.");
  }

  await prisma.ligneProduction.deleteMany();
  await prisma.production.deleteMany();
  await prisma.produit.deleteMany();

  let nDecl = 0;
  let nLignes = 0;
  for (const [i, e] of entreprises.entries()) {
    const produits = [];
    for (const [nom, unite] of catalogue(e.filiereCode)) {
      produits.push(await prisma.produit.create({ data: { entrepriseId: e.id, nom, unite } }));
    }
    const saisiePar = i % 2 === 0 ? agent.id : (agent2 || agent).id;

    for (const [annee, trimestre] of [[2025, 3], [2025, 4], [2026, 1], [2026, 2]]) {
      const recent = annee === 2026 && trimestre === 2;
      const statut = recent ? (i % 4 === 0 ? "REJETE" : "EN_ATTENTE") : "VALIDE";
      const croissance = (1 + 0.03 * trimestre) * (annee === 2026 ? 1.05 : 1);
      await prisma.production.create({
        data: {
          entrepriseId: e.id,
          annee, trimestre, periode: `T${trimestre} ${annee}`,
          chiffreAffaires: Math.round((800 + i * 250) * croissance) * 1_000_000,
          effectifs: 80 + i * 25,
          commentaire: "Donnée de test locale",
          statut,
          motifRejet: statut === "REJETE" ? "Quantités incohérentes avec le trimestre précédent : merci de vérifier." : null,
          saisiePar,
          validePar: statut === "EN_ATTENTE" ? null : admin.id,
          dateValidation: statut === "EN_ATTENTE" ? null : new Date(),
          lignes: {
            create: produits.map((p, k) => ({
              produitId: p.id,
              produit: p.nom,
              unite: p.unite,
              quantite: Math.round((5000 + i * 1800) / (k + 1) * croissance),
            })),
          },
        },
      });
      nDecl++;
      nLignes += produits.length;
    }
  }
  console.log(`✅ ${nDecl} déclarations de test (${nLignes} lignes produit) pour ${entreprises.length} entreprises`);

  // Quelques fiches entreprise dans le workflow (saisies par un agent)
  const enAttente = await prisma.entreprise.findMany({
    where: { id: { notIn: entreprises.map((e) => e.id) } },
    skip: 140, take: 3, orderBy: { referenceSPI: "asc" },
  });
  for (const [k, e] of enAttente.entries()) {
    await prisma.entreprise.update({
      where: { id: e.id },
      data: k < 2
        ? { statut: "EN_ATTENTE", agentId: agent.id, motifRejet: null }
        : { statut: "REJETE", agentId: agent.id, motifRejet: "Numéro de contribuable manquant." },
    });
  }
  console.log("✅ 2 fiches entreprise en attente et 1 rejetée (saisies par agent1)");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
