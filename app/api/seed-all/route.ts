import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function POST() {
  try {
    // Exécuter le script de seeding des entreprises
    execSync('node scripts/seed-enterprises.js', { cwd: process.cwd(), stdio: 'inherit' });
    
    return NextResponse.json({ success: true, message: 'Enterprises seeded successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
