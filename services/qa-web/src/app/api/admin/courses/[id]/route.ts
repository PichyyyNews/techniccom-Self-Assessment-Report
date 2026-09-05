import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * PUT /api/admin/courses/[id]
 * แก้ไขข้อมูลรายวิชา
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
    const permissions = (session.user as any).permissions || [];
    const canManage =
      isRoot ||
      permissions.includes("curriculum.manage") ||
      permissions.includes("/admin/users");

    if (!canManage) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์จัดการข้อมูลรายวิชา" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { courseName, theoryHours, practiceHours, credits, level, majorCode, isActive } = body;

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "ไม่พบข้อมูลรายวิชานี้" }, { status: 404 });
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(courseName !== undefined && { courseName: String(courseName).trim() }),
        ...(theoryHours !== undefined && { theoryHours: Number(theoryHours) }),
        ...(practiceHours !== undefined && { practiceHours: Number(practiceHours) }),
        ...(credits !== undefined && { credits: Number(credits) }),
        ...(level !== undefined && { level: String(level).trim() }),
        ...(majorCode !== undefined && { majorCode: String(majorCode).trim() }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return NextResponse.json({ message: "อัปเดตรายวิชาสำเร็จ", item: updated });
  } catch (error: any) {
    console.error("[PUT /api/admin/courses/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการอัปเดตรายวิชา" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/courses/[id]
 * ลบข้อมูลรายวิชา
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
    const permissions = (session.user as any).permissions || [];
    const canManage =
      isRoot ||
      permissions.includes("curriculum.manage") ||
      permissions.includes("/admin/users");

    if (!canManage) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์จัดการข้อมูลรายวิชา" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: { select: { assignments: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "ไม่พบข้อมูลรายวิชา" }, { status: 404 });
    }

    if (existing._count.assignments > 0) {
      return NextResponse.json(
        { error: `ไม่สามารถลบวิชานี้ได้เนื่องจากมีการมอบหมายการสอนอยู่ ${existing._count.assignments} รายการ` },
        { status: 400 }
      );
    }

    await prisma.course.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "ลบรายวิชาสำเร็จ" });
  } catch (error: any) {
    console.error("[DELETE /api/admin/courses/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการลบรายวิชา" },
      { status: 500 }
    );
  }
}
