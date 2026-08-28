import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDefaultLicenseConfigs } from "@/lib/license-defaults";

// GET /api/license-configs - Fetch active license type configurations for Profile modal
export async function GET() {
  try {
    await ensureDefaultLicenseConfigs();

    const configs = await prisma.licenseTypeConfig.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ configs });
  } catch (error: any) {
    console.error("GET /api/license-configs error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทใบอนุญาต" },
      { status: 500 }
    );
  }
}

