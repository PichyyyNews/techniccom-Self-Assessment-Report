import { NextResponse } from "next/server";
import { s3Client, S3_BUCKET } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

// GET /api/files/[...key] - Serve files from MinIO S3 with caching
export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key: keyParts } = await params;
    if (!keyParts || keyParts.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const key = keyParts.map((p) => decodeURIComponent(p)).join("/");

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const byteArray = await response.Body.transformToByteArray();
    let contentType = response.ContentType || "application/octet-stream";
    if (key.toLowerCase().endsWith(".pdf")) {
      contentType = "application/pdf";
    } else if (key.toLowerCase().endsWith(".jpg") || key.toLowerCase().endsWith(".jpeg")) {
      contentType = "image/jpeg";
    } else if (key.toLowerCase().endsWith(".png")) {
      contentType = "image/png";
    } else if (key.toLowerCase().endsWith(".webp")) {
      contentType = "image/webp";
    } else if (key.toLowerCase().endsWith(".mp4")) {
      contentType = "video/mp4";
    } else if (key.toLowerCase().endsWith(".webm")) {
      contentType = "video/webm";
    }

    return new NextResponse(Buffer.from(byteArray), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    console.error("GET /api/files error:", error);
    return NextResponse.json(
      { error: "Error fetching file from storage" },
      { status: 500 }
    );
  }
}
