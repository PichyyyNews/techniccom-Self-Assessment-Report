import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * DELETE /api/admin/teaching-assignments/[id]
 * ยกเลิกการมอบหมายการสอน
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
    const userRoleCode = (session.user as any).roleCode || "";
    const permissions = (session.user as any).permissions || [];
    const canAssign =
      isRoot ||
      userRoleCode === "DEPT_HEAD" ||
      permissions.includes("curriculum.manage") ||
      permissions.includes("/admin/users");

    if (!canAssign) {
      return NextResponse.json(
        { error: "ไม่มีสิทธิ์ยกเลิกการมอบหมายรายวิชาสอน" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const existing = await prisma.teachingAssignment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "ไม่พบข้อมูลการมอบหมายสอน" }, { status: 404 });
    }

    await prisma.teachingAssignment.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "ยกเลิกการมอบหมายสอนสำเร็จ" });
  } catch (error: any) {
    console.error("[DELETE /api/admin/teaching-assignments/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการยกเลิกการมอบหมายสอน" },
      { status: 500 }
    );
  }
}
