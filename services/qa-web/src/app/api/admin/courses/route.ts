import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/courses
 * ดึงรายการหลักสูตรรายวิชาทั้งหมด
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const majorCode = searchParams.get("majorCode");
    const search = searchParams.get("search");

    const where: any = {};
    if (level) where.level = level;
    if (majorCode) where.majorCode = majorCode;
    if (search) {
      where.OR = [
        { courseCode: { contains: search, mode: "insensitive" } },
        { courseName: { contains: search, mode: "insensitive" } },
      ];
    }

    const items = await prisma.course.findMany({
      where,
      include: {
        _count: {
          select: { assignments: true },
        },
      },
      orderBy: [{ level: "asc" }, { courseCode: "asc" }],
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("[GET /api/admin/courses] Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/courses
 * สร้างรายวิชาใหม่
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isRoot = session.user.role === "ROOT";
    const permissions = (session.user as any).permissions || [];
    const canManage =
      isRoot ||
      permissions.includes("curriculum.manage") ||
      permissions.includes("/admin/users");

    if (!canManage) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์จัดการข้อมูลรายวิชา" }, { status: 403 });
    }

    const body = await request.json();
    const {
      courseCode,
      courseName,
      theoryHours = 2,
      practiceHours = 2,
      credits = 3,
      level = "ปวช",
      majorCode = "ชทค",
    } = body;

    if (!courseCode || !courseName) {
      return NextResponse.json(
        { error: "กรุณาระบุรหัสวิชาและชื่อวิชา" },
        { status: 400 }
      );
    }

    const cleanCode = String(courseCode).trim();
    const existing = await prisma.course.findUnique({
      where: { courseCode: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `รหัสวิชา ${cleanCode} มีอยู่ในระบบแล้ว` },
        { status: 409 }
      );
    }

    const item = await prisma.course.create({
      data: {
        courseCode: cleanCode,
        courseName: String(courseName).trim(),
        theoryHours: Number(theoryHours),
        practiceHours: Number(practiceHours),
        credits: Number(credits),
        level: String(level).trim(),
        majorCode: String(majorCode).trim(),
        isActive: true,
      },
    });

    return NextResponse.json({ message: "เพิ่มรายวิชาสำเร็จ", item }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/admin/courses] Error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการสร้างรายวิชา" },
      { status: 500 }
    );
  }
}
