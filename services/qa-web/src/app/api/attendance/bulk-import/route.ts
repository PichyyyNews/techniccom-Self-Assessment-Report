import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/attendance/bulk-import
 * นำเข้าข้อมูลเวลาเรียนแบบสรุปจากระบบ RMS หรือไฟล์ Excel/CSV
 * รับข้อมูล:
 * {
 *   assignmentId: string,
 *   importMode: "summary" | "sessions",
 *   note?: string,
 *   items: Array<{
 *     studentCode: string,
 *     present: number,
 *     late?: number,
 *     absent?: number,
 *     leave?: number,
 *     remark?: string
 *   }>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assignmentId, note = "นำเข้าข้อมูลเวลาเรียนจากระบบ RMS", items } = body;

    if (!assignmentId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "กรุณาระบุ assignmentId และข้อมูลรายชื่อ (items)" },
        { status: 400 }
      );
    }

    const assignment = await prisma.teachingAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json({ error: "ไม่พบข้อมูลการสอนนี้" }, { status: 404 });
    }

    // Get all students in this classroom to map studentId
    const students = await prisma.student.findMany({
      where: {
        level: assignment.level,
        year: assignment.year,
        majorCode: assignment.majorCode,
        room: assignment.room,
        academicYear: assignment.academicYear,
        semester: assignment.semester,
      },
    });

    const studentMap = new Map<string, string>(); // studentCode -> student.id
    students.forEach((s) => studentMap.set(s.studentCode, s.id));

    const now = new Date();

    // Create a Bulk Import Session to group these records
    const result = await prisma.$transaction(async (tx) => {
      const importSession = await tx.attendanceSession.create({
        data: {
          assignmentId,
          date: now,
          period: "RMS",
          week: 1,
          note: String(note).trim(),
          createdBy: session.user.id,
        },
      });

      const recordsToCreate: any[] = [];

      for (const item of items) {
        const code = String(item.studentCode || item["รหัสนักศึกษา"] || "").trim();
        if (!code) continue;

        const studentId = studentMap.get(code);
        if (!studentId) continue; // Skip student not in class

        const present = Number(item.present ?? item["มา"] ?? 0);
        const late = Number(item.late ?? item["สาย"] ?? 0);
        const absent = Number(item.absent ?? item["ขาด"] ?? 0);
        const leave = Number(item.leave ?? item["ลา"] ?? 0);
        const remark = item.remark || item["หมายเหตุ"] || null;

        // Generate individual record entries for the counts
        for (let i = 0; i < present; i++) {
          recordsToCreate.push({
            assignmentId,
            sessionId: importSession.id,
            studentId,
            studentCode: code,
            status: "PRESENT",
            remark,
            date: now,
          });
        }
        for (let i = 0; i < late; i++) {
          recordsToCreate.push({
            assignmentId,
            sessionId: importSession.id,
            studentId,
            studentCode: code,
            status: "LATE",
            remark,
            date: now,
          });
        }
        for (let i = 0; i < absent; i++) {
          recordsToCreate.push({
            assignmentId,
            sessionId: importSession.id,
            studentId,
            studentCode: code,
            status: "ABSENT",
            remark,
            date: now,
          });
        }
        for (let i = 0; i < leave; i++) {
          recordsToCreate.push({
            assignmentId,
            sessionId: importSession.id,
            studentId,
            studentCode: code,
            status: "LEAVE",
            remark,
            date: now,
          });
        }
      }

      if (recordsToCreate.length > 0) {
        await tx.attendanceRecord.createMany({
          data: recordsToCreate,
        });
      }

      return { sessionId: importSession.id, totalRecords: recordsToCreate.length };
    });

    return NextResponse.json({
      success: true,
      message: `นำเข้าข้อมูลเวลาเรียนจาก RMS สำเร็จ (บันทึก ${result.totalRecords} คาบ)`,
      sessionId: result.sessionId,
    });
  } catch (error: any) {
    console.error("[POST /api/attendance/bulk-import] Error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการนำเข้าข้อมูลเวลาเรียน" },
      { status: 500 }
    );
  }
}
