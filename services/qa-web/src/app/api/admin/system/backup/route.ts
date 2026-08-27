import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { s3Client, S3_BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { logActivity } from "@/lib/activity";

// GET /api/admin/system/backup - List all database snapshots and backups
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ROOT") {
      return NextResponse.json({ error: "สำหรับ ROOT เท่านั้น" }, { status: 403 });
    }

    // List objects in S3 under system-backups/
    const listCommand = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      Prefix: "system-backups/",
    });

    const s3Result = await s3Client.send(listCommand);
    const backups = (s3Result.Contents || [])
      .filter((obj) => obj.Key && obj.Key !== "system-backups/")
      .map((obj) => {
        const filename = obj.Key?.replace("system-backups/", "") || "";
        return {
          key: obj.Key,
          filename,
          sizeBytes: obj.Size || 0,
          sizeKB: parseFloat(((obj.Size || 0) / 1024).toFixed(2)),
          lastModified: obj.LastModified?.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.lastModified || 0).getTime() - new Date(a.lastModified || 0).getTime());

    return NextResponse.json({ backups });
  } catch (error: any) {
    console.error("GET /api/admin/system/backup error:", error);
    return NextResponse.json({ error: "ไม่สามารถดึงรายการสำรองข้อมูลได้" }, { status: 500 });
  }
}

// POST /api/admin/system/backup - Trigger instant database snapshot
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ROOT") {
      return NextResponse.json({ error: "สำหรับ ROOT เท่านั้น" }, { status: 403 });
    }

    const [users, roles, activityLogs] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          roleCode: true,
          roleDefinitionId: true,
          position: true,
          phone: true,
          birthDate: true,
          avatarUrl: true,
          bio: true,
          education: true,
          workHistory: true,
          skills: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.roleDefinition.findMany(),
      prisma.activityLog.findMany({ take: 200, orderBy: { createdAt: "desc" } }),
    ]);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const snapshotData = {
      meta: {
        system: "TechSAR Educational QA System",
        snapshotVersion: "1.0",
        createdAt: new Date().toISOString(),
        createdBy: session.user.email,
        counts: {
          users: users.length,
          roles: roles.length,
          activityLogs: activityLogs.length,
        },
      },
      data: {
        users,
        roles,
        activityLogs,
      },
    };

    const jsonString = JSON.stringify(snapshotData, null, 2);
    const buffer = Buffer.from(jsonString, "utf-8");
    const filename = `snapshot_techsar_${timestamp}.json`;
    const s3Key = `system-backups/${filename}`;

    // Upload snapshot to MinIO S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: "application/json",
      })
    );

    // Log Activity
    await logActivity(
      session.user.id,
      "SYSTEM_BACKUP_CREATED",
      `สำรองข้อมูลระบบ (Snapshot) ไฟล์ ${filename}`,
      { filename, sizeBytes: buffer.length }
    );

    return NextResponse.json({
      message: "สำรองข้อมูลและสร้าง Snapshot ระบบสำเร็จ",
      backup: {
        filename,
        key: s3Key,
        sizeKB: parseFloat((buffer.length / 1024).toFixed(2)),
        createdAt: new Date().toISOString(),
        counts: snapshotData.meta.counts,
      },
    });
  } catch (error: any) {
    console.error("POST /api/admin/system/backup error:", error);
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการสำรองข้อมูล" }, { status: 500 });
  }
}
