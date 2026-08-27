import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/roles - List all roles with user count
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const hasPermission =
      session.user.role === "ROOT" ||
      session.user.permissions?.includes("/admin/users");

    if (!hasPermission) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงข้อมูลยศ/สิทธิ์" }, { status: 403 });
    }

    const roles = await prisma.roleDefinition.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: [{ isSystem: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ roles });
  } catch (error: any) {
    console.error("GET /api/admin/roles error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลยศ/สิทธิ์" }, { status: 500 });
  }
}

// POST /api/admin/roles - Create new custom role
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.user.role !== "ROOT") {
      return NextResponse.json({ error: "เฉพาะ ROOT เท่านั้นที่สามารถสร้างยศ/สิทธิ์ใหม่ได้" }, { status: 403 });
    }

    const body = await req.json();
    const { title, code, description, color, permissions } = body;

    if (!title) {
      return NextResponse.json({ error: "กรุณาระบุชื่อยศ/สิทธิ์" }, { status: 400 });
    }

    // Auto-generate code if empty
    const roleCode = (code || `ROLE_${Date.now()}`).trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");

    const existing = await prisma.roleDefinition.findUnique({
      where: { code: roleCode },
    });

    if (existing) {
      return NextResponse.json({ error: "รหัสยศนี้มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น" }, { status: 400 });
    }

    const newRole = await prisma.roleDefinition.create({
      data: {
        title: title.trim(),
        code: roleCode,
        description: description ? description.trim() : null,
        color: color || "blue",
        permissions: Array.isArray(permissions) ? permissions : ["/dashboard"],
        isSystem: false,
      },
    });

    return NextResponse.json({ message: "สร้างยศ/สิทธิ์ใหม่เรียบร้อยแล้ว", role: newRole }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/roles error:", error);
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการสร้างยศ/สิทธิ์" }, { status: 500 });
  }
}
