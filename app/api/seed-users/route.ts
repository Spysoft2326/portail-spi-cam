import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Supprime les users existants (pour recréer avec hash)
    await prisma.user.deleteMany();
    
    const hashedPassword = await bcrypt.hash("SpiCam2026!", 10);
    
    const users = [
      { email: "superadmin@spi-cam.cm", name: "Super Administrateur", password: hashedPassword, role: "SUPER_ADMIN" },
      { email: "admin@spi-cam.cm", name: "Administrateur", password: hashedPassword, role: "ADMIN" },
      { email: "agent1@spi-cam.cm", name: "Agent 1", password: hashedPassword, role: "AGENT" },
    ];

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
      message: `Users recreated with hashed passwords`, 
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