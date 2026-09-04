import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
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

// POST /api/evidence/upload - Multi-file & single file upload with tags & cache revalidation
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนอัปโหลดเอกสาร" }, { status: 401 });
    }

    const formData = await req.formData();
    
    // Support multiple files from formData (either multiple "files" or "file" or both)
    const rawFiles: File[] = [];
    const filesEntries = formData.getAll("files");
    const singleFile = formData.get("file");

    if (filesEntries && filesEntries.length > 0) {
      for (const f of filesEntries) {
        if (f instanceof File && f.size > 0) rawFiles.push(f);
      }
    }
    if (singleFile instanceof File && singleFile.size > 0) {
      if (!rawFiles.includes(singleFile)) rawFiles.push(singleFile);
    }

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

    // Tags field: parses JSON array string or comma-separated string
    const tagsRaw = formData.get("tags") as string | null;
    let tags: string[] = [];
    if (tagsRaw) {
      try {
        const parsed = JSON.parse(tagsRaw);
        if (Array.isArray(parsed)) {
          tags = parsed.map((t) => String(t).trim()).filter(Boolean);
        }
      } catch {
        tags = tagsRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

    if (!title) {
      return NextResponse.json({ error: "กรุณาระบุชื่อเอกสารหรือหัวข้อหลักฐาน" }, { status: 400 });
    }

    if (rawFiles.length === 0 && !externalVideoUrl) {
      return NextResponse.json({ error: "กรุณาแนบไฟล์เอกสารหรือระบุลิงก์วิดีโอ" }, { status: 400 });
    }

    const createdRecords: any[] = [];
    await ensureBucketExists();

    if (rawFiles.length > 0) {
      // Process each file in batch
      for (let i = 0; i < rawFiles.length; i++) {
        const file = rawFiles[i];
        if (file.size > 50 * 1024 * 1024) {
          return NextResponse.json(
            { error: `ไฟล์ "${file.name}" มีขนาดเกิน 50MB` },
            { status: 400 }
          );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 7);
        const fileKey = `evidences/${academicYear}/${semester}/${category}/${timestamp}-${randomStr}-${originalName}`;
        const fileName = file.name;
        const fileType = file.type || "application/octet-stream";
        const fileSize = file.size;

        // Upload to MinIO S3
        await s3Client.send(
          new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: fileKey,
            Body: buffer,
            ContentType: fileType,
          })
        );

        const fileUrl = `/api/files/${fileKey}`;

        // Compute title for multi-file batches
        const fileTitle =
          rawFiles.length > 1
            ? `${title} (${i + 1}/${rawFiles.length} - ${file.name.replace(/\.[^/.]+$/, "")})`
            : title;

        const metadata = {
          location,
          organization,
          eventDate,
          subjectCode,
          gradeLevel,
          externalVideoUrl,
          tags,
          starredBy: [],
          comments: [],
        };

        const evidence = await prisma.evidenceFile.create({
          data: {
            userId: session.user.id,
            title: fileTitle,
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

        createdRecords.push(evidence);
      }
    } else if (externalVideoUrl) {
      // External video link item
      const fileKey = `external-links/${Date.now()}`;
      const fileUrl = externalVideoUrl;
      const fileName = "External Link / Video Clip";
      const fileType = "video/external-link";
      const fileSize = 0;

      const metadata = {
        location,
        organization,
        eventDate,
        subjectCode,
        gradeLevel,
        externalVideoUrl,
        tags,
        starredBy: [],
        comments: [],
      };

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

      createdRecords.push(evidence);
    }

    // Invalidate Next.js cache across all evidence-consuming views
    try {
      revalidatePath("/stock");
      revalidatePath("/quick-upload");
      revalidatePath("/dashboard");
      revalidatePath("/teachers/lesson-plans");
      revalidatePath("/teachers/researches");
      revalidatePath("/teachers/trainings");
      revalidatePath("/students");
    } catch (cacheErr) {
      console.warn("revalidatePath warning:", cacheErr);
    }

    // Log Activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: "UPLOAD_EVIDENCE",
          title: `อัปโหลดหลักฐาน: ${title} (${createdRecords.length} ไฟล์)`,
          metadata: {
            category,
            academicYear,
            semester,
            count: createdRecords.length,
            ids: createdRecords.map((r) => r.id),
          },
        },
      });
    } catch (logErr) {
      console.warn("Failed to create activity log for evidence upload:", logErr);
    }

    return NextResponse.json({
      success: true,
      message: `อัปโหลดและจัดหมวดหมู่หลักฐานสำเร็จ (${createdRecords.length} รายการ)`,
      data: createdRecords[0] || null,
      files: createdRecords,
      count: createdRecords.length,
    });
  } catch (error: any) {
    console.error("POST /api/evidence/upload error:", error);
    return NextResponse.json(
      { error: error?.message || "เกิดข้อผิดพลาดในการอัปโหลดหลักฐาน" },
      { status: 500 }
    );
  }
}
