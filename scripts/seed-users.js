const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding Portail_SPI_Cam...');

  const hashedPassword = await bcrypt.hash('SpiCam2026!', 10);

  const users = [];

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@spi-cam.cm' },
    update: {},
    create: {
      email: 'superadmin@spi-cam.cm',
      name: 'Administrateur Système',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  users.push(superAdmin);
  console.log('✅ Super-Admin créé');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@spi-cam.cm' },
    update: {},
    create: {
      email: 'admin@spi-cam.cm',
      name: 'Responsable Analyse',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });
  users.push(admin);
  console.log('✅ Admin créé');

  const agent1 = await prisma.user.upsert({
    where: { email: 'agent1@spi-cam.cm' },
    update: {},
    create: {
      email: 'agent1@spi-cam.cm',
      name: 'Agent Saisie Douala',
      password: hashedPassword,
      role: 'AGENT_SAISIE',
      isActive: true,
    },
  });
  users.push(agent1);
  console.log('✅ Agent 1 créé');

  const agent2 = await prisma.user.upsert({
    where: { email: 'agent2@spi-cam.cm' },
    update: {},
    create: {
      email: 'agent2@spi-cam.cm',
      name: 'Agent Saisie Yaoundé',
      password: hashedPassword,
      role: 'AGENT_SAISIE',
      isActive: true,
    },
  });
  users.push(agent2);
  console.log('✅ Agent 2 créé');

  console.log(`\n👤 ${users.length} utilisateurs créés avec succès`);
  console.log('   • superadmin@spi-cam.cm / SpiCam2026! (SUPER_ADMIN)');
  console.log('   • admin@spi-cam.cm / SpiCam2026! (ADMIN)');
  console.log('   • agent1@spi-cam.cm / SpiCam2026! (AGENT_SAISIE)');
  console.log('   • agent2@spi-cam.cm / SpiCam2026! (AGENT_SAISIE)');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
