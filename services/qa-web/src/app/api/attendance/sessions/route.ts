import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/attendance/sessions?assignmentId=...
 * ดึงรายการรอบการเช็กชื่อของรายวิชา/ห้องที่เลือก
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json({ error: "กรุณาระบุ assignmentId" }, { status: 400 });
    }

    const sessions = await prisma.attendanceSession.findMany({
      where: { assignmentId },
      include: {
        records: {
          select: {
            id: true,
            studentCode: true,
            status: true,
            remark: true,
          },
        },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    const sessionsWithStats = sessions.map((s) => {
      const present = s.records.filter((r) => r.status === "PRESENT").length;
      const late = s.records.filter((r) => r.status === "LATE").length;
      const absent = s.records.filter((r) => r.status === "ABSENT").length;
      const leave = s.records.filter((r) => r.status === "LEAVE").length;
      return {
        id: s.id,
        date: s.date,
        period: s.period,
        week: s.week,
        note: s.note,
        totalChecked: s.records.length,
        present,
        late,
        absent,
        leave,
      };
    });

    return NextResponse.json({ sessions: sessionsWithStats });
  } catch (error: any) {
    console.error("[GET /api/attendance/sessions] Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงรอบการเช็คชื่อ" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance/sessions
 * บันทึกการเช็กชื่อประจำวัน / รายคาบ (Daily Check-in)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assignmentId, date, period = "1-2", week = 1, note = "", records } = body;

    if (!assignmentId || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "กรุณาระบุ assignmentId และข้อมูลสถานะนักเรียน (records)" },
        { status: 400 }
      );
    }

    // Verify assignment exists
    const assignment = await prisma.teachingAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json({ error: "ไม่พบข้อมูลการมอบหมายสอนนี้" }, { status: 404 });
    }

    const checkDate = date ? new Date(date) : new Date();

    // Create session and records in transaction
    const result = await prisma.$transaction(async (tx) => {
      const newSession = await tx.attendanceSession.create({
        data: {
          assignmentId,
          date: checkDate,
          period: String(period),
          week: Number(week) || 1,
          note: note ? String(note).trim() : null,
          createdBy: session.user.id,
        },
      });

      const recordsData = records.map((r: any) => ({
        assignmentId,
        sessionId: newSession.id,
        studentId: r.studentId,
        studentCode: String(r.studentCode).trim(),
        status: r.status || "PRESENT",
        remark: r.remark ? String(r.remark).trim() : null,
        date: checkDate,
      }));

      await tx.attendanceRecord.createMany({
        data: recordsData,
      });

      return newSession;
    });

    return NextResponse.json({
      success: true,
      message: `บันทึกการเช็คชื่อสำเร็จ (${records.length} คน)`,
      sessionId: result.id,
    });
  } catch (error: any) {
    console.error("[POST /api/attendance/sessions] Error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการบันทึกการเช็คชื่อ" },
      { status: 500 }
    );
  }
}
