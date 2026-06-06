import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = [
  { email: "superadmin@spi-cam.cm", name: "Super Administrateur", password: "SpiCam2026!", role: "SUPER_ADMIN" },
  { email: "admin@spi-cam.cm", name: "Administrateur", password: "SpiCam2026!", role: "ADMIN" },
  { email: "agent1@spi-cam.cm", name: "Agent 1", password: "SpiCam2026!", role: "AGENT" },
];

export async function POST(request: NextRequest) {
  try {
    // Check if users already exist
    const existingCount = await prisma.user.count();
    if (existingCount > 0) {
      return NextResponse.json({ 
        message: `Database already has ${existingCount} users`, 
        status: "already_seeded" 
      });
    }

    // Seed users
    let created = 0;
    for (const user of users) {
      try {
        await prisma.user.create({ data: user });
        created++;
      } catch (e) {
        console.error(`Error creating user ${user.email}:`, e);
      }
    }

    return NextResponse.json({ 
      message: `Users seeding complete`, 
      created,
      status: "success" 
    });

  } catch (error) {
    return NextResponse.json({ 
      message: "Users seeding failed", 
      error: (error as Error).message,
      status: "error" 
    }, { status: 500 });
  }
}
