import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

// GET /api/admin/users - List all users (Only SUPER_ADMIN and QA_HEAD)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.QA_HEAD) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            code: true,
            nameTh: true,
          },
        },
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

// POST /api/admin/users - Create new user (Only SUPER_ADMIN and QA_HEAD)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    if (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.QA_HEAD) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์สร้างผู้ใช้งาน" }, { status: 403 });
    }

    const body = await req.json();
    const { email, password, name, role, departmentId } = body;

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

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        name: name.trim(),
        role: (role as Role) || Role.TEACHER,
        departmentId: departmentId || null,
        isActive: true,
      },
      include: {
        department: true,
      },
    });

    return NextResponse.json(
      {
        message: "สร้างผู้ใช้งานสำเร็จ",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          department: newUser.department,
          isActive: newUser.isActive,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการสร้างผู้ใช้" }, { status: 500 });
  }
}
