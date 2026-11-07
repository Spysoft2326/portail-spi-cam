import { NextResponse } from 'next/server';
import { requireSeedAccess } from "@/lib/api-guard";
import { execSync } from 'child_process';

export async function POST() {
  // Sécurité : route désactivée en production sauf ALLOW_SEED_ROUTES=true + SUPER_ADMIN
  const auth = await requireSeedAccess();
  if (auth.error) return auth.error;

  try {
    // Exécuter le script de seeding des entreprises
    execSync('node scripts/seed-enterprises.js', { cwd: process.cwd(), stdio: 'inherit' });
    
    return NextResponse.json({ success: true, message: 'Enterprises seeded successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
