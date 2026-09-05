import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/students/stats
 * คืนค่าสถิติ KPI สรุปภาพรวมนักเรียน
 * Query params:
 *  - academicYear: ปีการศึกษา (default: latest or all)
 *  - semester: ภาคเรียน
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

    const where: any = {};
    if (academicYear) where.academicYear = academicYear;
    if (semester) where.semester = semester;

    const assignmentWhere: any = {};
    if (academicYear) assignmentWhere.academicYear = academicYear;
    if (semester && semester !== "all") assignmentWhere.semester = semester;

    const [
      totalStudents,
      activeStudents,
      vocationalCount, // ปวช
      highVocationalCount, // ปวส
      maleCount,
      femaleCount,
      attendancePresentCount,
      attendanceTotalCount,
      studentWorkCount,
    ] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.count({ where: { ...where, status: "ACTIVE" } }),
      prisma.student.count({ where: { ...where, level: "ปวช" } }),
      prisma.student.count({ where: { ...where, level: "ปวส" } }),
      prisma.student.count({ where: { ...where, prefix: "นาย" } }),
      prisma.student.count({ where: { ...where, prefix: "นางสาว" } }),
      prisma.attendanceRecord.count({
        where: {
          assignment: assignmentWhere,
          status: { in: ["PRESENT", "LATE"] },
        },
      }),
      prisma.attendanceRecord.count({
        where: {
          assignment: assignmentWhere,
        },
      }),
      prisma.evidenceFile.count({
        where: {
          category: "student_work",
          ...(academicYear ? { academicYear } : {}),
        },
      }),
    ]);

    const retentionRate =
      totalStudents > 0
        ? Number(((activeStudents / totalStudents) * 100).toFixed(1))
        : 100;

    const attendanceRate =
      attendanceTotalCount > 0
        ? Number(((attendancePresentCount / attendanceTotalCount) * 100).toFixed(1))
        : 95.0;

    return NextResponse.json({
      totalStudents,
      activeStudents,
      vocationalCount,
      highVocationalCount,
      maleCount,
      femaleCount,
      retentionRate,
      attendanceRate,
      attendanceTotalCount,
      studentWorkCount,
    });
  } catch (error: any) {
    console.error("[GET /api/students/stats] Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงสถิตินักเรียน" },
      { status: 500 }
    );
  }
}
