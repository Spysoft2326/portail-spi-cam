// Charge la nomenclature et les filières dans la base de test locale, puis classe les entreprises.
const { PrismaClient } = require("@prisma/client");
const { chargerReferentiels, reclasserEntreprises } = require("../scripts/referentiels");
const prisma = new PrismaClient();
const etape = process.argv[2] || "tout";

(async () => {
  if (etape !== "reclasser") await chargerReferentiels(prisma);
  if (etape !== "charger") await reclasserEntreprises(prisma);
})()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
