const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("[SEED] Debut du seeding des donnees de production...");

  // Recuperer les entreprises existantes
  const entreprises = await prisma.Entreprise.findMany({
    take: 10,
    orderBy: { createdAt: "asc" },
  });

  if (entreprises.length === 0) {
    console.log("[ERREUR] Aucune entreprise trouvee. Seed des entreprises d'abord.");
    return;
  }

  console.log(`[INFO] ${entreprises.length} entreprises trouvees`);

  // Recuperer un agent (premier user avec role AGENT ou AGENT_SAISIE)
  const agent = await prisma.user.findFirst({
    where: { 
      OR: [
        { role: "AGENT_SAISIE" },
        { role: "AGENT" }
      ]
    },
  });

  const admin = await prisma.user.findFirst({
    where: { 
      OR: [
        { role: "ADMIN" },
        { role: "SUPER_ADMIN" }
      ]
    },
  });

  if (!agent) {
    console.log("[ERREUR] Aucun agent trouve. Creation impossible.");
    console.log("[INFO] Roles disponibles: AGENT, AGENT_SAISIE");
    return;
  }

  console.log(`[INFO] Agent: ${agent.email} (role: ${agent.role})`);

  // Donnees de production pour T1 2026 (validees)
  const productionsT1 = [
    { entreprise: entreprises[0], productionPhysique: 125000, chiffreAffaires: 450000000, effectifs: 850, investissements: 120000000 },
    { entreprise: entreprises[1], productionPhysique: 89000, chiffreAffaires: 320000000, effectifs: 620, investissements: 80000000 },
    { entreprise: entreprises[2], productionPhysique: 156000, chiffreAffaires: 580000000, effectifs: 1100, investissements: 150000000 },
    { entreprise: entreprises[3], productionPhysique: 45000, chiffreAffaires: 180000000, effectifs: 340, investissements: 45000000 },
    { entreprise: entreprises[4], productionPhysique: 78000, chiffreAffaires: 290000000, effectifs: 520, investissements: 70000000 },
  ];

  // Donnees de production pour T2 2026 (en attente)
  const productionsT2 = [
    { entreprise: entreprises[0], productionPhysique: 132000, chiffreAffaires: 480000000, effectifs: 860, investissements: 130000000 },
    { entreprise: entreprises[1], productionPhysique: 92000, chiffreAffaires: 340000000, effectifs: 630, investissements: 85000000 },
    { entreprise: entreprises[2], productionPhysique: 148000, chiffreAffaires: 560000000, effectifs: 1080, investissements: 140000000 },
  ];

  // Creer T1 2026 (validees)
  for (const prod of productionsT1) {
    await prisma.production.upsert({
      where: {
        entrepriseId_annee_trimestre: {
          entrepriseId: prod.entreprise.id,
          annee: 2026,
          trimestre: 1,
        },
      },
      update: {},
      create: {
        entrepriseId: prod.entreprise.id,
        annee: 2026,
        trimestre: 1,
        productionPhysique: prod.productionPhysique,
        chiffreAffaires: prod.chiffreAffaires,
        effectifs: prod.effectifs,
        investissements: prod.investissements,
        commentaire: "Donnees T1 2026 - Saisie initiale",
        statut: "VALIDEE",
        saisiePar: agent.id,
        validePar: admin?.id || agent.id,
        dateValidation: new Date("2026-04-15"),
      },
    });
  }
  console.log(`[OK] ${productionsT1.length} productions T1 2026 creees (VALIDEES)`);

  // Creer T2 2026 (en attente)
  for (const prod of productionsT2) {
    await prisma.production.upsert({
      where: {
        entrepriseId_annee_trimestre: {
          entrepriseId: prod.entreprise.id,
          annee: 2026,
          trimestre: 2,
        },
      },
      update: {},
      create: {
        entrepriseId: prod.entreprise.id,
        annee: 2026,
        trimestre: 2,
        productionPhysique: prod.productionPhysique,
        chiffreAffaires: prod.chiffreAffaires,
        effectifs: prod.effectifs,
        investissements: prod.investissements,
        commentaire: "Donnees T2 2026 - En attente validation",
        statut: "EN_ATTENTE",
        saisiePar: agent.id,
      },
    });
  }
  console.log(`[OK] ${productionsT2.length} productions T2 2026 creees (EN_ATTENTE)`);

  console.log("[OK] Seeding termine !");
  console.log("[RESUME]");
  const total = await prisma.production.count();
  const validees = await prisma.production.count({ where: { statut: "VALIDEE" } });
  const attente = await prisma.production.count({ where: { statut: "EN_ATTENTE" } });
  console.log(`   Total: ${total}`);
  console.log(`   Validees: ${validees}`);
  console.log(`   En attente: ${attente}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
