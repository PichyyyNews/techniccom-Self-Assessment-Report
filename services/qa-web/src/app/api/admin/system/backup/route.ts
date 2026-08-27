import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { s3Client, S3_BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";
import { logActivity } from "@/lib/activity";

// GET /api/admin/system/backup - List all database snapshots and backups with metadata
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
    const objects = (s3Result.Contents || []).filter((obj) => obj.Key && obj.Key !== "system-backups/");

    // Get recent backup activity logs to map names and descriptions quickly
    const backupLogs = await prisma.activityLog.findMany({
      where: { action: "SYSTEM_BACKUP_CREATED" },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    const logsMap: Record<string, { name: string; description: string; creator: string }> = {};
    for (const l of backupLogs) {
      if (l.metadata && typeof l.metadata === "object") {
        const meta = l.metadata as any;
        if (meta.filename) {
          logsMap[meta.filename] = {
            name: meta.name || l.title.replace("สำรองข้อมูลระบบ (Snapshot): ", ""),
            description: meta.description || "",
            creator: l.user?.name || "ROOT Admin",
          };
        }
      }
    }

    const backups = objects
      .map((obj) => {
        const filename = obj.Key?.replace("system-backups/", "") || "";
        const logInfo = logsMap[filename];
        return {
          key: obj.Key,
          filename,
          name: logInfo?.name || filename.replace(".json", ""),
          description: logInfo?.description || "",
          creator: logInfo?.creator || "ROOT Admin",
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

// POST /api/admin/system/backup - Trigger instant database snapshot with custom name & description
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ROOT") {
      return NextResponse.json({ error: "สำหรับ ROOT เท่านั้น" }, { status: 403 });
    }

    let body: { name?: string; description?: string } = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    const snapshotName = body.name?.trim() || `Snapshot_${new Date().toLocaleDateString("th-TH").replace(/\//g, "-")}`;
    const snapshotDesc = body.description?.trim() || "";

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
    const sanitizedName = snapshotName.replace(/[^a-zA-Z0-9_\-\u0E00-\u0E7F]/g, "_");
    const filename = `snapshot_${sanitizedName}_${timestamp}.json`;
    const s3Key = `system-backups/${filename}`;

    const snapshotData = {
      meta: {
        system: "TechSAR Educational QA System",
        snapshotVersion: "1.0",
        name: snapshotName,
        description: snapshotDesc,
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

    // Upload snapshot to MinIO S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: "application/json",
        Metadata: {
          name: encodeURIComponent(snapshotName),
          description: encodeURIComponent(snapshotDesc),
        },
      })
    );

    // Log Activity
    await logActivity(
      session.user.id,
      "SYSTEM_BACKUP_CREATED",
      `สร้าง Snapshot สำรองข้อมูล: "${snapshotName}"`,
      {
        name: snapshotName,
        description: snapshotDesc,
        filename,
        sizeBytes: buffer.length,
        sizeKB: parseFloat((buffer.length / 1024).toFixed(2)),
      }
    );

    return NextResponse.json({
      message: "สำรองข้อมูลและสร้าง Snapshot ระบบสำเร็จ",
      backup: {
        name: snapshotName,
        description: snapshotDesc,
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
