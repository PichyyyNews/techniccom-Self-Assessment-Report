import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/teaching-assignments
 * ดึงรายการมอบหมายรายวิชาสอน
 * Query params:
 *  - academicYear: ปีการศึกษา (default: latest/all)
 *  - semester: ภาคเรียน
 *  - teacherId: คัดกรองตามครูผู้สอน
 *  - myOnly: ดึงเฉพาะวิชาที่ตนเองสอน
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get("academicYear");
    const semester = searchParams.get("semester");
    const filterTeacherId = searchParams.get("teacherId");
    const myOnly = searchParams.get("myOnly") === "true";

    const isRoot = session.user.role === "ROOT";
    const userRoleCode = (session.user as any).roleCode || "";
    const permissions = (session.user as any).permissions || [];
    const isDeptHead = userRoleCode === "DEPT_HEAD" || permissions.includes("curriculum.manage");

    const where: any = {};
    if (academicYear) where.academicYear = academicYear;
    if (semester && semester !== "all") where.semester = semester;

    // If regular teacher or explicitly requested myOnly
    if (myOnly || (!isRoot && !isDeptHead)) {
      where.teacherId = session.user.id;
    } else if (filterTeacherId) {
      where.teacherId = filterTeacherId;
    }

    const items = await prisma.teachingAssignment.findMany({
      where,
      include: {
        course: true,
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            position: true,
          },
        },
        _count: {
          select: {
            sessions: true,
            records: true,
          },
        },
      },
      orderBy: [
        { level: "asc" },
        { year: "asc" },
        { room: "asc" },
        { course: { courseCode: "asc" } },
      ],
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("[GET /api/admin/teaching-assignments] Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลการมอบหมายสอน" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/teaching-assignments
 * มอบหมายวิชาสอนให้ครู (โดย Admin หรือ หัวหน้าแผนก)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isRoot = session.user.role === "ROOT";
    const userRoleCode = (session.user as any).roleCode || "";
    const permissions = (session.user as any).permissions || [];
    const canAssign =
      isRoot ||
      userRoleCode === "DEPT_HEAD" ||
      permissions.includes("curriculum.manage") ||
      permissions.includes("/admin/users");

    if (!canAssign) {
      return NextResponse.json(
        { error: "ไม่มีสิทธิ์มอบหมายรายวิชาสอน (เฉพาะ Admin หรือ หัวหน้าแผนก)" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      courseId,
      teacherId,
      academicYear,
      semester = "1",
      level,
      year,
      majorCode = "ชทค",
      room = "1",
      totalPeriods = 72,
    } = body;

    if (!courseId || !teacherId || !academicYear || !level || !year || !room) {
      return NextResponse.json(
        { error: "กรุณาระบุรายวิชา, ครูผู้สอน, ปีการศึกษา, เทอม, ระดับชั้น, ชั้นปี และห้องเรียนให้ครบถ้วน" },
        { status: 400 }
      );
    }

    // Check duplicate assignment
    const existing = await prisma.teachingAssignment.findUnique({
      where: {
        courseId_teacherId_academicYear_semester_level_year_majorCode_room: {
          courseId,
          teacherId,
          academicYear: String(academicYear),
          semester: String(semester),
          level: String(level),
          year: String(year),
          majorCode: String(majorCode),
          room: String(room),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "ครูท่านนี้ได้รับการมอบหมายวิชาและห้องเรียนนี้ในเทอมที่เลือกไว้แล้ว" },
        { status: 409 }
      );
    }

    const item = await prisma.teachingAssignment.create({
      data: {
        courseId,
        teacherId,
        academicYear: String(academicYear),
        semester: String(semester),
        level: String(level),
        year: String(year),
        majorCode: String(majorCode),
        room: String(room),
        totalPeriods: Number(totalPeriods) || 72,
      },
      include: {
        course: true,
        teacher: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ message: "มอบหมายวิชาสอนสำเร็จ", item }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/admin/teaching-assignments] Error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการมอบหมายวิชาสอน" },
      { status: 500 }
    );
  }
}
