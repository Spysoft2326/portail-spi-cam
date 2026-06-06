import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const users = [
      {
        name: "Super-Admin",
        email: "superadmin@spi-cam.cm",
        password: await bcrypt.hash("SpiCam2026!", 10),
        role: "SUPER_ADMIN",
        isActive: true,
      },
      {
        name: "Administrateur",
        email: "admin@spi-cam.cm",
        password: await bcrypt.hash("SpiCam2026!", 10),
        role: "ADMIN",
        isActive: true,
      },
      {
        name: "Agent de saisie 1",
        email: "agent1@spi-cam.cm",
        password: await bcrypt.hash("SpiCam2026!", 10),
        role: "AGENT_SAISIE",
        isActive: true,
      },
      {
        name: "Agent de saisie 2",
        email: "agent2@spi-cam.cm",
        password: await bcrypt.hash("SpiCam2026!", 10),
        role: "AGENT_SAISIE",
        isActive: true,
      },
    ];

    for (const user of users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: user,
      });
    }

    return NextResponse.json({ success: true, message: "Users seeded successfully" });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
