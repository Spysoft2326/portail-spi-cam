const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.entreprise.updateMany({
    data: { statut: "ACTIF" }
  });
  console.log(result.count + " entreprises mises à jour en ACTIF");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
