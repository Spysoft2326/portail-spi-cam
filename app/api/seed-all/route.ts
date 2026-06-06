import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    // Seed users
    const users = [
      { name: 'Super-Admin', email: 'superadmin@spi-cam.cm', password: await bcrypt.hash('SpiCam2026!', 10), role: 'SUPER_ADMIN', isActive: true },
      { name: 'Administrateur', email: 'admin@spi-cam.cm', password: await bcrypt.hash('SpiCam2026!', 10), role: 'ADMIN', isActive: true },
      { name: 'Agent 1', email: 'agent1@spi-cam.cm', password: await bcrypt.hash('SpiCam2026!', 10), role: 'AGENT_SAISIE', isActive: true },
      { name: 'Agent 2', email: 'agent2@spi-cam.cm', password: await bcrypt.hash('SpiCam2026!', 10), role: 'AGENT_SAISIE', isActive: true },
    ];

    for (const user of users) {
      await prisma.user.upsert({ where: { email: user.email }, update: {}, create: user });
    }

    // Seed enterprises
    const entreprises = [
      { referenceSPI: 'SPI-CAM-2026-001', denomination: 'Camerounaise de Boissons', sigle: 'Cambev', formeJuridique: 'SA', adresse: 'Douala', ville: 'Douala', departement: 'Wouri', region: 'LITTORAL', telephone: '+237 233 39 12 12', email: 'contact@cambev.cm', secteurActivite: 'AGROALIMENTAIRE', sousSecteur: 'Boissons', produitsPrincipaux: 'Eau minérale, Jus, Bières', statut: 'ACTIF', estExportateur: true, estDansZoneIndustrielle: true, nomZoneIndustrielle: 'Zone Industrielle Bonabéri' },
      { referenceSPI: 'SPI-CAM-2026-002', denomination: 'Société Camerounaise de Ciment', sigle: 'CIMENCAM', formeJuridique: 'SA', adresse: 'Yaoundé', ville: 'Yaoundé', departement: 'Mfoundi', region: 'CENTRE', telephone: '+237 222 23 45 67', email: 'contact@cimencam.cm', secteurActivite: 'CONSTRUCTION_ET_BTP', sousSecteur: 'Ciment', produitsPrincipaux: 'Ciment, Béton', statut: 'ACTIF', estExportateur: false, estDansZoneIndustrielle: true, nomZoneIndustrielle: 'Zone Industrielle Yaoundé' },
    ];

    for (const e of entreprises) {
      await prisma.entreprise.upsert({ where: { referenceSPI: e.referenceSPI }, update: {}, create: e });
    }

    return NextResponse.json({ success: true, message: 'Users and enterprises seeded successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
