import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const departments = await prisma.department.findMany({
      orderBy: { code: "asc" },
    });

    return NextResponse.json({ departments });
  } catch (error: any) {
    console.error("GET /api/admin/departments error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลแผนกวิชา" }, { status: 500 });
  }
}
