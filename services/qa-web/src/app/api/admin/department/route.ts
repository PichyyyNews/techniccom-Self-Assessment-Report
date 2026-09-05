import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DEFAULT_PROFILE = {
  nameTh: "แผนกวิชาเทคโนโลยีคอมพิวเตอร์",
  nameEn: "Department of Computer Technology",
  collegeName: "วิทยาลัยเทคนิค",
  faculty: "ประเภทวิชาช่างอุตสาหกรรม",
  philosophy: "ความรู้คู่คุณธรรม นำเทคโนโลยี สู่มาตรฐานสากล",
  vision:
    "มุ่งมั่นจัดการศึกษาและพัฒนาบุคลากรด้านเทคโนโลยีคอมพิวเตอร์ให้มีความรู้ ทักษะวิชาชีพ และจรรยาบรรณ สอดคล้องกับความต้องการของสถานประกอบการและสังคม",
  mission:
    "1. พัฒนาหลักสูตรฐานสมรรถนะให้ทันสมัยสอดคล้องกับเทคโนโลยีดิจิทัล\n2. จัดการเรียนรู้เน้นผู้เรียนเป็นสำคัญและฝึกปฏิบัติงานจริง\n3. ส่งเสริมงานวิจัย นวัตกรรม และสิ่งประดิษฐ์คนรุ่นใหม่\n4. สร้างเครือข่ายความร่วมมือกับสถานประกอบการในการจัดการศึกษาระบบทวิภาคี",
  identity: "ทักษะเด่น เน้นคุณธรรม นำเทคโนโลยี",
  uniqueness: "คอมพิวเตอร์ฮาร์ดแวร์ เครือข่าย และการพัฒนาซอฟต์แวร์ประยุกต์",
  colors: "น้ำเงิน - ขาว",
  roomLocation: "อาคาร 4 ชั้น 2 แผนกวิชาเทคโนโลยีคอมพิวเตอร์",
  headTeacherName: "หัวหน้าแผนกวิชาเทคโนโลยีคอมพิวเตอร์",
  phone: "02-xxx-xxxx ต่อ 104",
  email: "techniccom@college.ac.th",
  facebook: "แผนกวิชาเทคโนโลยีคอมพิวเตอร์",
  website: "",
  laboratories: [
    {
      name: "ห้องปฏิบัติการคอมพิวเตอร์และเครือข่าย (Network Lab)",
      room: "Lab 421",
      capacity: 40,
      equipment: "คอมพิวเตอร์ 40 เครื่อง, Cisco Switch/Router, Rack Server",
    },
    {
      name: "ห้องปฏิบัติการซ่อมบำรุงและฮาร์ดแวร์ (Hardware Lab)",
      room: "Lab 422",
      capacity: 35,
      equipment: "โต๊ะปฏิบัติการซ่อม, เครื่องมือวัดอิเล็กทรอนิกส์, ชุดฝึก IoT",
    },
    {
      name: "ห้องปฏิบัติการพัฒนาซอฟต์แวร์ (Software Dev Lab)",
      room: "Lab 423",
      capacity: 40,
      equipment: "คอมพิวเตอร์สเปกสูง 40 เครื่อง, จอคู่, สื่อมัลติมีเดีย",
    },
  ],
  qualityGoals: [
    {
      indicator: "อัตราคงอยู่ของผู้เรียนในแผนกวิชา (Retention Rate)",
      target: "≥ 95%",
      note: "มาตรฐานที่ 1 SAR",
    },
    {
      indicator: "ร้อยละของผู้เรียนที่มีเวลาเรียนครบเกณฑ์สิทธิ์สอบ (≥ 80%)",
      target: "≥ 90%",
      note: "มาตรฐานที่ 1 SAR",
    },
    {
      indicator: "ร้อยละของผู้สำเร็จการศึกษาที่มีงานทำหรือศึกษาต่อ",
      target: "≥ 85%",
      note: "มาตรฐานที่ 1 SAR",
    },
    {
      indicator: "ครูทุกคนจัดทำแผนการจัดการเรียนรู้และบันทึกหลังสอน",
      target: "100%",
      note: "มาตรฐานที่ 2 SAR",
    },
    {
      indicator: "จำนวนชั่วโมงการพัฒนาวิชาชีพของครูเฉลี่ย",
      target: "≥ 20 ชม./คน/ปี",
      note: "มาตรฐานที่ 2 SAR",
    },
    {
      indicator: "จำนวนผลงานวิจัยในชั้นเรียนและนวัตกรรมสิ่งประดิษฐ์",
      target: "≥ 1 เรื่อง/คน/ปี",
      note: "มาตรฐานที่ 3 SAR",
    },
  ],
};

