const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('Debut du seeding entreprises...');
  
  const entreprises = [
    {
      referenceSPI: 'SPI-CAM-2026-001',
      denomination: 'Camerounaise de Boissons',
      sigle: 'Cambev',
      formeJuridique: 'SA',
      adresse: 'Douala',
      ville: 'Douala',
      departement: 'Wouri',
      region: 'LITTORAL',
      telephone: '+237 233 39 12 12',
      email: 'contact@cambev.cm',
      secteurActivite: 'AGROALIMENTAIRE',
      sousSecteur: 'Boissons',
      produitsPrincipaux: 'Eau minérale, Jus, Bières',
      statut: 'ACTIF',
      estExportateur: true,
      estDansZoneIndustrielle: true,
      nomZoneIndustrielle: 'Zone Industrielle Bonabéri',
    },
    // Ajoute plus d'entreprises ici...
  ];
  
  for (const e of entreprises) {
    await prisma.entreprise.upsert({
      where: { referenceSPI: e.referenceSPI },
      update: {},
      create: e,
    });
    console.log('Entreprise creee:', e.denomination);
  }
  
  console.log('Seeding entreprises termine!');
}

seed()
  .catch(e => console.error(e))
  .finally(() => prisma.());
