import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/evidence - Fetch evidence files with filters, scope, and no-cache headers
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
    const search = (searchParams.get("search") || searchParams.get("q"))?.trim();
    const tag = searchParams.get("tag")?.trim();
    const starredOnly = searchParams.get("starred") === "true";
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const where: any = {};

    // Scope filter: my files vs all
    if (scope === "my") {
      where.userId = session.user.id;
    }

    // Category filter: supports single category or comma-separated list
    if (category && category !== "all") {
      const cats = category
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      if (cats.length > 1) {
        where.category = { in: cats };
      } else if (cats.length === 1) {
        where.category = cats[0];
      }
    }

    // Academic Year filter
    if (academicYear && academicYear !== "all") {
      where.academicYear = academicYear;
    }

    // Semester filter: an item tagged for "all" (ตลอดปีการศึกษา) should appear in semester 1 and 2
    if (semester && semester !== "all") {
      where.semester = { in: [semester, "all"] };
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

    // Starred filter using Postgres JSON path
    if (starredOnly) {
      where.metadata = {
        path: ["starredBy"],
        array_contains: session.user.id,
      };
    }

    // Tag filter
    if (tag) {
      where.metadata = {
        path: ["tags"],
        array_contains: tag,
      };
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

    return NextResponse.json(
      {
        success: true,
        files,
        totalCount,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("GET /api/evidence error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการโหลดรายการหลักฐาน" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
