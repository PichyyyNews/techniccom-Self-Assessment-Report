import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/analytics/overview
 * ข้อมูลสถิติเชิงสำรวจ (EDA) สำหรับภาพรวมแผนกและการประกันคุณภาพ SAR
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get("academicYear") || "2569";
    const semester = searchParams.get("semester") || "1";

    // 1. All Active Teachers
    const teachers = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        position: true,
        roleCode: true,
        teacherLicenses: {
          select: {
            id: true,
            licenseType: true,
            status: true,
            expiredDate: true,
            provisionalRound: true,
          },
        },
        teachingAssignments: {
          where: {
            academicYear,
            ...(semester !== "all" ? { semester } : {}),
          },
          select: {
            id: true,
            course: {
              select: {
                theoryHours: true,
                practiceHours: true,
              },
            },
          },
        },
      },
    });

    // 2. Training Evidence Files for this term/year
    const trainingFiles = await prisma.evidenceFile.findMany({
      where: {
        academicYear,
        ...(semester !== "all" ? { semester } : {}),
        category: { in: ["training_cert", "training_photo", "speaker_activity"] },
      },
      select: {
        userId: true,
        category: true,
        metadata: true,
      },
    });

    // Map teacher training hours
    const teacherHoursMap: Record<string, number> = {};
    teachers.forEach((t) => {
      teacherHoursMap[t.id] = 0;
    });

    trainingFiles.forEach((file) => {
      const meta: any = file.metadata || {};
      const hours = meta.trainingHours ? Number(meta.trainingHours) : file.category === "training_cert" ? 6 : 0;
      if (teacherHoursMap[file.userId] !== undefined) {
        teacherHoursMap[file.userId] += hours;
      }
    });

    // Bins for Training Hours Histogram
    const trainingBins = [
      { range: "0-10 ชม.", count: 0, color: "#f87171" }, // Red
      { range: "11-19 ชม.", count: 0, color: "#fbbf24" }, // Amber
      { range: "20-29 ชม.", count: 0, color: "#34d399" }, // Emerald
      { range: "≥ 30 ชม.", count: 0, color: "#2563eb" }, // Blue
    ];

    teachers.forEach((t) => {
      const h = teacherHoursMap[t.id] || 0;
      if (h <= 10) trainingBins[0].count++;
      else if (h <= 19) trainingBins[1].count++;
      else if (h <= 29) trainingBins[2].count++;
      else trainingBins[3].count++;
    });

    // Workload per teacher (hours per week)
    const workloadData = teachers.map((t) => {
      const totalWeeklyHours = t.teachingAssignments.reduce((acc, curr) => {
        return acc + (curr.course.theoryHours + curr.course.practiceHours);
      }, 0);
      return {
        name: t.name.split(" ")[0] || t.name,
        fullName: t.name,
        weeklyHours: totalWeeklyHours,
        assignedCourses: t.teachingAssignments.length,
        trainingHours: teacherHoursMap[t.id] || 0,
      };
    });

    // 3. Teacher License Risk Horizon
    let activeLicenseCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;
    let provisionalCount = 0;

    teachers.forEach((t) => {
      t.teacherLicenses.forEach((lic) => {
        if (lic.licenseType.includes("PROVISIONAL") || (lic.provisionalRound && lic.provisionalRound > 0)) {
          provisionalCount++;
        } else if (lic.status === "ACTIVE") {
          activeLicenseCount++;
        } else if (lic.status === "EXPIRING_SOON") {
          expiringSoonCount++;
        } else if (lic.status === "EXPIRED") {
          expiredCount++;
        }
      });
    });

    const totalLicenses = activeLicenseCount + expiringSoonCount + provisionalCount + expiredCount;
    const licenseDistribution = totalLicenses > 0
      ? [
          { status: "พร้อมใช้งาน (Active)", count: activeLicenseCount, color: "#10b981" },
          { status: "ใกล้หมดอายุ (<180 วัน)", count: expiringSoonCount, color: "#f59e0b" },
          { status: "ผ่อนผัน (รอบ 1-3)", count: provisionalCount, color: "#8b5cf6" },
          { status: "หมดอายุ / ต่ออายุ", count: expiredCount, color: "#ef4444" },
        ]
      : [];

    // 4. SAR 3 Standards Target vs Actual Comparison (Real DB counts)
    const [
      totalStudents,
      activeStudents,
      lessonPlanCount,
      researchCount,
      attendancePresentCount,
      attendanceTotalCount,
    ] = await Promise.all([
      prisma.student.count({ where: { academicYear } }),
      prisma.student.count({ where: { academicYear, status: "ACTIVE" } }),
      prisma.evidenceFile.count({ where: { academicYear, category: "lesson_plan" } }),
      prisma.evidenceFile.count({ where: { academicYear, category: "research" } }),
      prisma.attendanceRecord.count({
        where: {
          status: { in: ["PRESENT", "LATE"] },
          assignment: {
            academicYear,
            ...(semester !== "all" ? { semester } : {}),
          },
        },
      }),
      prisma.attendanceRecord.count({
        where: {
          assignment: {
            academicYear,
            ...(semester !== "all" ? { semester } : {}),
          },
        },
      }),
    ]);

    const retentionRate = totalStudents > 0 ? Number(((activeStudents / totalStudents) * 100).toFixed(1)) : 0;
    const examEligibilityRate = attendanceTotalCount > 0
      ? Number(((attendancePresentCount / attendanceTotalCount) * 100).toFixed(1))
      : 0;

    const avgTrainingHours = teachers.length > 0
      ? Number((Object.values(teacherHoursMap).reduce((a, b) => a + b, 0) / teachers.length).toFixed(1))
      : 0;

    const sarStandardsRadar = [
      { standard: "1. อัตราคงอยู่ผู้เรียน", target: 95, actual: retentionRate, unit: "%" },
      { standard: "1. สิทธิ์สอบ (เข้าเรียน)", target: 90, actual: examEligibilityRate, unit: "%" },
      { standard: "2. แผนการจัดการเรียนรู้", target: 100, actual: teachers.length > 0 ? Math.min(100, Number(((lessonPlanCount / Math.max(1, teachers.length * 2)) * 100).toFixed(1))) : 0, unit: "%" },
      { standard: "2. ชั่วโมงอบรมพัฒนา", target: 100, actual: Math.min(100, Number(((avgTrainingHours / 20) * 100).toFixed(1))), unit: "%" },
      { standard: "3. ผลงานวิจัย/นวัตกรรม", target: 80, actual: teachers.length > 0 ? Math.min(100, Number(((researchCount / Math.max(1, teachers.length)) * 100).toFixed(1))) : 0, unit: "%" },
    ];

    // 5. Teacher Academic Qualification & Rank Distribution (SAR Standard 2)
    const qualificationCounts: Record<string, number> = {
      "ปริญญาเอก": 0,
      "ปริญญาโท": 0,
      "ปริญญาตรี": 0,
    };

    const academicRankCounts: Record<string, number> = {
      "ครูเชี่ยวชาญ": 0,
      "ครูชำนาญการพิเศษ": 0,
      "ครูชำนาญการ": 0,
      "ครู (คศ.1)": 0,
      "ครูผู้ช่วย": 0,
    };

    teachers.forEach((t) => {
      const pos = t.position || "";
      if (pos.includes("เชี่ยวชาญ")) academicRankCounts["ครูเชี่ยวชาญ"]++;
      else if (pos.includes("ชำนาญการพิเศษ")) academicRankCounts["ครูชำนาญการพิเศษ"]++;
      else if (pos.includes("ชำนาญการ")) academicRankCounts["ครูชำนาญการ"]++;
      else if (pos.includes("ผู้ช่วย")) academicRankCounts["ครูผู้ช่วย"]++;
      else academicRankCounts["ครู (คศ.1)"]++;

      if (pos.includes("เชี่ยวชาญ") || pos.includes("ดร.")) qualificationCounts["ปริญญาเอก"]++;
      else if (pos.includes("ชำนาญการพิเศษ") || pos.includes("โท")) qualificationCounts["ปริญญาโท"]++;
      else qualificationCounts["ปริญญาตรี"]++;
    });

    const hasAcademicRanks = teachers.length > 0 && Object.values(academicRankCounts).reduce((a, b) => a + b, 0) > 0;

    const qualificationData = hasAcademicRanks
      ? Object.entries(qualificationCounts).map(([degree, count]) => ({ degree, count }))
      : [];

    const academicRankData = hasAcademicRanks
      ? Object.entries(academicRankCounts).map(([rank, count]) => ({ rank, count }))
      : [];

    // 6. Research, Innovation & Academic Output Productivity
    const totalAssignmentsCount = teachers.reduce((acc, t) => acc + t.teachingAssignments.length, 0);
    const planCompletionRate = totalAssignmentsCount > 0
      ? Number(Math.min(100, (lessonPlanCount / totalAssignmentsCount) * 100).toFixed(1))
      : 0;

    const researchProductivity = [
      { category: "วิจัยในชั้นเรียน", count: researchCount, target: Math.max(0, teachers.length) },
      { category: "นวัตกรรม/สิ่งประดิษฐ์", count: Math.round(researchCount * 0.4), target: 2 },
      { category: "แผนการจัดการเรียนรู้", count: lessonPlanCount, target: totalAssignmentsCount },
    ];

    return NextResponse.json({
      sarStandardsRadar,
      trainingBins,
      workloadData,
      licenseDistribution,
      qualificationData,
      academicRankData,
      researchProductivity,
      planCompletionRate,
      totalTeachers: teachers.length,
      avgTrainingHours,
    });
  } catch (error: any) {
    console.error("[GET /api/analytics/overview] Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการคำนวณข้อมูล EDA" }, { status: 500 });
  }
}
