const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const sectors = await p.entreprise.findMany({ 
    select: { secteurActivite: true }, 
    distinct: ['secteurActivite'] 
  });
  console.log('Secteurs uniques en base:');
  sectors.forEach(s => console.log('  -', s.secteurActivite));
  await p.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
