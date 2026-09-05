import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/teachers/summary
 * คำนวณตัวชี้วัด KPI งานครูและบุคลากร (SAR มาตรฐาน 2 และ 3)
 * Query params:
 *  - academicYear: string (default: current year)
 *  - semester: string (default: current semester or "all")
 *  - scope: "my" | "all" (default: "my")
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
    const scope = searchParams.get("scope") || "my";

    const userId = session.user.id;

    // Filter condition for evidence
    const baseWhere: any = {};
    if (academicYear) baseWhere.academicYear = academicYear;
    if (semester && semester !== "all") baseWhere.semester = semester;

    // User scope
    const userWhere = scope === "my" && userId ? { ...baseWhere, userId } : baseWhere;

    // 1. Lesson Plans
    const [lessonPlansCount, assignmentsCount] = await Promise.all([
      prisma.evidenceFile.count({
        where: {
          ...userWhere,
          category: "lesson_plan",
        },
      }),
      prisma.teachingAssignment.count({
        where: {
          ...(scope === "my" && userId ? { teacherId: userId } : {}),
          ...(academicYear ? { academicYear } : {}),
          ...(semester && semester !== "all" ? { semester } : {}),
        },
      }),
    ]);

    // 2. Trainings & Professional Development
    const trainingFiles = await prisma.evidenceFile.findMany({
      where: {
        ...userWhere,
        category: { in: ["training_cert", "training_photo", "speaker_activity"] },
      },
      select: {
        id: true,
        category: true,
        metadata: true,
      },
    });

    let totalTrainingHours = 0;
    let certCount = 0;
    let photoCount = 0;
    let speakerCount = 0;

    for (const file of trainingFiles) {
      if (file.category === "training_cert") certCount++;
      else if (file.category === "training_photo") photoCount++;
      else if (file.category === "speaker_activity") speakerCount++;

      const meta: any = file.metadata || {};
      const hours = meta.trainingHours ? Number(meta.trainingHours) : 0;
      if (hours > 0) {
        totalTrainingHours += hours;
      } else if (file.category === "training_cert") {
        // Default estimate 6 hours per certificate if not explicitly filled
        totalTrainingHours += 6;
      }
    }

    // 3. Researches & Inventions
    const [researchCount, allResearchFiles] = await Promise.all([
      prisma.evidenceFile.count({
        where: {
          ...userWhere,
          category: "research",
        },
      }),
      prisma.evidenceFile.findMany({
        where: {
          ...userWhere,
          category: "research",
        },
        select: {
          title: true,
          description: true,
          metadata: true,
        },
      }),
    ]);

    // Count inventions or awards
    let awardCount = 0;
    for (const r of allResearchFiles) {
      const text = `${r.title} ${r.description || ""}`.toLowerCase();
      if (
        text.includes("สิ่งประดิษฐ์") ||
        text.includes("นวัตกรรม") ||
        text.includes("รางวัล") ||
        text.includes("ชนะเลิศ") ||
        text.includes("อวท")
      ) {
        awardCount++;
      }
    }

    return NextResponse.json({
      lessonPlans: {
        count: lessonPlansCount,
        targetAssignments: assignmentsCount,
        completionRate:
          assignmentsCount > 0
            ? Math.min(100, Number(((lessonPlansCount / assignmentsCount) * 100).toFixed(1)))
            : lessonPlansCount > 0
            ? 100
            : 0,
      },
      trainings: {
        totalHours: totalTrainingHours,
        totalItems: trainingFiles.length,
        certCount,
        photoCount,
        speakerCount,
        meetsRequirement: totalTrainingHours >= 20, // เกณฑ์ขั้นต่ำ 20 ชม./ปี
      },
      researches: {
        count: researchCount,
        awardCount: awardCount || (researchCount > 0 ? 1 : 0),
      },
    });
  } catch (error: any) {
    console.error("[GET /api/teachers/summary] Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลสรุปงานครู" },
      { status: 500 }
    );
  }
}
