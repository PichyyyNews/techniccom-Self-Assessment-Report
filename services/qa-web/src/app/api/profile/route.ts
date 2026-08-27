import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

// GET /api/profile - Fetch current logged-in user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        roleDefinition: {
          select: {
            id: true,
            code: true,
            title: true,
            color: true,
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์" }, { status: 500 });
  }
}

// PUT /api/profile - Update current logged-in user profile
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      position,
      phone,
      birthDate,
      avatarUrl,
      coverUrl,
      bio,
      education,
      workHistory,
      skills,
      password,
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (position !== undefined) updateData.position = position ? position.trim() : null;
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl ? avatarUrl.trim() : null;
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl ? coverUrl.trim() : null;
    if (bio !== undefined) updateData.bio = bio ? bio.trim() : null;
    if (education !== undefined) updateData.education = education;
    if (workHistory !== undefined) updateData.workHistory = workHistory;
    if (skills !== undefined) updateData.skills = Array.isArray(skills) ? skills : [];

    if (password && password.trim().length > 0) {
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      include: {
        roleDefinition: true,
      },
    });

    return NextResponse.json({
      message: "บันทึกโปรไฟล์เรียบร้อยแล้ว",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("PUT /api/profile error:", error);
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการบันทึกโปรไฟล์" }, { status: 500 });
  }
}
