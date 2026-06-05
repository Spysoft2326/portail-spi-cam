const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
  const enterprise = await prisma.entreprise.create({
    data: {
      denomination: "Test SNH",
      sigle: "SNH",
      secteurActivite: "Hydrocarbures",
      ville: "Douala",
      region: "Littoral",
      telephone: "233420100",
      email: "contact@snh.cm",
      siteWeb: "www.snh.cm",
      capitalSocial: 10000000000,
      dateCreation: new Date("1980-01-01"),
      formeJuridique: "SA",
      statut: "ACTIF",
      referenceSPI: "SPI-CM-TEST",
      estExportateur: true,
      estDansZoneIndustrielle: false
    }
  });
  console.log("Created:", enterprise);
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

