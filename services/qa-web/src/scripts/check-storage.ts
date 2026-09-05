import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { ListObjectsV2Command } from "@aws-sdk/client-s3";

async function main() {
  const { s3Client, S3_BUCKET } = await import("../lib/s3");
  console.log("Bucket:", S3_BUCKET, "Endpoint:", process.env.S3_ENDPOINT);
  try {
    const res = await s3Client.send(new ListObjectsV2Command({ Bucket: S3_BUCKET }));
    console.log("Found", res.Contents?.length || 0, "objects in S3 bucket:");
    res.Contents?.forEach(c => console.log(" -", c.Key, `(${c.Size} bytes)`));
  } catch (err: any) {
    console.error("S3 error:", err.message);
  }
}

main().catch(console.error);
