import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * PUT /api/admin/curriculum/[id]
 * แก้ไขระดับชั้น สาขา และห้องเรียน
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isRoot = session.user.role === "ROOT";
    const userPermissions = (session.user as any).permissions || [];
    const canManage = isRoot || userPermissions.includes("curriculum.manage") || userPermissions.includes("/admin/users");

    if (!canManage) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์จัดการข้อมูลโครงสร้างชั้นเรียน" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { level, year, majorName, majorCode, room, isActive, sortOrder } = body;

    const existing = await prisma.classSectionConfig.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "ไม่พบข้อมูลห้องเรียนนี้" }, { status: 404 });
    }

    const updated = await prisma.classSectionConfig.update({
      where: { id },
      data: {
        ...(level !== undefined && { level: String(level).trim() }),
        ...(year !== undefined && { year: String(year).trim() }),
        ...(majorName !== undefined && { majorName: String(majorName).trim() }),
        ...(majorCode !== undefined && { majorCode: String(majorCode).trim() }),
        ...(room !== undefined && { room: String(room).trim() }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
      },
    });

    return NextResponse.json({ message: "อัปเดตข้อมูลห้องเรียนสำเร็จ", item: updated });
  } catch (error: any) {
    console.error("[PUT /api/admin/curriculum/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการอัปเดตห้องเรียน" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/curriculum/[id]
 * ลบห้องเรียน
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isRoot = session.user.role === "ROOT";
    const userPermissions = (session.user as any).permissions || [];
    const canManage = isRoot || userPermissions.includes("curriculum.manage") || userPermissions.includes("/admin/users");

    if (!canManage) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์จัดการข้อมูลโครงสร้างชั้นเรียน" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.classSectionConfig.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "ไม่พบข้อมูลห้องเรียนนี้" }, { status: 404 });
    }

    await prisma.classSectionConfig.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "ลบห้องเรียนเรียบร้อยแล้ว" });
  } catch (error: any) {
    console.error("[DELETE /api/admin/curriculum/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการลบห้องเรียน" },
      { status: 500 }
    );
  }
}
