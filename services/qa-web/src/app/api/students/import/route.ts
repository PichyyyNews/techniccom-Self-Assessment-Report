import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parseThaiName } from "@/lib/parseThaiName";

interface StudentImportItem {
  studentCode: string;
  prefix?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  level: string;
  year: string;
  majorName: string;
  majorCode: string;
  room: string;
  status?: "ACTIVE" | "GRADUATED" | "SUSPENDED" | "DROPPED";
  academicYear: string;
  semester?: string;
  advisorId?: string | null;
}

/**
 * POST /api/students/import
 * นำเข้าข้อมูลนักเรียนแบบ Bulk Import
 * รองรับทั้ง:
 * 1. Pre-parsed objects: { items: StudentImportItem[] }
 * 2. Dual-Textarea input: { ids: string[], names: string[], level, year, majorName, majorCode, room, academicYear, semester }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    let studentsToProcess: Array<{
      studentCode: string;
      prefix: string;
      firstName: string;
      lastName: string;
      level: string;
      year: string;
      majorName: string;
      majorCode: string;
      room: string;
      status: "ACTIVE" | "GRADUATED" | "SUSPENDED" | "DROPPED";
      academicYear: string;
      semester: string;
      advisorId?: string | null;
    }> = [];

    // Case 1: Dual-Textarea inputs (ids array + names array)
    if (Array.isArray(body.ids) && Array.isArray(body.names)) {
      const {
        ids,
        names,
        level,
        year,
        majorName,
        majorCode,
        room,
        academicYear,
        semester = "1",
        advisorId = null,
      } = body;

      if (ids.length !== names.length) {
        return NextResponse.json(
          {
            error: `จำนวนข้อมูลไม่ตรงกัน: รหัสนักศึกษา (${ids.length} รายการ) และชื่อนักศึกษา (${names.length} รายการ) ต้องเท่ากัน`,
          },
          { status: 400 }
        );
      }

      for (let i = 0; i < ids.length; i++) {
        const id = String(ids[i]).trim();
        const rawName = String(names[i]).trim();
        if (!id || !rawName) continue;

        const parsed = parseThaiName(rawName);
        studentsToProcess.push({
          studentCode: id,
          prefix: parsed.prefix,
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          level: level || "ปวช",
          year: String(year || "1"),
          majorName: majorName || "เทคนิคคอมพิวเตอร์",
          majorCode: majorCode || "ชทค",
          room: String(room || "1"),
          status: "ACTIVE",
          academicYear: String(academicYear),
          semester: String(semester),
          advisorId: advisorId || null,
        });
      }
    }
    // Case 2: Pre-parsed array of student items (e.g. from Excel/CSV upload or direct API)
    else if (Array.isArray(body.items)) {
      for (const item of body.items as StudentImportItem[]) {
        const studentCode = String(item.studentCode || "").trim();
        if (!studentCode) continue;

        let prefix = item.prefix || "";
        let firstName = item.firstName || "";
        let lastName = item.lastName || "";

        // If fullName was provided instead of separate fields
        if ((!firstName || !lastName) && item.fullName) {
          const parsed = parseThaiName(item.fullName);
          prefix = prefix || parsed.prefix;
          firstName = firstName || parsed.firstName;
          lastName = lastName || parsed.lastName;
        }

        studentsToProcess.push({
          studentCode,
          prefix: prefix || "นาย",
          firstName: firstName || "ไม่ระบุชื่อ",
          lastName: lastName || "",
          level: item.level || "ปวช",
          year: String(item.year || "1"),
          majorName: item.majorName || "เทคนิคคอมพิวเตอร์",
          majorCode: item.majorCode || "ชทค",
          room: String(item.room || "1"),
          status: item.status || "ACTIVE",
          academicYear: String(item.academicYear),
          semester: String(item.semester || "1"),
          advisorId: item.advisorId || null,
        });
      }
    } else {
      return NextResponse.json(
        { error: "รูปแบบข้อมูลนำเข้าไม่ถูกต้อง กรุณาระบุ ids และ names หรือ items" },
        { status: 400 }
      );
    }

    if (studentsToProcess.length === 0) {
      return NextResponse.json(
        { error: "ไม่พบรายการข้อมูลนักเรียนที่สามารถนำเข้าได้" },
        { status: 400 }
      );
    }

    // Process all students using upsert transactions (idempotent, like INSERT OR REPLACE)
    const results = await prisma.$transaction(
      studentsToProcess.map((student) =>
        prisma.student.upsert({
          where: {
            studentCode_academicYear_semester: {
              studentCode: student.studentCode,
              academicYear: student.academicYear,
              semester: student.semester,
            },
          },
          update: {
            prefix: student.prefix,
            firstName: student.firstName,
            lastName: student.lastName,
            level: student.level,
            year: student.year,
            majorName: student.majorName,
            majorCode: student.majorCode,
            room: student.room,
            status: student.status,
            ...(student.advisorId !== undefined && { advisorId: student.advisorId }),
          },
          create: {
            studentCode: student.studentCode,
            prefix: student.prefix,
            firstName: student.firstName,
            lastName: student.lastName,
            level: student.level,
            year: student.year,
            majorName: student.majorName,
            majorCode: student.majorCode,
            room: student.room,
            status: student.status,
            academicYear: student.academicYear,
            semester: student.semester,
            advisorId: student.advisorId,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `นำเข้าข้อมูลนักเรียนสำเร็จ ${results.length} รายการ`,
      count: results.length,
    });
  } catch (error: any) {
    console.error("[POST /api/students/import] Error:", error);
    return NextResponse.json(
      { error: `เกิดข้อผิดพลาดในการนำเข้าข้อมูล: ${error.message || error}` },
      { status: 500 }
    );
  }
}
