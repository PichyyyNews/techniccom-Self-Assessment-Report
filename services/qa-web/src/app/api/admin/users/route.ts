import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

// GET /api/admin/users - List all users
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
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        roleCode: true,
        roleDefinitionId: true,
        roleDefinition: {
          select: {
            id: true,
            code: true,
            title: true,
            color: true,
            permissions: true,
          },
        },
        position: true,
        phone: true,
        birthDate: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" }, { status: 500 });
  }
}

// POST /api/admin/users - Create new user
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const hasPermission =
      session.user.role === "ROOT" ||
      session.user.permissions?.includes("/admin/users");

    if (!hasPermission) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์สร้างผู้ใช้งาน" }, { status: 403 });
    }

    const body = await req.json();
    const { email, password, name, roleCode, position, phone, birthDate, avatarUrl } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน (อีเมล, รหัสผ่าน, ชื่อ-สกุล)" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานในระบบแล้ว" }, { status: 400 });
    }

    // Resolve RoleDefinition
    const targetRoleCode = roleCode || "STAFF";
    const roleDef = await prisma.roleDefinition.findUnique({
      where: { code: targetRoleCode },
    });

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        name: name.trim(),
        roleCode: targetRoleCode,
        roleDefinitionId: roleDef?.id || null,
        position: position ? position.trim() : null,
        phone: phone ? phone.trim() : null,
        birthDate: birthDate ? new Date(birthDate) : null,
        avatarUrl: avatarUrl ? avatarUrl.trim() : null,
        isActive: true,
      },
      include: {
        roleDefinition: true,
      },
    });

    return NextResponse.json(
      {
        message: "สร้างผู้ใช้งานสำเร็จ",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการสร้างผู้ใช้" }, { status: 500 });
  }
}
