const { execSync, spawn } = require('child_process');
const path = require('path');

console.log('========================================');
console.log('  Initialisation Portail SPI Cam');
console.log('========================================\n');

const projectDir = __dirname;

async function run() {
  try {
    // 1. Verifier Docker
    console.log('[1/7] Verification de Docker...');
    try {
      execSync('docker ps', { stdio: 'pipe' });
      console.log('OK - Docker actif\n');
    } catch {
      console.log('ERREUR: Docker non demarre. Lancez Docker Desktop.');
      console.log('Appuyez sur une touche pour fermer...');
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', () => process.exit(1));
      return;
    }

    // 2. Lancer les conteneurs
    console.log('[2/7] Demarrage des conteneurs Docker...');
    execSync('docker-compose up -d', { stdio: 'inherit', cwd: projectDir });
    console.log('OK - Conteneurs demarres\n');

    // 3. Attendre PostgreSQL
    console.log('[3/7] Attente PostgreSQL (10s)...');
    await new Promise(r => setTimeout(r, 10000));
    console.log('OK - PostgreSQL pret\n');

    // 4. Installer les dependances
    console.log('[4/7] Installation des dependances...');
    execSync('npm install', { stdio: 'inherit', cwd: projectDir });
    console.log('OK - Dependances installees\n');

    // 5. Generer Prisma
    console.log('[5/7] Generation du client Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit', cwd: projectDir });
    console.log('OK - Client Prisma genere\n');

    // 6. Creer les tables
    console.log('[6/7] Creation des tables...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', cwd: projectDir });
    console.log('OK - Tables creees\n');

    // 7. Seeder les utilisateurs
    console.log('[7/7] Creation des utilisateurs de test...');
    execSync('node scripts/seed-users.js', { stdio: 'inherit', cwd: projectDir });
    console.log('OK - Utilisateurs crees\n');

    console.log('========================================');
    console.log('  INITIALISATION TERMINEE !');
    console.log('========================================\n');
    console.log('Lancement du serveur...\n');
    console.log('Acces:');
    console.log('  - Portail public : http://localhost:3000');
    console.log('  - Login          : http://localhost:3000/login');
    console.log('  - pgAdmin        : http://localhost:5050');
    console.log('\nComptes de test:');
    console.log('  superadmin@spi-cam.cm / SpiCam2026! (SUPER_ADMIN)');
    console.log('  admin@spi-cam.cm / SpiCam2026! (ADMIN)');
    console.log('  agent1@spi-cam.cm / SpiCam2026! (AGENT_SAISIE)');
    console.log('\nAppuyez sur Ctrl+C pour arreter\n');

    // Lancer le serveur
    const server = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      cwd: projectDir,
      shell: true
    });

    server.on('error', (err) => {
      console.error('Erreur serveur:', err);
    });

  } catch (error) {
    console.error('\nERREUR:', error.message);
    console.log('\nAppuyez sur une touche pour fermer...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => process.exit(1));
  }
}

run();
