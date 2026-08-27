import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { s3Client, S3_BUCKET_NAME } from "@/lib/s3";
import { HeadBucketCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Strictly ROOT only
    if (!session || session.user?.role !== "ROOT") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง (สำหรับ ROOT เท่านั้น)" }, { status: 403 });
    }

    // 1. Test PostgreSQL DB Latency & Version
    let dbStatus = "connected";
    let dbLatencyMs = 0;
    let dbVersion = "PostgreSQL 16.1";
    let dbConnections = 1;
    let dbTotalUsers = 0;
    let dbTotalRoles = 0;
    let dbTotalLogs = 0;

    try {
      const start = performance.now();
      const versionResult: any = await prisma.$queryRaw`SELECT version();`;
      dbLatencyMs = Math.round(performance.now() - start);

      if (versionResult && versionResult[0]?.version) {
        dbVersion = versionResult[0].version.split(",")[0];
      }

      const countResult: any = await prisma.$queryRaw`SELECT count(*) FROM pg_stat_activity WHERE datname = current_database();`;
      if (countResult && countResult[0]?.count) {
        dbConnections = Number(countResult[0].count);
      }

      [dbTotalUsers, dbTotalRoles, dbTotalLogs] = await Promise.all([
        prisma.user.count(),
        prisma.roleDefinition.count(),
        prisma.activityLog.count(),
      ]);
    } catch (dbErr: any) {
      dbStatus = "error";
      console.error("Database check failed:", dbErr);
    }

    // 2. Test MinIO S3 Object Storage
    let s3Status = "connected";
    let s3LatencyMs = 0;
    let s3ObjectCount = 0;
    let s3TotalSizeMB = 0;

    try {
      const s3Start = performance.now();
      await s3Client.send(new HeadBucketCommand({ Bucket: S3_BUCKET_NAME }));
      s3LatencyMs = Math.round(performance.now() - s3Start);

      const listResult = await s3Client.send(
        new ListObjectsV2Command({ Bucket: S3_BUCKET_NAME, MaxKeys: 100 })
      );
      s3ObjectCount = listResult.KeyCount || 0;
      const totalBytes = (listResult.Contents || []).reduce((acc, o) => acc + (o.Size || 0), 0);
      s3TotalSizeMB = parseFloat((totalBytes / (1024 * 1024)).toFixed(2));
    } catch (s3Err: any) {
      s3Status = "error";
      console.error("MinIO S3 check failed:", s3Err);
    }

    // 3. Node.js & Server Process Metrics
    const memory = process.memoryUsage();
    const serverMetrics = {
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
      rssMB: Math.round(memory.rss / 1024 / 1024),
    };

    // 4. Infrastructure & Network Topology
    const infrastructure = {
      proxmoxHost: {
        name: "techniccom",
        tailscaleIp: "100.125.250.85",
        localIp: "192.168.1.250",
        status: "online",
      },
      containerCT102: {
        id: "CT 102",
        hostname: "database-server",
        ip: "10.10.10.102",
        status: "running",
        services: [
          { name: "qa_postgres", type: "Docker", port: 5432, status: dbStatus },
          { name: "qa_minio", type: "Docker", port: 9000, consolePort: 9001, status: s3Status },
        ],
      },
      webService: {
        name: "qa-web (Next.js 16)",
        port: 3000,
        status: "running",
        framework: "Next.js 16 App Router (Turbopack)",
      },
    };

    // 5. Masked Environment Variables
    const maskString = (str?: string) => {
      if (!str) return "-";
      if (str.length <= 8) return "••••••••";
      return `${str.substring(0, 4)}••••${str.substring(str.length - 4)}`;
    };

    const envConfig = [
      { key: "DATABASE_URL", value: maskString(process.env.DATABASE_URL), type: "Database", isSecret: true },
      { key: "NEXTAUTH_URL", value: process.env.NEXTAUTH_URL || "http://localhost:3000", type: "Auth", isSecret: false },
      { key: "NEXTAUTH_SECRET", value: maskString(process.env.NEXTAUTH_SECRET), type: "Auth", isSecret: true },
      { key: "S3_ENDPOINT", value: process.env.S3_ENDPOINT || "http://100.125.250.85:9000", type: "Storage", isSecret: false },
      { key: "S3_BUCKET_NAME", value: S3_BUCKET_NAME, type: "Storage", isSecret: false },
      { key: "S3_ACCESS_KEY", value: maskString(process.env.S3_ACCESS_KEY), type: "Storage", isSecret: true },
      { key: "S3_SECRET_KEY", value: maskString(process.env.S3_SECRET_KEY), type: "Storage", isSecret: true },
      { key: "NODE_ENV", value: process.env.NODE_ENV || "development", type: "System", isSecret: false },
    ];

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        version: dbVersion,
        connections: dbConnections,
        counts: {
          users: dbTotalUsers,
          roles: dbTotalRoles,
          logs: dbTotalLogs,
        },
      },
      storage: {
        status: s3Status,
        latencyMs: s3LatencyMs,
        bucket: S3_BUCKET_NAME,
        objectCount: s3ObjectCount,
        totalSizeMB: s3TotalSizeMB,
      },
      serverMetrics,
      infrastructure,
      envConfig,
    });
  } catch (error: any) {
    console.error("GET /api/admin/system/status error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการตรวจสอบสถานะระบบ" }, { status: 500 });
  }
}
