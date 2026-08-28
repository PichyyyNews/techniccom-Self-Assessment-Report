import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDefaultLicenseConfigs } from "@/lib/license-defaults";

export async function GET() {
  try {
    await ensureDefaultLicenseConfigs();

    const categories = await prisma.licenseCategoryConfig.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Failed to fetch license categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch license categories" },
      { status: 500 }
    );
  }
}

