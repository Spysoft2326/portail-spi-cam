const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Demarrage du seeding...');

  const existingUsers = await prisma.user.count();
  const existingEntreprises = await prisma.entreprise.count();

  if (existingUsers > 0 || existingEntreprises > 0) {
    console.log(`⚠️  Donnees existantes : ${existingUsers} utilisateurs, ${existingEntreprises} entreprises`);
    console.log('   Utilisez --force pour reinitialiser');

    if (!process.argv.includes('--force')) {
      console.log('   Seed annule. Utilisez : node seed-render.js --force');
      return;
    }

    console.log('🗑️  Reinitialisation...');
    await prisma.auditLog.deleteMany();
    await prisma.productionData.deleteMany();
    await prisma.document.deleteMany();
    await prisma.noteConjoncture.deleteMany();
    await prisma.entreprise.deleteMany();
    await prisma.user.deleteMany();
    await prisma.configSystem.deleteMany();
  }

  // ==================== UTILISATEURS ====================
  console.log('👤 Creation des utilisateurs...');

  const passwordHash = await bcrypt.hash('SpiCam2026!', 12);

  await prisma.user.createMany({
    data: [
      { email: 'superadmin@spi-cam.cm', name: 'Super Administrateur', passwordHash, role: 'SUPER_ADMIN', isActive: true },
      { email: 'admin@spi-cam.cm', name: 'Administrateur', passwordHash, role: 'ADMIN', isActive: true },
      { email: 'agent1@spi-cam.cm', name: 'Agent Saisie 1', passwordHash, role: 'AGENT_SAISIE', isActive: true },
      { email: 'agent2@spi-cam.cm', name: 'Agent Saisie 2', passwordHash, role: 'AGENT_SAISIE', isActive: true },
    ],
  });

  console.log('   ✅ 4 utilisateurs crees');

  // ==================== 100 ENTREPRISES ====================
  console.log('🏭 Creation des 100 entreprises...');

  const entreprises = [
    // AGROALIMENTAIRE (15)
    { ref: 'SPI-AGRO-001', den: 'Societe Anonyme des Brasseries du Cameroun', sigle: 'SABC', forme: 'SA', ville: 'Douala', region: 'LITTORAL', secteur: 'AGROALIMENTAIRE', ss: 'Brasserie', produits: 'Biere,Boissons gazeuses,Eau minerale', lat: 4.0511, lng: 9.7679, actif: true, export: true, zone: false },
    { ref: 'SPI-AGRO-002', den: 'Congelcam', sigle: null, forme: 'SARL', ville: 'Douala', region: 'LITTORAL', secteur: 'AGROALIMENTAIRE', ss: 'Agro-industrie', produits: 'Produits surgeles,Viande,Poisson', lat: 4.0481, lng: 9.7041, actif: true, export: false, zone: false },
    { ref: 'SPI-AGRO-003', den: 'Chococam', sigle: null, forme: 'SA', ville: 'Douala', region: 'LITTORAL', secteur: 'AGROALIMENTAIRE', ss: 'Confiserie', produits: 'Chocolat,Bonbons,Biscuits', lat: 4.0247, lng: 9.7489, actif: true, export: true, zone: false },
    { ref: 'SPI-AGRO-004', den: 'Laita Cameroun', sigle: null, forme: 'SAS', ville: 'Douala', region: 'LITTORAL', secteur: 'AGROALIMENTAIRE', ss: 'Produits laitiers', produits: 'Lait,Yaourt,Fromage', lat: 4.0321, lng: 9.7312, actif: true, export: false, zone: false },
    { ref: 'SPI-AGRO-005', den: 'Bocom', sigle: null, forme: 'SARL', ville: 'Douala', region: 'LITTORAL', secteur: 'AGROALIMENTAIRE', ss: 'Huilerie', produits: 'Huile de palme,Huile vegetale', lat: 4.0612, lng: 9.7123, actif: true, export: true, zone: false },
    { ref: 'SPI-AGRO-006', den: 'Cargill Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'AGROALIMENTAIRE', ss: 'Agro-industrie', produits: 'Graines oleagineuses,Huiles', lat: 4.0789, lng: 9.7256, actif: true, export: true, zone: false },
    { ref: 'SPI-AGRO-007', den: 'Nestle Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'AGROALIMENTAIRE', ss: 'Agro-industrie', produits: 'Produits alimentaires,Cafe,Lait', lat: 4.0456, lng: 9.7389, actif: true, export: false, zone: false },
    { ref: 'SPI-AGRO-008', den: 'PAMOL Plantations', sigle: 'PAMOL', forme: 'SA', ville: 'Limbe', region: 'SUD_OUEST', secteur: 'AGROALIMENTAIRE', ss: 'Plantation', produits: 'Huile de palme,Caoutchouc', lat: 4.0235, lng: 9.2015, actif: true, export: true, zone: false },
    { ref: 'SPI-AGRO-009', den: 'Socapalm', sigle: null, forme: 'SA', ville: 'Kribi', region: 'SUD', secteur: 'AGROALIMENTAIRE', ss: 'Plantation', produits: 'Huile de palme,Palmiste', lat: 2.9372, lng: 9.9072, actif: true, export: true, zone: false },
    { ref: 'SPI-AGRO-010', den: 'Cdc Development Corporation', sigle: 'CDC', forme: 'Parastatal', ville: 'Buea', region: 'SUD_OUEST', secteur: 'AGROALIMENTAIRE', ss: 'Plantation', produits: 'The,Banane,Palmier', lat: 4.1522, lng: 9.2429, actif: true, export: true, zone: false },
    { ref: 'SPI-AGRO-011', den: 'Boh Plantations', sigle: null, forme: 'SARL', ville: 'Tiko', region: 'SUD_OUEST', secteur: 'AGROALIMENTAIRE', ss: 'Plantation', produits: 'The,Caoutchouc', lat: 4.0892, lng: 9.3652, actif: true, export: true, zone: false },
    { ref: 'SPI-AGRO-012', den: 'Java Cameroun', sigle: null, forme: 'SAS', ville: 'Yaounde', region: 'CENTRE', secteur: 'AGROALIMENTAIRE', ss: 'Cafe', produits: 'Cafe torrefie,Cafe soluble', lat: 3.8480, lng: 11.5021, actif: true, export: true, zone: false },
    { ref: 'SPI-AGRO-013', den: 'Olam Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'AGROALIMENTAIRE', ss: 'Agro-industrie', produits: 'Cacao,Cafe,Coton', lat: 4.0523, lng: 9.7412, actif: true, export: true, zone: false },
    { ref: 'SPI-AGRO-014', den: 'Telcar Cocoa', sigle: null, forme: 'SARL', ville: 'Douala', region: 'LITTORAL', secteur: 'AGROALIMENTAIRE', ss: 'Cacao', produits: 'Feves de cacao,Poudre de cacao', lat: 4.0389, lng: 9.7567, actif: true, export: true, zone: false },
    { ref: 'SPI-AGRO-015', den: 'Cargill Cocoa & Chocolate', sigle: null, forme: 'Filiale', ville: 'Yaounde', region: 'CENTRE', secteur: 'AGROALIMENTAIRE', ss: 'Cacao', produits: 'Cacao,Chocolat', lat: 3.8578, lng: 11.5189, actif: true, export: true, zone: false },

    // MINES (12)
    { ref: 'SPI-MINE-001', den: 'Alucam', sigle: null, forme: 'SA', ville: 'Edea', region: 'LITTORAL', secteur: 'MINES_ET_CARRIERES', ss: 'Aluminium', produits: 'Aluminium,Alumine', lat: 3.8015, lng: 10.1258, actif: true, export: true, zone: false },
    { ref: 'SPI-MINE-002', den: 'Cameroon Alumina Limited', sigle: 'CAL', forme: 'SA', ville: 'Minim-Martap', region: 'ADAMAOUA', secteur: 'MINES_ET_CARRIERES', ss: 'Bauxite', produits: 'Bauxite,Alumine', lat: 6.5321, lng: 14.2915, actif: true, export: true, zone: false },
    { ref: 'SPI-MINE-003', den: 'Geovic Cameroun', sigle: null, forme: 'Filiale', ville: 'Yaounde', region: 'CENTRE', secteur: 'MINES_ET_CARRIERES', ss: 'Cobalt', produits: 'Cobalt,Nickel', lat: 3.8712, lng: 11.5123, actif: true, export: true, zone: false },
    { ref: 'SPI-MINE-004', den: 'Cam Iron', sigle: null, forme: 'SA', ville: 'Mbalam', region: 'EST', secteur: 'MINES_ET_CARRIERES', ss: 'Fer', produits: 'Minerai de fer', lat: 3.5215, lng: 14.6234, actif: true, export: true, zone: false },
    { ref: 'SPI-MINE-005', den: 'Sundance Resources', sigle: null, forme: 'Filiale', ville: 'Mbalam', region: 'EST', secteur: 'MINES_ET_CARRIERES', ss: 'Fer', produits: 'Minerai de fer', lat: 3.5123, lng: 14.6123, actif: true, export: true, zone: false },
    { ref: 'SPI-MINE-006', den: 'National Mining Company', sigle: 'SONAMINES', forme: 'Parastatal', ville: 'Yaounde', region: 'CENTRE', secteur: 'MINES_ET_CARRIERES', ss: 'Exploitation miniere', produits: 'Or,Diamant,Cobalt', lat: 3.8890, lng: 11.5234, actif: true, export: true, zone: false },
    { ref: 'SPI-MINE-007', den: 'Aurora Minerals', sigle: null, forme: 'SARL', ville: 'Betare-Oya', region: 'EST', secteur: 'MINES_ET_CARRIERES', ss: 'Or', produits: 'Or', lat: 5.6234, lng: 14.0789, actif: true, export: true, zone: false },
    { ref: 'SPI-MINE-008', den: 'Korean Cameroon Mining', sigle: null, forme: 'SARL', ville: 'Betare-Oya', region: 'EST', secteur: 'MINES_ET_CARRIERES', ss: 'Or', produits: 'Or', lat: 5.6123, lng: 14.0890, actif: true, export: true, zone: false },
    { ref: 'SPI-MINE-009', den: 'C&K Mining', sigle: null, forme: 'SARL', ville: 'Betare-Oya', region: 'EST', secteur: 'MINES_ET_CARRIERES', ss: 'Or', produits: 'Or', lat: 5.6345, lng: 14.0678, actif: true, export: true, zone: false },
    { ref: 'SPI-MINE-010', den: 'Mega Uranium', sigle: null, forme: 'Filiale', ville: 'Poli', region: 'NORD', secteur: 'MINES_ET_CARRIERES', ss: 'Uranium', produits: 'Uranium', lat: 8.4789, lng: 13.2345, actif: true, export: true, zone: false },
    { ref: 'SPI-MINE-011', den: 'Cameroon Cobalt Corporation', sigle: null, forme: 'SA', ville: 'Yaounde', region: 'CENTRE', secteur: 'MINES_ET_CARRIERES', ss: 'Cobalt', produits: 'Cobalt,Nickel', lat: 3.9012, lng: 11.5345, actif: true, export: true, zone: false },
    { ref: 'SPI-MINE-012', den: 'Bipindi Grand-Zambi', sigle: null, forme: 'SA', ville: 'Bipindi', region: 'SUD', secteur: 'MINES_ET_CARRIERES', ss: 'Fer', produits: 'Minerai de fer', lat: 3.1234, lng: 10.4567, actif: true, export: true, zone: false },

    // ENERGIE (10)
    { ref: 'SPI-ENE-001', den: 'Cameroon Oil Transportation Company', sigle: 'COTCO', forme: 'SA', ville: 'Douala', region: 'LITTORAL', secteur: 'ENERGIE_ET_EAU', ss: 'Petrole', produits: 'Transport petrole,Pipeline', lat: 4.0612, lng: 9.7234, actif: true, export: true, zone: false },
    { ref: 'SPI-ENE-002', den: 'Societe Nationale des Hydrocarbures', sigle: 'SNH', forme: 'Parastatal', ville: 'Yaounde', region: 'CENTRE', secteur: 'ENERGIE_ET_EAU', ss: 'Hydrocarbures', produits: 'Petrole,Gaz', lat: 3.8678, lng: 11.5123, actif: true, export: true, zone: false },
    { ref: 'SPI-ENE-003', den: 'Perenco Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'ENERGIE_ET_EAU', ss: 'Petrole', produits: 'Petrole brut,Gaz', lat: 4.0723, lng: 9.7345, actif: true, export: true, zone: false },
    { ref: 'SPI-ENE-004', den: 'Addax Petroleum', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'ENERGIE_ET_EAU', ss: 'Petrole', produits: 'Petrole brut', lat: 4.0834, lng: 9.7456, actif: true, export: true, zone: false },
    { ref: 'SPI-ENE-005', den: 'Victoria Oil & Gas', sigle: 'VOG', forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'ENERGIE_ET_EAU', ss: 'Gaz', produits: 'Gaz naturel', lat: 4.0945, lng: 9.7567, actif: true, export: false, zone: false },
    { ref: 'SPI-ENE-006', den: 'ENEO Cameroun', sigle: 'ENEO', forme: 'Concession', ville: 'Douala', region: 'LITTORAL', secteur: 'ENERGIE_ET_EAU', ss: 'Electricite', produits: 'Electricite,Distribution', lat: 4.0456, lng: 9.7678, actif: true, export: false, zone: false },
    { ref: 'SPI-ENE-007', den: 'AES Sonel', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'ENERGIE_ET_EAU', ss: 'Electricite', produits: 'Electricite', lat: 4.0567, lng: 9.7789, actif: true, export: false, zone: false },
    { ref: 'SPI-ENE-008', den: 'Cameroon Water Utilities Corporation', sigle: 'CAMWATER', forme: 'Parastatal', ville: 'Yaounde', region: 'CENTRE', secteur: 'ENERGIE_ET_EAU', ss: 'Eau', produits: 'Eau potable', lat: 3.8789, lng: 11.5234, actif: true, export: false, zone: false },
    { ref: 'SPI-ENE-009', den: 'Kribi Power Development Company', sigle: 'KPDC', forme: 'SA', ville: 'Kribi', region: 'SUD', secteur: 'ENERGIE_ET_EAU', ss: 'Electricite', produits: 'Electricite (gaz)', lat: 2.9456, lng: 9.9123, actif: true, export: false, zone: true },
    { ref: 'SPI-ENE-010', den: 'Dibamba Power Development Company', sigle: 'DPDC', forme: 'SA', ville: 'Douala', region: 'LITTORAL', secteur: 'ENERGIE_ET_EAU', ss: 'Electricite', produits: 'Electricite', lat: 4.0678, lng: 9.7890, actif: true, export: false, zone: false },

    // BTP (10)
    { ref: 'SPI-BTP-001', den: 'Cimenteries du Cameroun', sigle: 'CIMENCAM', forme: 'SA', ville: 'Douala', region: 'LITTORAL', secteur: 'CONSTRUCTION_ET_BTP', ss: 'Ciment', produits: 'Ciment,Beton', lat: 4.0789, lng: 9.7012, actif: true, export: true, zone: false },
    { ref: 'SPI-BTP-002', den: 'Dangote Cement Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'CONSTRUCTION_ET_BTP', ss: 'Ciment', produits: 'Ciment,Clinker', lat: 4.0890, lng: 9.7123, actif: true, export: true, zone: false },
    { ref: 'SPI-BTP-003', den: 'Mira Cement', sigle: null, forme: 'SARL', ville: 'Yaounde', region: 'CENTRE', secteur: 'CONSTRUCTION_ET_BTP', ss: 'Ciment', produits: 'Ciment', lat: 3.8901, lng: 11.5345, actif: true, export: false, zone: false },
    { ref: 'SPI-BTP-004', den: 'Cimaf Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'CONSTRUCTION_ET_BTP', ss: 'Ciment', produits: 'Ciment', lat: 4.0912, lng: 9.7234, actif: true, export: true, zone: false },
    { ref: 'SPI-BTP-005', den: 'SOCATU', sigle: null, forme: 'SA', ville: 'Douala', region: 'LITTORAL', secteur: 'CONSTRUCTION_ET_BTP', ss: 'BTP', produits: 'Construction,Genie civil', lat: 4.1023, lng: 9.7345, actif: true, export: false, zone: false },
    { ref: 'SPI-BTP-006', den: 'BICEC Construction', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'CONSTRUCTION_ET_BTP', ss: 'BTP', produits: 'Batiment,Infrastructure', lat: 4.1134, lng: 9.7456, actif: true, export: false, zone: false },
    { ref: 'SPI-BTP-007', den: 'Ets Jean Pouezet', sigle: null, forme: 'SARL', ville: 'Douala', region: 'LITTORAL', secteur: 'CONSTRUCTION_ET_BTP', ss: 'BTP', produits: 'Construction,Travaux publics', lat: 4.1245, lng: 9.7567, actif: true, export: false, zone: false },
    { ref: 'SPI-BTP-008', den: 'Magil Construction', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'CONSTRUCTION_ET_BTP', ss: 'BTP', produits: 'Construction,Genie civil', lat: 4.1356, lng: 9.7678, actif: true, export: false, zone: false },
    { ref: 'SPI-BTP-009', den: 'Razel Bec Cameroun', sigle: null, forme: 'Filiale', ville: 'Yaounde', region: 'CENTRE', secteur: 'CONSTRUCTION_ET_BTP', ss: 'BTP', produits: 'Travaux publics,Route', lat: 3.9012, lng: 11.5456, actif: true, export: false, zone: false },
    { ref: 'SPI-BTP-010', den: 'Colas Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'CONSTRUCTION_ET_BTP', ss: 'BTP', produits: 'Route,Batiment', lat: 4.1467, lng: 9.7789, actif: true, export: false, zone: false },

    // METALLURGIE (8)
    { ref: 'SPI-MET-001', den: 'Prometal', sigle: null, forme: 'SA', ville: 'Douala', region: 'LITTORAL', secteur: 'METALLURGIE_ET_SIDERURGIE', ss: 'Acier', produits: 'Fer a beton,Toles', lat: 4.1578, lng: 9.7890, actif: true, export: true, zone: false },
    { ref: 'SPI-MET-002', den: 'Africast', sigle: null, forme: 'SARL', ville: 'Douala', region: 'LITTORAL', secteur: 'METALLURGIE_ET_SIDERURGIE', ss: 'Acier', produits: 'Fer a beton,Toles', lat: 4.1689, lng: 9.7901, actif: true, export: false, zone: false },
    { ref: 'SPI-MET-003', den: 'Steel Cam', sigle: null, forme: 'SARL', ville: 'Douala', region: 'LITTORAL', secteur: 'METALLURGIE_ET_SIDERURGIE', ss: 'Acier', produits: 'Acier,Metal', lat: 4.1790, lng: 9.8012, actif: true, export: false, zone: false },
    { ref: 'SPI-MET-004', den: 'Aluminium du Cameroun', sigle: 'ALUCAM', forme: 'SA', ville: 'Edea', region: 'LITTORAL', secteur: 'METALLURGIE_ET_SIDERURGIE', ss: 'Aluminium', produits: 'Aluminium,Profiles', lat: 3.8123, lng: 10.1345, actif: true, export: true, zone: false },
    { ref: 'SPI-MET-005', den: 'Cameroun Aluminium', sigle: null, forme: 'SAS', ville: 'Edea', region: 'LITTORAL', secteur: 'METALLURGIE_ET_SIDERURGIE', ss: 'Aluminium', produits: 'Aluminium', lat: 3.8234, lng: 10.1456, actif: true, export: true, zone: false },
    { ref: 'SPI-MET-006', den: 'FerroCam', sigle: null, forme: 'SARL', ville: 'Douala', region: 'LITTORAL', secteur: 'METALLURGIE_ET_SIDERURGIE', ss: 'Fer', produits: 'Fonte,Acier', lat: 4.1801, lng: 9.8123, actif: true, export: false, zone: false },
    { ref: 'SPI-MET-007', den: 'Metallurgie du Cameroun', sigle: null, forme: 'SA', ville: 'Douala', region: 'LITTORAL', secteur: 'METALLURGIE_ET_SIDERURGIE', ss: 'Metallurgie', produits: 'Metaux,Alliages', lat: 4.1912, lng: 9.8234, actif: true, export: true, zone: false },
    { ref: 'SPI-MET-008', den: 'Societe Camerounaise de Siderurgie', sigle: 'SOCASID', forme: 'SA', ville: 'Kribi', region: 'SUD', secteur: 'METALLURGIE_ET_SIDERURGIE', ss: 'Siderurgie', produits: 'Acier,Fonte', lat: 2.9567, lng: 9.9234, actif: true, export: true, zone: true },

    // MECANIQUE (8)
    { ref: 'SPI-MEC-001', den: 'Tractafric Motors', sigle: null, forme: 'SA', ville: 'Douala', region: 'LITTORAL', secteur: 'MECANIQUE_ET_ELECTRIQUE', ss: 'Automobile', produits: 'Vehicules,Pieces detachees', lat: 4.2023, lng: 9.8345, actif: true, export: false, zone: false },
    { ref: 'SPI-MEC-002', den: 'Toyota Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'MECANIQUE_ET_ELECTRIQUE', ss: 'Automobile', produits: 'Vehicules Toyota', lat: 4.2134, lng: 9.8456, actif: true, export: false, zone: false },
    { ref: 'SPI-MEC-003', den: 'Mitsubishi Motors Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'MECANIQUE_ET_ELECTRIQUE', ss: 'Automobile', produits: 'Vehicules Mitsubishi', lat: 4.2245, lng: 9.8567, actif: true, export: false, zone: false },
    { ref: 'SPI-MEC-004', den: 'Midas Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'MECANIQUE_ET_ELECTRIQUE', ss: 'Pieces auto', produits: 'Pieces detachees', lat: 4.2356, lng: 9.8678, actif: true, export: false, zone: false },
    { ref: 'SPI-MEC-005', den: 'Eneo Equipements', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'MECANIQUE_ET_ELECTRIQUE', ss: 'Electrique', produits: 'Materiel electrique', lat: 4.2467, lng: 9.8789, actif: true, export: false, zone: false },
    { ref: 'SPI-MEC-006', den: 'Schneider Electric Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'MECANIQUE_ET_ELECTRIQUE', ss: 'Electrique', produits: 'Equipements electriques', lat: 4.2578, lng: 9.8890, actif: true, export: false, zone: false },
    { ref: 'SPI-MEC-007', den: 'Caterpillar Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'MECANIQUE_ET_ELECTRIQUE', ss: 'Engins', produits: 'Engins de chantier', lat: 4.2689, lng: 9.8901, actif: true, export: false, zone: false },
    { ref: 'SPI-MEC-008', den: 'Manutention Africaine', sigle: null, forme: 'SARL', ville: 'Douala', region: 'LITTORAL', secteur: 'MECANIQUE_ET_ELECTRIQUE', ss: 'Manutention', produits: 'Equipements de manutention', lat: 4.2790, lng: 9.9012, actif: true, export: false, zone: false },

    // CHIMIE (7)
    { ref: 'SPI-CHI-001', den: 'BASF Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'CHIMIE_ET_PHARMACIE', ss: 'Chimie', produits: 'Produits chimiques', lat: 4.2801, lng: 9.9123, actif: true, export: false, zone: false },
    { ref: 'SPI-CHI-002', den: 'Pharmacam', sigle: null, forme: 'SA', ville: 'Douala', region: 'LITTORAL', secteur: 'CHIMIE_ET_PHARMACIE', ss: 'Pharmacie', produits: 'Medicaments,Pharmacie', lat: 4.2912, lng: 9.9234, actif: true, export: false, zone: false },
    { ref: 'SPI-CHI-003', den: 'Sanofi Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'CHIMIE_ET_PHARMACIE', ss: 'Pharmacie', produits: 'Medicaments', lat: 4.3023, lng: 9.9345, actif: true, export: false, zone: false },
    { ref: 'SPI-CHI-004', den: 'Novartis Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'CHIMIE_ET_PHARMACIE', ss: 'Pharmacie', produits: 'Medicaments', lat: 4.3134, lng: 9.9456, actif: true, export: false, zone: false },
    { ref: 'SPI-CHI-005', den: 'Societe Camerounaise de Chimie', sigle: 'SOCACHIM', forme: 'SA', ville: 'Douala', region: 'LITTORAL', secteur: 'CHIMIE_ET_PHARMACIE', ss: 'Chimie', produits: 'Produits chimiques,Engrais', lat: 4.3245, lng: 9.9567, actif: true, export: true, zone: false },
    { ref: 'SPI-CHI-006', den: 'Industrie Chimique du Cameroun', sigle: 'ICC', forme: 'SARL', ville: 'Douala', region: 'LITTORAL', secteur: 'CHIMIE_ET_PHARMACIE', ss: 'Chimie', produits: 'Detergents,Savons', lat: 4.3356, lng: 9.9678, actif: true, export: false, zone: false },
    { ref: 'SPI-CHI-007', den: 'Produits Chimiques du Cameroun', sigle: 'PCC', forme: 'SARL', ville: 'Yaounde', region: 'CENTRE', secteur: 'CHIMIE_ET_PHARMACIE', ss: 'Chimie', produits: 'Peintures,Vernis', lat: 3.9123, lng: 11.5567, actif: true, export: false, zone: false },

    // BOIS (7)
    { ref: 'SPI-BOI-001', den: 'Rougier Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'BOIS_ET_PAPETERIE', ss: 'Bois', produits: 'Bois tropical,Grumes', lat: 4.3467, lng: 9.9789, actif: true, export: true, zone: false },
    { ref: 'SPI-BOI-002', den: 'Interholco', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'BOIS_ET_PAPETERIE', ss: 'Bois', produits: 'Bois tropical', lat: 4.3578, lng: 9.9890, actif: true, export: true, zone: false },
    { ref: 'SPI-BOI-003', den: 'Precious Woods', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'BOIS_ET_PAPETERIE', ss: 'Bois', produits: 'Bois tropical', lat: 4.3689, lng: 9.9901, actif: true, export: true, zone: false },
    { ref: 'SPI-BOI-004', den: 'Societe Forestiere et Industrielle', sigle: 'SFI', forme: 'SA', ville: 'Yaounde', region: 'CENTRE', secteur: 'BOIS_ET_PAPETERIE', ss: 'Bois', produits: 'Bois,Meubles', lat: 3.9234, lng: 11.5678, actif: true, export: true, zone: false },
    { ref: 'SPI-BOI-005', den: 'Papeterie du Cameroun', sigle: 'PAPERCAM', forme: 'SARL', ville: 'Douala', region: 'LITTORAL', secteur: 'BOIS_ET_PAPETERIE', ss: 'Papeterie', produits: 'Papier,Carton', lat: 4.3790, lng: 9.9012, actif: true, export: false, zone: false },
    { ref: 'SPI-BOI-006', den: 'Cameroon Paper Mills', sigle: null, forme: 'SA', ville: 'Douala', region: 'LITTORAL', secteur: 'BOIS_ET_PAPETERIE', ss: 'Papeterie', produits: 'Papier hygienique,Essuie-tout', lat: 4.3801, lng: 9.9123, actif: true, export: false, zone: false },
    { ref: 'SPI-BOI-007', den: 'Ets Jean Felicien Gournay', sigle: null, forme: 'SARL', ville: 'Douala', region: 'LITTORAL', secteur: 'BOIS_ET_PAPETERIE', ss: 'Meubles', produits: 'Meubles,Bois ouvre', lat: 4.3912, lng: 9.9234, actif: true, export: true, zone: false },

    // TEXTILE (6)
    { ref: 'SPI-TEX-001', den: 'CICAM', sigle: null, forme: 'SA', ville: 'Douala', region: 'LITTORAL', secteur: 'TEXTILE_ET_HABILLEMENT', ss: 'Textile', produits: 'Coton,Tissus', lat: 4.4023, lng: 9.9345, actif: true, export: true, zone: false },
    { ref: 'SPI-TEX-002', den: 'Societe de Developpement du Coton', sigle: 'SODECOTON', forme: 'Parastatal', ville: 'Garoua', region: 'NORD', secteur: 'TEXTILE_ET_HABILLEMENT', ss: 'Coton', produits: 'Coton,Graines', lat: 9.3012, lng: 13.3978, actif: true, export: true, zone: false },
    { ref: 'SPI-TEX-003', den: 'Tchinda Textile', sigle: null, forme: 'SARL', ville: 'Douala', region: 'LITTORAL', secteur: 'TEXTILE_ET_HABILLEMENT', ss: 'Habillement', produits: 'Vetements,Tissus', lat: 4.4134, lng: 9.9456, actif: true, export: false, zone: false },
    { ref: 'SPI-TEX-004', den: 'Pagnifik', sigle: null, forme: 'SARL', ville: 'Douala', region: 'LITTORAL', secteur: 'TEXTILE_ET_HABILLEMENT', ss: 'Habillement', produits: 'Pagnes,Vetements', lat: 4.4245, lng: 9.9567, actif: true, export: false, zone: false },
    { ref: 'SPI-TEX-005', den: 'Industrie Textile du Cameroun', sigle: 'ITC', forme: 'SA', ville: 'Douala', region: 'LITTORAL', secteur: 'TEXTILE_ET_HABILLEMENT', ss: 'Textile', produits: 'Tissus,Fil', lat: 4.4356, lng: 9.9678, actif: true, export: true, zone: false },
    { ref: 'SPI-TEX-006', den: 'Mode et Tissus du Cameroun', sigle: 'MTC', forme: 'SARL', ville: 'Yaounde', region: 'CENTRE', secteur: 'TEXTILE_ET_HABILLEMENT', ss: 'Habillement', produits: 'Vetements,Accessoires', lat: 3.9345, lng: 11.5789, actif: true, export: false, zone: false },

    // TIC (5)
    { ref: 'SPI-TIC-001', den: 'MTN Cameroun', sigle: 'MTN', forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'TIC_ET_NUMERIQUE', ss: 'Telecommunications', produits: 'Telephonie mobile,Internet', lat: 4.4467, lng: 9.9789, actif: true, export: false, zone: false },
    { ref: 'SPI-TIC-002', den: 'Orange Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'TIC_ET_NUMERIQUE', ss: 'Telecommunications', produits: 'Telephonie mobile,Internet', lat: 4.4578, lng: 9.9890, actif: true, export: false, zone: false },
    { ref: 'SPI-TIC-003', den: 'Camtel', sigle: null, forme: 'Parastatal', ville: 'Yaounde', region: 'CENTRE', secteur: 'TIC_ET_NUMERIQUE', ss: 'Telecommunications', produits: 'Internet,Fibre optique', lat: 3.9456, lng: 11.5901, actif: true, export: false, zone: false },
    { ref: 'SPI-TIC-004', den: 'Nexttel', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'TIC_ET_NUMERIQUE', ss: 'Telecommunications', produits: 'Telephonie mobile', lat: 4.4689, lng: 9.9901, actif: true, export: false, zone: false },
    { ref: 'SPI-TIC-005', den: 'YooMee Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'TIC_ET_NUMERIQUE', ss: 'Internet', produits: 'Internet 4G', lat: 4.4790, lng: 9.9012, actif: true, export: false, zone: false },

    // ZONES INDUSTRIELLES + SERVICES (12)
    { ref: 'SPI-ZON-001', den: 'Kribi Port Industrial Zone', sigle: 'KPIZ', forme: 'Zone', ville: 'Kribi', region: 'SUD', secteur: 'AUTRE', ss: 'Zone industrielle', produits: 'Infrastructure industrielle', lat: 2.9678, lng: 9.9345, actif: true, export: true, zone: true },
    { ref: 'SPI-ZON-002', den: 'Douala Industrial Zone', sigle: 'DIZ', forme: 'Zone', ville: 'Douala', region: 'LITTORAL', secteur: 'AUTRE', ss: 'Zone industrielle', produits: 'Infrastructure industrielle', lat: 4.4901, lng: 9.9123, actif: true, export: false, zone: true },
    { ref: 'SPI-ZON-003', den: 'Yaounde Industrial Zone', sigle: 'YIZ', forme: 'Zone', ville: 'Yaounde', region: 'CENTRE', secteur: 'AUTRE', ss: 'Zone industrielle', produits: 'Infrastructure industrielle', lat: 3.9567, lng: 11.6012, actif: true, export: false, zone: true },
    { ref: 'SPI-ZON-004', den: 'Bafoussam Industrial Zone', sigle: 'BIZ', forme: 'Zone', ville: 'Bafoussam', region: 'OUEST', secteur: 'AUTRE', ss: 'Zone industrielle', produits: 'Infrastructure industrielle', lat: 5.4789, lng: 10.4189, actif: true, export: false, zone: true },
    { ref: 'SPI-ZON-005', den: 'Bamenda Industrial Zone', sigle: 'BaIZ', forme: 'Zone', ville: 'Bamenda', region: 'NORD_OUEST', secteur: 'AUTRE', ss: 'Zone industrielle', produits: 'Infrastructure industrielle', lat: 5.9590, lng: 10.1456, actif: true, export: false, zone: true },
    { ref: 'SPI-AUT-001', den: 'Societe Generale Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'AUTRE', ss: 'Services', produits: 'Services financiers', lat: 4.5012, lng: 9.9234, actif: true, export: false, zone: false },
    { ref: 'SPI-AUT-002', den: 'Ecobank Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'AUTRE', ss: 'Services', produits: 'Services bancaires', lat: 4.5123, lng: 9.9345, actif: true, export: false, zone: false },
    { ref: 'SPI-AUT-003', den: 'Afriland First Bank', sigle: null, forme: 'SA', ville: 'Douala', region: 'LITTORAL', secteur: 'AUTRE', ss: 'Services', produits: 'Services bancaires', lat: 4.5234, lng: 9.9456, actif: true, export: false, zone: false },
    { ref: 'SPI-AUT-004', den: 'Activa Assurances', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'AUTRE', ss: 'Services', produits: 'Assurances', lat: 4.5345, lng: 9.9567, actif: true, export: false, zone: false },
    { ref: 'SPI-AUT-005', den: 'Societe Camerounaise de Banque', sigle: 'SCB', forme: 'SA', ville: 'Douala', region: 'LITTORAL', secteur: 'AUTRE', ss: 'Services', produits: 'Services bancaires', lat: 4.5456, lng: 9.9678, actif: true, export: false, zone: false },
    { ref: 'SPI-AUT-006', den: 'Chanas Assurances', sigle: null, forme: 'SA', ville: 'Douala', region: 'LITTORAL', secteur: 'AUTRE', ss: 'Services', produits: 'Assurances', lat: 4.5567, lng: 9.9789, actif: true, export: false, zone: false },
    { ref: 'SPI-AUT-007', den: 'BGFI Bank Cameroun', sigle: null, forme: 'Filiale', ville: 'Douala', region: 'LITTORAL', secteur: 'AUTRE', ss: 'Services', produits: 'Services bancaires', lat: 4.5678, lng: 9.9890, actif: true, export: false, zone: false },
  ];

  for (const e of entreprises) {
    await prisma.entreprise.create({
      data: {
        referenceSPI: e.ref,
        denomination: e.den,
        sigle: e.sigle,
        formeJuridique: e.forme,
        adresse: `${e.ville}, Cameroun`,
        ville: e.ville,
        departement: e.ville,
        region: e.region,
        secteurActivite: e.secteur,
        sousSecteur: e.ss,
        produitsPrincipaux: e.produits,
        statut: e.actif ? 'ACTIF' : 'EN_CREATION',
        estExportateur: e.export,
        estDansZoneIndustrielle: e.zone,
        nomZoneIndustrielle: e.zone ? `${e.ville} Industrial Zone` : null,
        latitude: e.lat,
        longitude: e.lng,
      },
    });
  }

  console.log(`   ✅ ${entreprises.length} entreprises creees`);

  // ==================== CONFIG SYSTEME ====================
  console.log('⚙️  Configuration systeme...');

  await prisma.configSystem.create({
    data: {
      anneeEnCours: 2026,
      seuilAlerteProduction: 15.00,
      emailNotifications: 'admin@spi-cam.cm',
      frequenceRappelSaisie: 'MENSUEL',
    },
  });

  console.log('   ✅ Configuration systeme creee');

  console.log('\n🎉 SEEDING TERMINE AVEC SUCCES !');
  console.log('====================================');
  console.log('Comptes de test :');
  console.log('  superadmin@spi-cam.cm / SpiCam2026! (SUPER_ADMIN)');
  console.log('  admin@spi-cam.cm / SpiCam2026! (ADMIN)');
  console.log('  agent1@spi-cam.cm / SpiCam2026! (AGENT_SAISIE)');
  console.log('  agent2@spi-cam.cm / SpiCam2026! (AGENT_SAISIE)');
  console.log('\nPour reinitialiser : node seed-render.js --force');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
