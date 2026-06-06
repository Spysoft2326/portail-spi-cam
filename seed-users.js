const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  console.log('Début du seeding...');
  
  const users = [
    { name: 'Super-Admin', email: 'superadmin[AT]spi-cam.cm'.replace('[AT]','@'), password: await bcrypt.hash('SpiCam2026!', 10), role: 'SUPER_ADMIN', isActive: true },
    { name: 'Administrateur', email: 'admin[AT]spi-cam.cm'.replace('[AT]','@'), password: await bcrypt.hash('SpiCam2026!', 10), role: 'ADMIN', isActive: true },
    { name: 'Agent 1', email: 'agent1[AT]spi-cam.cm'.replace('[AT]','@'), password: await bcrypt.hash('SpiCam2026!', 10), role: 'AGENT_SAISIE', isActive: true },
    { name: 'Agent 2', email: 'agent2[AT]spi-cam.cm'.replace('[AT]','@'), password: await bcrypt.hash('SpiCam2026!', 10), role: 'AGENT_SAISIE', isActive: true },
  ];
  
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log('Utilisateur créé:', user.email);
  }
  
  console.log('Seeding terminé avec succès!');
}

seed()
  .catch(e => {
    console.error('Erreur:', e);
    process.exit(1);
  })
  .finally(() => prisma.());
