const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const regions = await p.entreprise.findMany({ select: { region: true }, distinct: ['region'] });
  console.log('Regions:', regions.map(x => x.region));
  const villes = await p.entreprise.findMany({ select: { ville: true }, distinct: ['ville'] });
  console.log('Villes:', villes.map(x => x.ville));
  await p.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
