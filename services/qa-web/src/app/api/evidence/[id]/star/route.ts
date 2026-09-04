import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/evidence/[id]/star - Toggle star for current user
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const file = await prisma.evidenceFile.findUnique({
      where: { id },
    });

    if (!file) {
      return NextResponse.json({ error: "ไม่พบไฟล์ที่ต้องการ" }, { status: 404 });
    }

    const meta = (file.metadata as any) || {};
    const starredBy: string[] = Array.isArray(meta.starredBy) ? meta.starredBy : [];
    const userId = session.user.id;

    let isStarred = false;
    let newStarredBy: string[];

    if (starredBy.includes(userId)) {
      newStarredBy = starredBy.filter((uid) => uid !== userId);
      isStarred = false;
    } else {
      newStarredBy = [...starredBy, userId];
      isStarred = true;
    }

    const updatedMetadata = {
      ...meta,
      starredBy: newStarredBy,
    };

    await prisma.evidenceFile.update({
      where: { id },
      data: { metadata: updatedMetadata },
    });

    try {
      revalidatePath("/stock");
      revalidatePath("/quick-upload");
    } catch {
      // Ignore revalidate errors
    }

    return NextResponse.json({
      success: true,
      isStarred,
      starCount: newStarredBy.length,
      starredBy: newStarredBy,
    });
  } catch (error: any) {
    console.error("POST /api/evidence/[id]/star error:", error);
    return NextResponse.json(
      { error: error?.message || "เกิดข้อผิดพลาดในการทำรายการ" },
      { status: 500 }
    );
  }
}
