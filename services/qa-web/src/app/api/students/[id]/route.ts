import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * PUT /api/students/[id]
 * แก้ไขข้อมูลนักเรียน
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

    const { id } = await params;
    const body = await request.json();
    const {
      studentCode,
      prefix,
      firstName,
      lastName,
      level,
      year,
      majorName,
      majorCode,
      room,
      status,
      academicYear,
      semester,
      advisorId,
    } = body;

    // Check student exists
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลนักเรียนที่ต้องการแก้ไข" },
        { status: 404 }
      );
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        ...(studentCode !== undefined && { studentCode: studentCode.trim() }),
        ...(prefix !== undefined && { prefix }),
        ...(firstName !== undefined && { firstName: firstName.trim() }),
        ...(lastName !== undefined && { lastName: lastName.trim() }),
        ...(level !== undefined && { level }),
        ...(year !== undefined && { year }),
        ...(majorName !== undefined && { majorName }),
        ...(majorCode !== undefined && { majorCode }),
        ...(room !== undefined && { room }),
        ...(status !== undefined && { status }),
        ...(academicYear !== undefined && { academicYear }),
        ...(semester !== undefined && { semester }),
        ...(advisorId !== undefined && { advisorId: advisorId || null }),
      },
      include: {
        advisor: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(student);
  } catch (error: any) {
    console.error("[PUT /api/students/[id]] Error:", error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "รหัสนักศึกษานี้มีอยู่แล้วในปีการศึกษาและภาคเรียนที่เลือก" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลนักเรียน" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/students/[id]
 * ลบข้อมูลนักเรียน
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

    const { id } = await params;

    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลนักเรียนที่ต้องการลบ" },
        { status: 404 }
      );
    }

    await prisma.student.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "ลบข้อมูลนักเรียนสำเร็จ" });
  } catch (error) {
    console.error("[DELETE /api/students/[id]] Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบข้อมูลนักเรียน" },
      { status: 500 }
    );
  }
}
