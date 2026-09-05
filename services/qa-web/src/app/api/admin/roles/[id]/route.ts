import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/admin/roles/[id] - Update role details and permissions
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

    const canManageRoles =
      session.user.role === "ROOT" ||
      (session.user as any).permissions?.includes("admin.roles") ||
      (session.user as any).permissions?.includes("/admin/users");

    if (!canManageRoles) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ในการแก้ไขยศ/สิทธิ์" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, color, permissions } = body;

    const role = await prisma.roleDefinition.findUnique({
      where: { id },
    });

    if (!role) {
      return NextResponse.json({ error: "ไม่พบข้อมูลยศ/สิทธิ์นี้" }, { status: 404 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (color !== undefined) updateData.color = color;
    if (permissions !== undefined) updateData.permissions = Array.isArray(permissions) ? permissions : role.permissions;

    // ROOT role must always have access to /admin/users and /dashboard
    if (role.isSystem || role.code === "ROOT") {
      if (permissions && (!permissions.includes("/admin/users") || !permissions.includes("/dashboard"))) {
        updateData.permissions = ["/dashboard", "/admin/users"];
      }
    }

    const updatedRole = await prisma.roleDefinition.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ message: "อัปเดตยศ/สิทธิ์สำเร็จ", role: updatedRole });
  } catch (error: any) {
    console.error("PUT /api/admin/roles/[id] error:", error);
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการแก้ไขยศ/สิทธิ์" }, { status: 500 });
  }
}

// DELETE /api/admin/roles/[id] - Delete custom role
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

    const canManageRoles =
      session.user.role === "ROOT" ||
      (session.user as any).permissions?.includes("admin.roles") ||
      (session.user as any).permissions?.includes("/admin/users");

    if (!canManageRoles) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ในการลบยศ/สิทธิ์" }, { status: 403 });
    }

    const role = await prisma.roleDefinition.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!role) {
      return NextResponse.json({ error: "ไม่พบข้อมูลยศ/สิทธิ์นี้" }, { status: 404 });
    }

    if (role.isSystem || role.code === "ROOT") {
      return NextResponse.json({ error: "ไม่สามารถลบยศระบบหลัก (ROOT) ได้" }, { status: 400 });
    }

    if (role._count.users > 0) {
      return NextResponse.json(
        { error: `ไม่สามารถลบได้เนื่องจากมียังมีผู้ใช้งาน ${role._count.users} คนอยู่ในยศนี้ กรุณาย้ายผู้ใช้ก่อน` },
        { status: 400 }
      );
    }

    await prisma.roleDefinition.delete({
      where: { id },
    });

    return NextResponse.json({ message: "ลบยศ/สิทธิ์เรียบร้อยแล้ว" });
  } catch (error: any) {
    console.error("DELETE /api/admin/roles/[id] error:", error);
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการลบยศ/สิทธิ์" }, { status: 500 });
  }
}
