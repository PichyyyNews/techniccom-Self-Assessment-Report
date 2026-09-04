import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/evidence/[id]/comments - Add a comment to evidence file
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const body = await req.json();
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "กรุณาระบุข้อความความคิดเห็น" }, { status: 400 });
    }

    const file = await prisma.evidenceFile.findUnique({
      where: { id },
    });

    if (!file) {
      return NextResponse.json({ error: "ไม่พบไฟล์ที่ต้องการ" }, { status: 404 });
    }

    const meta = (file.metadata as any) || {};
    const existingComments = Array.isArray(meta.comments) ? meta.comments : [];

    const newComment = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      userId: session.user.id,
      userName: session.user.name || "บุคลากร",
      userAvatar: session.user.avatarUrl || (session.user as any).image || null,
      roleCode: session.user.role || "STAFF",
      text,
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [...existingComments, newComment];

    const updatedMetadata = {
      ...meta,
      comments: updatedComments,
    };

    await prisma.evidenceFile.update({
      where: { id },
      data: { metadata: updatedMetadata },
    });

    // Log Activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: "COMMENT_EVIDENCE",
          title: `แสดงความคิดเห็นบนหลักฐาน: ${file.title}`,
          metadata: {
            evidenceId: id,
            commentId: newComment.id,
          },
        },
      });
    } catch {
      // Ignore
    }

    try {
      revalidatePath("/stock");
    } catch {
      // Ignore
    }

    return NextResponse.json({
      success: true,
      comment: newComment,
      comments: updatedComments,
    });
  } catch (error: any) {
    console.error("POST /api/evidence/[id]/comments error:", error);
    return NextResponse.json(
      { error: error?.message || "เกิดข้อผิดพลาดในการบันทึกความคิดเห็น" },
      { status: 500 }
    );
  }
}
