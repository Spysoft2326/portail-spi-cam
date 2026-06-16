const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seeding...");

  // 1. Créer les utilisateurs
  console.log("👤 Création des utilisateurs...");

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@spi-cam.cm" },
    update: {},
    create: {
      email: "superadmin@spi-cam.cm",
      name: "Super Admin",
      password: await bcrypt.hash("SuperAdmin123!", 10),
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });
  console.log("✅ SuperAdmin créé:", superAdmin.email);

  const admin = await prisma.user.upsert({
    where: { email: "admin@spi-cam.cm" },
    update: {},
    create: {
      email: "admin@spi-cam.cm",
      name: "Administrateur",
      password: await bcrypt.hash("Admin123!", 10),
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log("✅ Admin créé:", admin.email);

  const agent = await prisma.user.upsert({
    where: { email: "agent@spi-cam.cm" },
    update: {},
    create: {
      email: "agent@spi-cam.cm",
      name: "Agent Saisie",
      password: await bcrypt.hash("Agent123!", 10),
      role: "AGENT_SAISIE",
      isActive: true,
    },
  });
  console.log("✅ Agent créé:", agent.email);

  // 2. Créer les entreprises (échantillon de 20 pour commencer)
  console.log("🏢 Création des entreprises...");

  const entreprisesData = [
    {
      referenceSPI: "SPI-001",
      denomination: "Société Camerounaise de Construction",
      sigle: "SCC",
      formeJuridique: "SARL",
      capitalSocial: 50000000,
      adresse: "123 Rue Principale",
      ville: "Yaoundé",
      departement: "Mfoundi",
      region: "Centre",
      telephone: "+237 222 123 456",
      email: "contact@scc.cm",
      nomContact: "Jean Dupont",
      siteWeb: "www.scc.cm",
      numContribuable: "M0123456789",
      secteurActivite: "CONSTRUCTION",
      sousSecteur: "BTP",
      produitsPrincipaux: "Construction de bâtiments",
      statut: "ACTIF",
      estExportateur: false,
      estDansZoneIndustrielle: true,
      nomZoneIndustrielle: "Zone industrielle de Yaoundé",
    },
    {
      referenceSPI: "SPI-002",
      denomination: "Agro Industrie du Cameroun",
      sigle: "AIC",
      formeJuridique: "SA",
      capitalSocial: 100000000,
      adresse: "456 Avenue de l'Industrie",
      ville: "Douala",
      departement: "Wouri",
      region: "Littoral",
      telephone: "+237 233 456 789",
      email: "info@aic.cm",
      nomContact: "Marie Martin",
      siteWeb: "www.aic.cm",
      numContribuable: "M0987654321",
      secteurActivite: "AGRICULTURE",
      sousSecteur: "Agro-industrie",
      produitsPrincipaux: "Transformation de cacao",
      statut: "ACTIF",
      estExportateur: true,
      estDansZoneIndustrielle: true,
      nomZoneIndustrielle: "Zone portuaire de Douala",
    },
    {
      referenceSPI: "SPI-003",
      denomination: "Technologies Avancées du Cameroun",
      sigle: "TAC",
      formeJuridique: "SARL",
      capitalSocial: 25000000,
      adresse: "789 Boulevard Technologique",
      ville: "Yaoundé",
      departement: "Mfoundi",
      region: "Centre",
      telephone: "+237 222 789 012",
      email: "contact@tac.cm",
      nomContact: "Pierre Bernard",
      siteWeb: "www.tac.cm",
      numContribuable: "M0456789012",
      secteurActivite: "TECHNOLOGIE",
      sousSecteur: "Informatique",
      produitsPrincipaux: "Développement logiciel",
      statut: "ACTIF",
      estExportateur: false,
      estDansZoneIndustrielle: false,
      nomZoneIndustrielle: null,
    },
    {
      referenceSPI: "SPI-004",
      denomination: "Transport Express Cameroun",
      sigle: "TEC",
      formeJuridique: "SARL",
      capitalSocial: 30000000,
      adresse: "321 Route de Transport",
      ville: "Douala",
      departement: "Wouri",
      region: "Littoral",
      telephone: "+237 233 123 456",
      email: "contact@tec.cm",
      nomContact: "Sophie Laurent",
      siteWeb: "www.tec.cm",
      numContribuable: "M0789012345",
      secteurActivite: "TRANSPORT",
      sousSecteur: "Logistique",
      produitsPrincipaux: "Transport de marchandises",
      statut: "ACTIF",
      estExportateur: false,
      estDansZoneIndustrielle: false,
      nomZoneIndustrielle: null,
    },
    {
      referenceSPI: "SPI-005",
      denomination: "Hôtel International Yaoundé",
      sigle: "HIY",
      formeJuridique: "SA",
      capitalSocial: 75000000,
      adresse: "555 Avenue des Hôtels",
      ville: "Yaoundé",
      departement: "Mfoundi",
      region: "Centre",
      telephone: "+237 222 456 789",
      email: "reservations@hiy.cm",
      nomContact: "Robert Petit",
      siteWeb: "www.hiy.cm",
      numContribuable: "M0567890123",
      secteurActivite: "TOURISME",
      sousSecteur: "Hôtellerie",
      produitsPrincipaux: "Hébergement et restauration",
      statut: "ACTIF",
      estExportateur: false,
      estDansZoneIndustrielle: false,
      nomZoneIndustrielle: null,
    },
    {
      referenceSPI: "SPI-006",
      denomination: "Commerce Général du Cameroun",
      sigle: "CGC",
      formeJuridique: "SARL",
      capitalSocial: 40000000,
      adresse: "999 Rue du Commerce",
      ville: "Douala",
      departement: "Wouri",
      region: "Littoral",
      telephone: "+237 233 789 012",
      email: "contact@cgc.cm",
      nomContact: "Isabelle Moreau",
      siteWeb: "www.cgc.cm",
      numContribuable: "M0345678901",
      secteurActivite: "COMMERCE",
      sousSecteur: "Import-Export",
      produitsPrincipaux: "Importation de biens",
      statut: "ACTIF",
      estExportateur: true,
      estDansZoneIndustrielle: false,
      nomZoneIndustrielle: null,
    },
    {
      referenceSPI: "SPI-007",
      denomination: "Industrie Minière du Nord",
      sigle: "IMN",
      formeJuridique: "SA",
      capitalSocial: 200000000,
      adresse: "111 Zone Minière",
      ville: "Garoua",
      departement: "Bénoué",
      region: "Nord",
      telephone: "+237 222 345 678",
      email: "contact@imn.cm",
      nomContact: "Michel Durand",
      siteWeb: "www.imn.cm",
      numContribuable: "M0678901234",
      secteurActivite: "INDUSTRIE",
      sousSecteur: "Mines",
      produitsPrincipaux: "Extraction de bauxite",
      statut: "ACTIF",
      estExportateur: true,
      estDansZoneIndustrielle: true,
      nomZoneIndustrielle: "Zone minière de Garoua",
    },
    {
      referenceSPI: "SPI-008",
      denomination: "Services Financiers Africains",
      sigle: "SFA",
      formeJuridique: "SA",
      capitalSocial: 150000000,
      adresse: "222 Place Financière",
      ville: "Yaoundé",
      departement: "Mfoundi",
      region: "Centre",
      telephone: "+237 222 567 890",
      email: "contact@sfa.cm",
      nomContact: "Christine Leroy",
      siteWeb: "www.sfa.cm",
      numContribuable: "M0890123456",
      secteurActivite: "SERVICES",
      sousSecteur: "Finance",
      produitsPrincipaux: "Services bancaires",
      statut: "ACTIF",
      estExportateur: false,
      estDansZoneIndustrielle: false,
      nomZoneIndustrielle: null,
    },
    {
      referenceSPI: "SPI-009",
      denomination: "Agro Business Ouest",
      sigle: "ABO",
      formeJuridique: "SARL",
      capitalSocial: 35000000,
      adresse: "333 Zone Agricole",
      ville: "Bafoussam",
      departement: "Mifi",
      region: "Ouest",
      telephone: "+237 233 234 567",
      email: "contact@abo.cm",
      nomContact: "François Girard",
      siteWeb: "www.abo.cm",
      numContribuable: "M0123456789",
      secteurActivite: "AGRICULTURE",
      sousSecteur: "Culture",
      produitsPrincipaux: "Culture de café",
      statut: "ACTIF",
      estExportateur: true,
      estDansZoneIndustrielle: false,
      nomZoneIndustrielle: null,
    },
    {
      referenceSPI: "SPI-010",
      denomination: "Construction Métallique Cameroun",
      sigle: "CMC",
      formeJuridique: "SARL",
      capitalSocial: 45000000,
      adresse: "444 Zone Industrielle",
      ville: "Douala",
      departement: "Wouri",
      region: "Littoral",
      telephone: "+237 233 567 890",
      email: "contact@cmc.cm",
      nomContact: "Nicolas Blanc",
      siteWeb: "www.cmc.cm",
      numContribuable: "M0456789012",
      secteurActivite: "CONSTRUCTION",
      sousSecteur: "Métallurgie",
      produitsPrincipaux: "Construction métallique",
      statut: "ACTIF",
      estExportateur: false,
      estDansZoneIndustrielle: true,
      nomZoneIndustrielle: "Zone industrielle de Douala",
    },
  ];

  for (const entreprise of entreprisesData) {
    await prisma.entreprise.upsert({
      where: { referenceSPI: entreprise.referenceSPI },
      update: {},
      create: entreprise,
    });
  }
  console.log(`✅ ${entreprisesData.length} entreprises créées`);

  console.log("\n🎉 Seeding terminé avec succès !");
  console.log("Utilisateurs créés :");
  console.log("- SuperAdmin : superadmin@spi-cam.cm / SuperAdmin123!");
  console.log("- Admin : admin@spi-cam.cm / Admin123!");
  console.log("- Agent : agent@spi-cam.cm / Agent123!");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
