import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { s3Client, S3_BUCKET_NAME } from "@/lib/s3";
import { HeadBucketCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import os from "os";

export const dynamic = "force-dynamic";

let lastCpuUsage = process.cpuUsage();
let lastCpuTime = performance.now();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ROOT") {
      return NextResponse.json({ error: "สำหรับ ROOT เท่านั้น" }, { status: 403 });
    }

    // 1. Calculate Real CPU Usage (%)
    const currentCpuUsage = process.cpuUsage(lastCpuUsage);
    const currentTime = performance.now();
    const elapsedTimeMs = currentTime - lastCpuTime;
    lastCpuTime = currentTime;
    lastCpuUsage = process.cpuUsage();

    const totalCpuTimeMs = (currentCpuUsage.user + currentCpuUsage.system) / 1000;
    const cpuPercent = elapsedTimeMs > 0
      ? Math.min(100, Math.max(1, parseFloat(((totalCpuTimeMs / (elapsedTimeMs * os.cpus().length)) * 100).toFixed(1))))
      : 1.5;

    // 2. Real PostgreSQL Database Telemetry
    let dbStatus = "connected";
    let dbLatencyMs = 0;
    let dbVersion = "PostgreSQL 16.1";
    let dbSizePretty = "0 MB";
    let dbSizeBytes = 0;
    let cacheHitRatio = 99.8;
    let activeConnections = 1;
    let tableStats: Array<{
      tableName: string;
      rowCount: number;
      sizePretty: string;
      sizeBytes: number;
    }> = [];
    let activeQueries: Array<{
      pid: number;
      user: string;
      state: string;
      query: string;
      duration: string;
    }> = [];

    try {
      const dbStart = performance.now();
      const versionRes: any = await prisma.$queryRaw`SELECT version();`;
      dbLatencyMs = Math.round(performance.now() - dbStart);

      if (versionRes && versionRes[0]?.version) {
        dbVersion = versionRes[0].version.split(",")[0];
      }

      // Database Size
      const sizeRes: any = await prisma.$queryRaw`
        SELECT 
          pg_database_size(current_database()) as size_bytes,
          pg_size_pretty(pg_database_size(current_database())) as size_pretty;
      `;
      if (sizeRes && sizeRes[0]) {
        dbSizeBytes = Number(sizeRes[0].size_bytes);
        dbSizePretty = sizeRes[0].size_pretty;
      }

      // Cache Hit Ratio & Stat DB
      const statRes: any = await prisma.$queryRaw`
        SELECT 
          round(100.0 * blks_hit / nullif(blks_hit + blks_read, 0), 2) as cache_hit_ratio
        FROM pg_stat_database 
        WHERE datname = current_database();
      `;
      if (statRes && statRes[0]?.cache_hit_ratio) {
        cacheHitRatio = Number(statRes[0].cache_hit_ratio);
      }

      // Active Connections Count
      const connRes: any = await prisma.$queryRaw`
        SELECT count(*) as count FROM pg_stat_activity WHERE datname = current_database();
      `;
      if (connRes && connRes[0]) {
        activeConnections = Number(connRes[0].count);
      }

      // Tables Breakdown (Size & Live Tuples)
      const tablesRes: any = await prisma.$queryRaw`
        SELECT 
          relname AS table_name,
          COALESCE(n_live_tup, 0) AS row_count,
          pg_size_pretty(pg_total_relation_size(relid)) AS size_pretty,
          pg_total_relation_size(relid) AS size_bytes
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(relid) DESC;
      `;
      if (Array.isArray(tablesRes)) {
        tableStats = tablesRes.map((t: any) => ({
          tableName: t.table_name,
          rowCount: Number(t.row_count),
          sizePretty: t.size_pretty,
          sizeBytes: Number(t.size_bytes),
        }));
      }

      // Active Queries
      const queriesRes: any = await prisma.$queryRaw`
        SELECT 
          pid, 
          COALESCE(usename, 'system') as usename, 
          state, 
          query,
          COALESCE(age(clock_timestamp(), query_start)::text, '0s') AS duration
        FROM pg_stat_activity
        WHERE datname = current_database()
        ORDER BY query_start DESC NULLS LAST
        LIMIT 5;
      `;
      if (Array.isArray(queriesRes)) {
        activeQueries = queriesRes.map((q: any) => ({
          pid: Number(q.pid),
          user: q.usename,
          state: q.state || "active",
          query: q.query?.substring(0, 120) || "-",
          duration: q.duration || "0s",
        }));
      }
    } catch (dbErr) {
      dbStatus = "error";
      console.error("DB metrics failed:", dbErr);
    }

    // 3. MinIO S3 Real Storage Telemetry
    let s3Status = "connected";
    let s3LatencyMs = 0;
    let s3ObjectCount = 0;
    let s3TotalSizeBytes = 0;

    try {
      const s3Start = performance.now();
      await s3Client.send(new HeadBucketCommand({ Bucket: S3_BUCKET_NAME }));
      s3LatencyMs = Math.round(performance.now() - s3Start);

      const listRes = await s3Client.send(
        new ListObjectsV2Command({ Bucket: S3_BUCKET_NAME, MaxKeys: 500 })
      );
      s3ObjectCount = listRes.KeyCount || 0;
      s3TotalSizeBytes = (listRes.Contents || []).reduce((acc, o) => acc + (o.Size || 0), 0);
    } catch (s3Err) {
      s3Status = "error";
      console.error("S3 metrics failed:", s3Err);
    }

    // 4. Server Machine Hardware & Memory (OS + Process)
    const totalMemBytes = os.totalmem();
    const freeMemBytes = os.freemem();
    const usedMemBytes = totalMemBytes - freeMemBytes;
    const memUsagePercent = parseFloat(((usedMemBytes / totalMemBytes) * 100).toFixed(1));

    const procMem = process.memoryUsage();

    // 5. Container CT 102 Simulated & Calculated Real Metrics
    const ct102DiskTotalGB = 32.0; // CT 102 Root Disk
    const dbSizeMB = parseFloat((dbSizeBytes / (1024 * 1024)).toFixed(2));
    const s3SizeMB = parseFloat((s3TotalSizeBytes / (1024 * 1024)).toFixed(2));
    const estimatedUsedDiskGB = parseFloat((4.2 + (dbSizeMB + s3SizeMB) / 1024).toFixed(2));
    const estimatedFreeDiskGB = parseFloat((ct102DiskTotalGB - estimatedUsedDiskGB).toFixed(2));
    const diskUsagePercent = parseFloat(((estimatedUsedDiskGB / ct102DiskTotalGB) * 100).toFixed(1));

    // 6. Recent Realtime Activity Logs (Last 15)
    const recentLogs = await prisma.activityLog.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            roleCode: true,
          },
        },
      },
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      cpu: {
        percent: cpuPercent,
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || "Intel/AMD Processor",
      },
      ram: {
        totalGB: parseFloat((totalMemBytes / 1024 / 1024 / 1024).toFixed(2)),
        usedGB: parseFloat((usedMemBytes / 1024 / 1024 / 1024).toFixed(2)),
        freeGB: parseFloat((freeMemBytes / 1024 / 1024 / 1024).toFixed(2)),
        percent: memUsagePercent,
        heapUsedMB: Math.round(procMem.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(procMem.heapTotal / 1024 / 1024),
        rssMB: Math.round(procMem.rss / 1024 / 1024),
      },
      databaseServer: {
        ct102: {
          ip: "10.10.10.102",
          tailscaleIp: "100.125.250.85",
          diskTotalGB: ct102DiskTotalGB,
          diskUsedGB: estimatedUsedDiskGB,
          diskFreeGB: estimatedFreeDiskGB,
          diskPercent: diskUsagePercent,
        },
        postgres: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
          version: dbVersion,
          dbSizeBytes,
          dbSizePretty,
          dbSizeMB,
          cacheHitRatio,
          activeConnections,
          tableStats,
          activeQueries,
        },
        minio: {
          status: s3Status,
          latencyMs: s3LatencyMs,
          bucket: S3_BUCKET_NAME,
          objectCount: s3ObjectCount,
          totalSizeBytes: s3TotalSizeBytes,
          totalSizeMB: s3SizeMB,
        },
      },
      logs: recentLogs,
    });
  } catch (error: any) {
    console.error("GET /api/admin/system/metrics error:", error);
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล Realtime" }, { status: 500 });
  }
}
