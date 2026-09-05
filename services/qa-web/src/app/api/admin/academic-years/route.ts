import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/academic-years
 * ดึงรายการปีการศึกษาและภาคเรียนทั้งหมด
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
    }

    const items = await prisma.academicYearConfig.findMany({
      where,
      orderBy: [
        { year: "desc" },
        { semester: "asc" },
      ],
    });

    const current = items.find((i) => i.isCurrent) || items[0] || null;

    return NextResponse.json({ items, current });
  } catch (error: any) {
    console.error("[GET /api/admin/academic-years] Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลปีการศึกษา" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/academic-years
 * เพิ่มปีการศึกษาและภาคเรียนใหม่
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isRoot = session.user.role === "ROOT";
    const userPermissions = (session.user as any).permissions || [];
    const canManage = isRoot || userPermissions.includes("academic_year.manage") || userPermissions.includes("/admin/users");

    if (!canManage) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์จัดการปีการศึกษา" }, { status: 403 });
    }

    const body = await request.json();
    const { year, semester, label, isCurrent, startDate, endDate } = body;

    if (!year || !semester || !label) {
      return NextResponse.json(
        { error: "กรุณาระบุปีการศึกษา (พ.ศ.), ภาคเรียน และป้ายกำกับ" },
        { status: 400 }
      );
    }

    // Check duplicate
    const existing = await prisma.academicYearConfig.findUnique({
      where: {
        year_semester: {
          year: String(year).trim(),
          semester: String(semester).trim(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `ปีการศึกษา ${year} ภาคเรียน ${semester} มีอยู่ในระบบแล้ว` },
        { status: 409 }
      );
    }

    // If setting as current, unset previous current
    if (isCurrent) {
      await prisma.academicYearConfig.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      });
    }

    const item = await prisma.academicYearConfig.create({
      data: {
        year: String(year).trim(),
        semester: String(semester).trim(),
        label: String(label).trim(),
        isCurrent: Boolean(isCurrent),
        isActive: true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({ message: "เพิ่มรอบปีการศึกษาสำเร็จ", item }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/admin/academic-years] Error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการเพิ่มปีการศึกษา" },
      { status: 500 }
    );
  }
}
