import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/evidence - Fetch evidence files with filters & scope
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || "all"; // "my" or "all"
    const category = searchParams.get("category");
    const academicYear = searchParams.get("academicYear");
    const semester = searchParams.get("semester");
    const search = searchParams.get("search")?.trim();
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const where: any = {};

    // Scope filter: my files vs all
    if (scope === "my") {
      where.userId = session.user.id;
    }

    // Category filter
    if (category && category !== "all") {
      where.category = category;
    }

    // Academic Year filter
    if (academicYear && academicYear !== "all") {
      where.academicYear = academicYear;
    }

    // Semester filter
    if (semester && semester !== "all") {
      where.semester = semester;
    }

    // Search query
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { fileName: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [files, totalCount] = await Promise.all([
      prisma.evidenceFile.findMany({
        where,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              position: true,
              roleCode: true,
            },
          },
        },
      }),
      prisma.evidenceFile.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      files,
      totalCount,
    });
  } catch (error: any) {
    console.error("GET /api/evidence error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการโหลดรายการหลักฐาน" },
      { status: 500 }
    );
  }
}
