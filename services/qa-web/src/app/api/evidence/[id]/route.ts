import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { s3Client, S3_BUCKET } from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

// DELETE /api/evidence/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const file = await prisma.evidenceFile.findUnique({
      where: { id },
    });

    if (!file) {
      return NextResponse.json({ error: "ไม่พบไฟล์ที่ต้องการลบ" }, { status: 404 });
    }

    const isRoot = session.user.role === "ROOT";
    const isOwner = file.userId === session.user.id;

    if (!isOwner && !isRoot) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์ลบไฟล์ของผู้อื่น (เฉพาะเจ้าของไฟล์หรือ ROOT เท่านั้น)" },
        { status: 403 }
      );
    }

    // Delete from S3 if fileKey exists and is not an external link
    if (file.fileKey && !file.fileKey.startsWith("external-links/")) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: S3_BUCKET,
            Key: file.fileKey,
          })
        );
      } catch (s3Err) {
        console.warn("Failed to delete object from S3:", s3Err);
      }
    }

    // Delete record from Prisma
    await prisma.evidenceFile.delete({
      where: { id },
    });

    // Log Activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: "DELETE_EVIDENCE",
          title: `ลบหลักฐาน: ${file.title}`,
          metadata: {
            evidenceId: id,
            category: file.category,
            fileName: file.fileName,
          },
        },
      });
    } catch (logErr) {
      console.warn("Failed to log activity for evidence deletion:", logErr);
    }

    return NextResponse.json({
      success: true,
      message: "ลบไฟล์หลักฐานเรียบร้อยแล้ว",
    });
  } catch (error: any) {
    console.error("DELETE /api/evidence/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "เกิดข้อผิดพลาดในการลบไฟล์" },
      { status: 500 }
    );
  }
}
