import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

// PUT /api/admin/users/[id] - Update user details, role, position, phone, birthDate, avatar, password, or active status
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || !session.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const hasPermission =
      session.user.role === "ROOT" ||
      session.user.permissions?.includes("/admin/users");

    if (!hasPermission) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์แก้ไขผู้ใช้งาน" }, { status: 403 });
    }

    const body = await req.json();
    const { name, roleCode, position, phone, birthDate, avatarUrl, isActive, password } = body;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    // Root Admin Protection: Cannot deactivate or demote root admin email
    const rootEmail = (process.env.ROOT_ADMIN_EMAIL || "admin@technic.ac.th").toLowerCase();
    if (user.email.toLowerCase() === rootEmail) {
      if (isActive === false) {
        return NextResponse.json({ error: "ไม่สามารถระงับการใช้งาน Root Admin ได้" }, { status: 400 });
      }
      if (roleCode && roleCode !== "ROOT") {
        return NextResponse.json({ error: "ไม่สามารถลดระดับสิทธิ์ Root Admin ได้" }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (roleCode !== undefined) {
      updateData.roleCode = roleCode;
      const roleDef = await prisma.roleDefinition.findUnique({ where: { code: roleCode } });
      updateData.roleDefinitionId = roleDef?.id || null;
    }
    if (position !== undefined) updateData.position = position ? position.trim() : null;
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl ? avatarUrl.trim() : null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    if (password && password.trim().length > 0) {
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { roleDefinition: true },
    });

    return NextResponse.json({
      message: "อัปเดตข้อมูลผู้ใช้สำเร็จ",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("PUT /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการแก้ไขผู้ใช้" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || !session.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const hasPermission =
      session.user.role === "ROOT" ||
      session.user.permissions?.includes("/admin/users");

    if (!hasPermission) {
      return NextResponse.json({ error: "เฉพาะผู้มีสิทธิ์เท่านั้นที่สามารถลบผู้ใช้ได้" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    const rootEmail = (process.env.ROOT_ADMIN_EMAIL || "admin@technic.ac.th").toLowerCase();
    if (user.email.toLowerCase() === rootEmail) {
      return NextResponse.json({ error: "ไม่สามารถลบบัญชี Root Admin ได้" }, { status: 400 });
    }

    if (user.id === session.user.id) {
      return NextResponse.json({ error: "ไม่สามารถลบบัญชีของตนเองที่กำลังล็อกอินอยู่ได้" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "ลบผู้ใช้งานเรียบร้อยแล้ว" });
  } catch (error: any) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการลบผู้ใช้" }, { status: 500 });
  }
}
