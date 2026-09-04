import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { s3Client, S3_BUCKET } from "@/lib/s3";
import { PutObjectCommand, CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

// Ensure bucket exists
async function ensureBucketExists() {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: S3_BUCKET }));
  } catch (err: any) {
    if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
      try {
        await s3Client.send(new CreateBucketCommand({ Bucket: S3_BUCKET }));
      } catch (createErr) {
        console.error("Error creating bucket:", createErr);
      }
    }
  }
}

// POST /api/evidence/upload
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนอัปโหลดเอกสาร" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const category = (formData.get("category") as string)?.trim() || "other";
    const academicYear = (formData.get("academicYear") as string)?.trim() || "2568";
    const semester = (formData.get("semester") as string)?.trim() || "1";

    // Optional metadata fields
    const location = (formData.get("location") as string)?.trim() || null;
    const organization = (formData.get("organization") as string)?.trim() || null;
    const eventDate = (formData.get("eventDate") as string)?.trim() || null;
    const subjectCode = (formData.get("subjectCode") as string)?.trim() || null;
    const gradeLevel = (formData.get("gradeLevel") as string)?.trim() || null;
    const externalVideoUrl = (formData.get("externalVideoUrl") as string)?.trim() || null;

    if (!title) {
      return NextResponse.json({ error: "กรุณาระบุชื่อเอกสารหรือหัวข้อหลักฐาน" }, { status: 400 });
    }

    let fileKey = "";
    let fileUrl = "";
    let fileName = "";
    let fileType = "application/octet-stream";
    let fileSize = 0;

    if (file && file.size > 0) {
      // Validate file size: limit to 50MB
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json({ error: "ขนาดไฟล์ต้องไม่เกิน 50MB" }, { status: 400 });
      }

      await ensureBucketExists();

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Clean filename and generate S3 Key
      const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 7);
      fileKey = `evidences/${academicYear}/${semester}/${category}/${timestamp}-${randomStr}-${originalName}`;
      fileName = file.name;
      fileType = file.type || "application/octet-stream";
      fileSize = file.size;

      // Upload to MinIO S3
      await s3Client.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: fileKey,
          Body: buffer,
          ContentType: fileType,
        })
      );

      fileUrl = `/api/files/${fileKey}`;
    } else if (externalVideoUrl) {
      // Allow video link without direct file upload
      fileKey = `external-links/${Date.now()}`;
      fileUrl = externalVideoUrl;
      fileName = "External Link / Video Clip";
      fileType = "video/external-link";
      fileSize = 0;
    } else {
      return NextResponse.json({ error: "กรุณาแนบไฟล์เอกสารหรือระบุลิงก์วิดีโอ" }, { status: 400 });
    }

    const metadata = {
      location,
      organization,
      eventDate,
      subjectCode,
      gradeLevel,
      externalVideoUrl,
    };

    // Create EvidenceFile in PostgreSQL
    const evidence = await prisma.evidenceFile.create({
      data: {
        userId: session.user.id,
        title,
        description,
        category,
        fileKey,
        fileUrl,
        fileName,
        fileType,
        fileSize,
        academicYear,
        semester,
        metadata,
      },
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
    });

    // Log Activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: "UPLOAD_EVIDENCE",
          title: `อัปโหลดหลักฐาน: ${title}`,
          metadata: {
            evidenceId: evidence.id,
            category,
            academicYear,
            semester,
            fileName,
          },
        },
      });
    } catch (logErr) {
      console.warn("Failed to create activity log for evidence upload:", logErr);
    }

    return NextResponse.json({
      success: true,
      message: "อัปโหลดและจัดหมวดหมู่หลักฐานสำเร็จ",
      data: evidence,
    });
  } catch (error: any) {
    console.error("POST /api/evidence/upload error:", error);
    return NextResponse.json(
      { error: error?.message || "เกิดข้อผิดพลาดในการอัปโหลดหลักฐาน" },
      { status: 500 }
    );
  }
}
