import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/students
 * ดึงรายชื่อนักเรียน พร้อม search, filter, pagination
 *
 * Query params:
 *  - search: ค้นหาด้วย studentCode / firstName / lastName
 *  - level: กรองตามระดับชั้น (ปวช, ปวส)
 *  - year: กรองตามชั้นปี (1, 2, 3)
 *  - majorCode: กรองตามรหัสสาขา
 *  - status: กรองตามสถานะ (ACTIVE, GRADUATED, SUSPENDED, DROPPED)
 *  - academicYear: ปีการศึกษา
 *  - semester: ภาคเรียน
 *  - page: หน้าปัจจุบัน (default: 1)
 *  - limit: จำนวนต่อหน้า (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const level = searchParams.get("level") || "";
    const year = searchParams.get("year") || "";
    const majorCode = searchParams.get("majorCode") || "";
    const status = searchParams.get("status") || "";
    const academicYear = searchParams.get("academicYear") || "";
    const semester = searchParams.get("semester") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    // Build Prisma where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { studentCode: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }
    if (level) where.level = level;
    if (year) where.year = year;
    if (majorCode) where.majorCode = majorCode;
    if (status) where.status = status;
    if (academicYear) where.academicYear = academicYear;
    if (semester) where.semester = semester;

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          advisor: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ studentCode: "asc" }],
        skip,
        take: limit,
      }),
      prisma.student.count({ where }),
    ]);

    return NextResponse.json({
      students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/students] Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียน" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/students
 * เพิ่มนักเรียนรายคน
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      studentCode,
      prefix,
      firstName,
      lastName,
      level,
      year,
      majorName,
      majorCode,
      room,
      status,
      academicYear,
      semester,
      advisorId,
    } = body;

    // Basic validation
    if (!studentCode || !firstName || !lastName || !level || !year || !majorName || !majorCode || !room || !academicYear) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const student = await prisma.student.create({
      data: {
        studentCode: studentCode.trim(),
        prefix: prefix || "",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        level,
        year,
        majorName,
        majorCode,
        room,
        status: status || "ACTIVE",
        academicYear,
        semester: semester || "1",
        advisorId: advisorId || null,
      },
      include: {
        advisor: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/students] Error:", error);

    // Handle unique constraint violation
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "รหัสนักศึกษานี้มีอยู่แล้วในปีการศึกษาและภาคเรียนที่เลือก" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเพิ่มข้อมูลนักเรียน" },
      { status: 500 }
    );
  }
}
