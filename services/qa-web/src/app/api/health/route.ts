import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { s3Client } from "@/lib/s3";
import { ListBucketsCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbStatus = "disconnected";
  let dbError = null;
  let s3Status = "disconnected";
  let s3Error = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (err: any) {
    dbError = err.message || "Database connection error";
  }

  try {
    await s3Client.send(new ListBucketsCommand({}));
    s3Status = "connected";
  } catch (err: any) {
    s3Error = err.message || "MinIO S3 connection error";
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbStatus,
        url: process.env.DATABASE_URL ? "configured" : "missing",
        error: dbError,
      },
      storage: {
        status: s3Status,
        endpoint: process.env.S3_ENDPOINT ? "configured" : "missing",
        error: s3Error,
      },
    },
  });
}
