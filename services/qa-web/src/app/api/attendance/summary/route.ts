import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/attendance/summary?assignmentId=...
 * สรุปรายงานสถิติเวลาเรียนรายวิชาตามเกณฑ์ 80%
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json({ error: "กรุณาระบุ assignmentId" }, { status: 400 });
    }

    // 1. Fetch assignment info
    const assignment = await prisma.teachingAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: true,
        teacher: { select: { id: true, name: true, email: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "ไม่พบข้อมูลการสอนนี้" }, { status: 404 });
    }

    // 2. Fetch all students in this classroom
    const students = await prisma.student.findMany({
      where: {
        level: assignment.level,
        year: assignment.year,
        majorCode: assignment.majorCode,
        room: assignment.room,
        academicYear: assignment.academicYear,
        semester: assignment.semester,
      },
      orderBy: [{ studentCode: "asc" }],
    });

    // 3. Fetch all attendance records for this assignment
    const records = await prisma.attendanceRecord.findMany({
      where: { assignmentId },
    });

    // Count sessions
    const sessionCount = await prisma.attendanceSession.count({
      where: { assignmentId },
    });

    // 4. Aggregate per student
    const studentSummaryList = students.map((std) => {
      const stdRecords = records.filter((r) => r.studentCode === std.studentCode || r.studentId === std.id);
      const present = stdRecords.filter((r) => r.status === "PRESENT").length;
      const late = stdRecords.filter((r) => r.status === "LATE").length;
      const absent = stdRecords.filter((r) => r.status === "ABSENT").length;
      const leave = stdRecords.filter((r) => r.status === "LEAVE").length;
      const totalChecked = stdRecords.length;

      // Rate: (Present + 0.5 * Late + 0.5 * Leave) / totalChecked * 100
      let rate = 100;
      if (totalChecked > 0) {
        const effectivePresent = present + (late * 0.5) + (leave * 0.5);
        rate = Number(((effectivePresent / totalChecked) * 100).toFixed(1));
      }

      const isPassing80 = rate >= 80;

      return {
        id: std.id,
        studentCode: std.studentCode,
        prefix: std.prefix,
        firstName: std.firstName,
        lastName: std.lastName,
        room: std.room,
        status: std.status,
        present,
        late,
        absent,
        leave,
        totalChecked,
        rate,
        isPassing80,
      };
    });

    // 5. Class level stats
    const totalStudents = studentSummaryList.length;
    const passingCount = studentSummaryList.filter((s) => s.isPassing80).length;
    const failingCount = totalStudents - passingCount;
    const totalRateSum = studentSummaryList.reduce((acc, s) => acc + s.rate, 0);
    const classAverageRate = totalStudents > 0 ? Number((totalRateSum / totalStudents).toFixed(1)) : 100;
    const passingPercentage = totalStudents > 0 ? Number(((passingCount / totalStudents) * 100).toFixed(1)) : 100;

    return NextResponse.json({
      assignment,
      totalSessions: sessionCount,
      stats: {
        totalStudents,
        classAverageRate,
        passingCount,
        failingCount,
        passingPercentage,
      },
      students: studentSummaryList,
    });
  } catch (error: any) {
    console.error("[GET /api/attendance/summary] Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการคำนวณสถิติเวลาเรียน" },
      { status: 500 }
    );
  }
}