/**
 * GET /api/admin/department
 * ดึงข้อมูลบริบทแผนกวิชา
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get("academicYear") || undefined;

    let profile = await prisma.departmentProfile.findFirst({
      where: academicYear ? { academicYear } : undefined,
      orderBy: { createdAt: "desc" },
    });

    if (!profile) {
      // Auto-create default profile if none exists
      profile = await prisma.departmentProfile.create({
        data: {
          ...DEFAULT_PROFILE,
          academicYear: academicYear || "2569",
        },
      });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("[GET /api/admin/department] Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลบริบทแผนกวิชา" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/department
 * อัปเดตข้อมูลบริบทแผนกวิชา
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isRoot = session.user.role === "ROOT";
    const isDeptHead = (session.user as any).role === "DEPT_HEAD";
    const userPermissions = (session.user as any).permissions || [];
    const canManage =
      isRoot ||
      isDeptHead ||
      userPermissions.includes("admin.department") ||
      userPermissions.includes("/admin/department") ||
      userPermissions.includes("/admin/users");

    if (!canManage) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลบริบทแผนกวิชา" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      id,
      nameTh,
      nameEn,
      collegeName,
      faculty,
      philosophy,
      vision,
      mission,
      identity,
      uniqueness,
      colors,
      logoUrl,
      coverUrl,
      headTeacherId,
      headTeacherName,
      phone,
      email,
      facebook,
      website,
      roomLocation,
      laboratories,
      qualityGoals,
      academicYear,
    } = body;

    let updated;
    if (id) {
      updated = await prisma.departmentProfile.update({
        where: { id },
        data: {
          nameTh: nameTh ?? undefined,
          nameEn: nameEn ?? undefined,
          collegeName: collegeName ?? undefined,
          faculty: faculty ?? undefined,
          philosophy: philosophy ?? undefined,
          vision: vision ?? undefined,
          mission: mission ?? undefined,
          identity: identity ?? undefined,
          uniqueness: uniqueness ?? undefined,
          colors: colors ?? undefined,
          logoUrl: logoUrl ?? undefined,
          coverUrl: coverUrl ?? undefined,
          headTeacherId: headTeacherId ?? undefined,
          headTeacherName: headTeacherName ?? undefined,
          phone: phone ?? undefined,
          email: email ?? undefined,
          facebook: facebook ?? undefined,
          website: website ?? undefined,
          roomLocation: roomLocation ?? undefined,
          laboratories: laboratories !== undefined ? laboratories : undefined,
          qualityGoals: qualityGoals !== undefined ? qualityGoals : undefined,
          academicYear: academicYear ?? undefined,
        },
      });
    } else {
      updated = await prisma.departmentProfile.create({
        data: {
          nameTh: nameTh || DEFAULT_PROFILE.nameTh,
          nameEn: nameEn || DEFAULT_PROFILE.nameEn,
          collegeName: collegeName || DEFAULT_PROFILE.collegeName,
          faculty: faculty || DEFAULT_PROFILE.faculty,
          philosophy: philosophy ?? DEFAULT_PROFILE.philosophy,
          vision: vision ?? DEFAULT_PROFILE.vision,
          mission: mission ?? DEFAULT_PROFILE.mission,
          identity: identity ?? DEFAULT_PROFILE.identity,
          uniqueness: uniqueness ?? DEFAULT_PROFILE.uniqueness,
          colors: colors ?? DEFAULT_PROFILE.colors,
          logoUrl: logoUrl ?? null,
          coverUrl: coverUrl ?? null,
          headTeacherId: headTeacherId ?? null,
          headTeacherName: headTeacherName ?? DEFAULT_PROFILE.headTeacherName,
          phone: phone ?? DEFAULT_PROFILE.phone,
          email: email ?? DEFAULT_PROFILE.email,
          facebook: facebook ?? DEFAULT_PROFILE.facebook,
          website: website ?? "",
          roomLocation: roomLocation ?? DEFAULT_PROFILE.roomLocation,
          laboratories: laboratories || DEFAULT_PROFILE.laboratories,
          qualityGoals: qualityGoals || DEFAULT_PROFILE.qualityGoals,
          academicYear: academicYear || "2569",
        },
      });
    }

    // Record ActivityLog
    if (session.user.id) {
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_DEPARTMENT_PROFILE",
          title: "อัปเดตข้อมูลบริบทแผนกวิชา",
          metadata: { profileId: updated.id, nameTh: updated.nameTh },
        },
      }).catch((e: any) => console.warn("ActivityLog create skipped:", e.message));
    }

    return NextResponse.json({ profile: updated, message: "บันทึกข้อมูลบริบทแผนกวิชาเรียบร้อยแล้ว" });
  } catch (error: any) {
    console.error("[PUT /api/admin/department] Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูลบริบทแผนกวิชา" },
      { status: 500 }
    );
  }
}
