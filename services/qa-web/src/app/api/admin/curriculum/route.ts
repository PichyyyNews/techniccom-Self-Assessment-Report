import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/curriculum
 * ดึงรายการชั้นเรียน สาขาวิชา และห้องเรียนทั้งหมด
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const year = searchParams.get("year");
    const activeOnly = searchParams.get("active") === "true";

    const where: any = {};
    if (level) where.level = level;
    if (year) where.year = year;
    if (activeOnly) where.isActive = true;

    const items = await prisma.classSectionConfig.findMany({
      where,
      orderBy: [
        { level: "asc" },
        { year: "asc" },
        { majorCode: "asc" },
        { room: "asc" },
      ],
    });

    // Unique list of majors for dropdowns
    const uniqueMajorsMap = new Map<string, { name: string; code: string }>();
    items.forEach((item) => {
      if (!uniqueMajorsMap.has(item.majorCode)) {
        uniqueMajorsMap.set(item.majorCode, { name: item.majorName, code: item.majorCode });
      }
    });

    return NextResponse.json({
      items,
      majors: Array.from(uniqueMajorsMap.values()),
    });
  } catch (error: any) {
    console.error("[GET /api/admin/curriculum] Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลโครงสร้างชั้นเรียน" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/curriculum
 * เพิ่มระดับชั้น สาขา และห้องเรียนใหม่
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isRoot = session.user.role === "ROOT";
    const userPermissions = (session.user as any).permissions || [];
    const canManage = isRoot || userPermissions.includes("curriculum.manage") || userPermissions.includes("/admin/users");

    if (!canManage) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์จัดการข้อมูลโครงสร้างชั้นเรียน" }, { status: 403 });
    }

    const body = await request.json();
    const { level, year, majorName, majorCode, room, sortOrder } = body;

    if (!level || !year || !majorName || !majorCode || !room) {
      return NextResponse.json(
        { error: "กรุณาระบุระดับชั้น, ชั้นปี, ชื่อสาขา, รหัสย่อสาขา และห้อง/กลุ่ม" },
        { status: 400 }
      );
    }

    const existing = await prisma.classSectionConfig.findUnique({
      where: {
        level_year_majorCode_room: {
          level: String(level).trim(),
          year: String(year).trim(),
          majorCode: String(majorCode).trim(),
          room: String(room).trim(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `ห้องเรียน ${level}.${year} ${majorCode} กลุ่ม ${room} มีอยู่ในระบบแล้ว` },
        { status: 409 }
      );
    }

    const item = await prisma.classSectionConfig.create({
      data: {
        level: String(level).trim(),
        year: String(year).trim(),
        majorName: String(majorName).trim(),
        majorCode: String(majorCode).trim(),
        room: String(room).trim(),
        sortOrder: sortOrder ? Number(sortOrder) : 0,
        isActive: true,
      },
    });

    return NextResponse.json({ message: "เพิ่มข้อมูลห้องเรียนสำเร็จ", item }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/admin/curriculum] Error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการเพิ่มห้องเรียน" },
      { status: 500 }
    );
  }
}
