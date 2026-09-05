import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/analytics/students
 * ข้อมูลสถิติเชิงสำรวจโครงสร้างประชากรผู้เรียนและอัตราคงอยู่ (Student Demographic & Cohort EDA)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get("academicYear") || "2569";

    // 1. Fetch all students for this academic year
    const students = await prisma.student.findMany({
      where: { academicYear },
      select: {
        id: true,
        level: true,
        year: true,
        prefix: true,
        status: true,
        room: true,
      },
    });

    // 2. Population Pyramid by Cohort & Gender
    // Groups: ปวช.1, ปวช.2, ปวช.3, ปวส.1, ปวส.2
    const cohortGroups: Record<string, { male: number; female: number; total: number }> = {
      "ปวช.1": { male: 0, female: 0, total: 0 },
      "ปวช.2": { male: 0, female: 0, total: 0 },
      "ปวช.3": { male: 0, female: 0, total: 0 },
      "ปวส.1": { male: 0, female: 0, total: 0 },
      "ปวส.2": { male: 0, female: 0, total: 0 },
    };

    // 3. Status Distribution
    const statusCounts: Record<string, number> = {
      ACTIVE: 0,
      GRADUATED: 0,
      SUSPENDED: 0,
      DROPPED: 0,
    };

    // 4. Room Counts
    const roomCounts: Record<string, number> = {};

    students.forEach((s) => {
      // Cohort group
      const key = `${s.level}.${s.year}`;
      if (cohortGroups[key]) {
        cohortGroups[key].total++;
        if (s.prefix === "นาย") {
          cohortGroups[key].male++;
        } else {
          cohortGroups[key].female++;
        }
      }

      // Status
      if (statusCounts[s.status] !== undefined) {
        statusCounts[s.status]++;
      } else {
        statusCounts.ACTIVE++;
      }

      // Room
      const roomKey = `${s.level}.${s.year}/${s.room}`;
      roomCounts[roomKey] = (roomCounts[roomKey] || 0) + 1;
    });

    // Format Pyramid for Charting
    const pyramidData = Object.entries(cohortGroups).map(([cohort, counts]) => ({
      cohort,
      male: counts.male,
      female: counts.female,
      total: counts.total,
    }));

    // Format Status Distribution for Pie Chart
    const statusLabels: Record<string, string> = {
      ACTIVE: "กำลังศึกษาปกติ",
      GRADUATED: "สำเร็จการศึกษา",
      SUSPENDED: "พักการเรียน",
      DROPPED: "พ้นสภาพนักศึกษา",
    };
    const statusColors: Record<string, string> = {
      ACTIVE: "#10b981", // Emerald
      GRADUATED: "#3b82f6", // Blue
      SUSPENDED: "#f59e0b", // Amber
      DROPPED: "#ef4444", // Red
    };

    const statusPieData = Object.entries(statusCounts).map(([status, count], id) => ({
      id,
      value: count,
      label: statusLabels[status] || status,
      color: statusColors[status] || "#6b7280",
    }));

    // 5. Evidence Files in Student Work category
    const studentWorkCount = await prisma.evidenceFile.count({
      where: {
        academicYear,
        category: "student_work",
      },
    });

    return NextResponse.json({
      pyramidData,
      statusPieData,
      totalStudents: students.length,
      studentWorkCount,
      roomCounts,
    });
  } catch (error: any) {
    console.error("[GET /api/analytics/students] Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการคำนวณข้อมูลผู้เรียน" }, { status: 500 });
  }
}
