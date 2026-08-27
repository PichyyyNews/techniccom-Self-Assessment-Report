import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback to .env

import { prisma } from "../lib/prisma";
import { s3Client } from "../lib/s3";
import { ListBucketsCommand } from "@aws-sdk/client-s3";

async function testConnection() {
  console.log("==========================================");
  console.log("🔍 Testing Database & MinIO Connection");
  console.log("==========================================");
  console.log("📌 DATABASE_URL :", process.env.DATABASE_URL || "(not set)");
  console.log("📌 S3_ENDPOINT  :", process.env.S3_ENDPOINT || "(not set)");
  console.log("------------------------------------------");

  // 1. Test PostgreSQL Connection
  console.log("⏳ Testing PostgreSQL connection...");
  try {
    const result = await prisma.$queryRaw`SELECT version(), current_database(), current_user;`;
    console.log("✅ PostgreSQL Connected Successfully!");
    console.log("   DB Info:", result);
  } catch (error: any) {
    console.error("❌ PostgreSQL Connection Failed!");
    console.error("   Error Message:", error.message || error);
  }

  console.log("------------------------------------------");

  // 2. Test MinIO Connection
  console.log("⏳ Testing MinIO S3 connection...");
  try {
    const data = await s3Client.send(new ListBucketsCommand({}));
    console.log("✅ MinIO Connected Successfully!");
    console.log("   Available Buckets:", data.Buckets?.map((b) => b.Name) || []);
  } catch (error: any) {
    console.error("❌ MinIO Connection Failed!");
    console.error("   Error Message:", error.message || error);
  }

  console.log("==========================================");
  await prisma.$disconnect();
}

testConnection();
