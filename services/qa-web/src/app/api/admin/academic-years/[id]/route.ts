import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * PUT /api/admin/academic-years/[id]
 * แก้ไขปีการศึกษา หรือตั้งค่าเป็นรอบข้อมูลหลัก (isCurrent)
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
    const canManage = isRoot || userPermissions.includes("academic_year.manage") || userPermissions.includes("/admin/users");

    if (!canManage) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์จัดการปีการศึกษา" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { label, isCurrent, isActive, startDate, endDate } = body;

    const existing = await prisma.academicYearConfig.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "ไม่พบข้อมูลปีการศึกษา" }, { status: 404 });
    }

    // If setting as current, unset previous current
    if (isCurrent === true) {
      await prisma.academicYearConfig.updateMany({
        where: { id: { not: id }, isCurrent: true },
        data: { isCurrent: false },
      });
    }

    const updated = await prisma.academicYearConfig.update({
      where: { id },
      data: {
        ...(label !== undefined && { label: String(label).trim() }),
        ...(isCurrent !== undefined && { isCurrent: Boolean(isCurrent) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    });

    return NextResponse.json({ message: "อัปเดตข้อมูลปีการศึกษาสำเร็จ", item: updated });
  } catch (error: any) {
    console.error("[PUT /api/admin/academic-years/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการอัปเดตปีการศึกษา" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/academic-years/[id]
 * ลบปีการศึกษา
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
    const canManage = isRoot || userPermissions.includes("academic_year.manage") || userPermissions.includes("/admin/users");

    if (!canManage) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์จัดการปีการศึกษา" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.academicYearConfig.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "ไม่พบข้อมูลปีการศึกษา" }, { status: 404 });
    }

    if (existing.isCurrent) {
      return NextResponse.json(
        { error: "ไม่สามารถลบรอบปีการศึกษาหลักที่กำลังใช้งานอยู่ได้ กรุณาเปลี่ยนรอบหลักก่อน" },
        { status: 400 }
      );
    }

    await prisma.academicYearConfig.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "ลบข้อมูลปีการศึกษาเรียบร้อยแล้ว" });
  } catch (error: any) {
    console.error("[DELETE /api/admin/academic-years/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการลบปีการศึกษา" },
      { status: 500 }
    );
  }
}
