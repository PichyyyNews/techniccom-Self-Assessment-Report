import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import * as bcrypt from "bcryptjs";

// GET /api/profile - Fetch current user profile with REAL contribution activity
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Fetch user data with role definition
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roleDefinition: {
          select: {
            id: true,
            code: true,
            title: true,
            color: true,
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    // 2. Query REAL activity logs for the past 365 days
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);

    const activities = await prisma.activityLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: oneYearAgo,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Aggregate contributions by date (YYYY-MM-DD)
    const contributionMap: Record<string, number> = {};
    activities.forEach((act) => {
      const dateStr = act.createdAt.toISOString().split("T")[0];
      contributionMap[dateStr] = (contributionMap[dateStr] || 0) + 1;
    });

    const totalContributions = activities.length;
    const recentActivities = activities.slice(0, 5);

    return NextResponse.json({
      user,
      contributionMap,
      totalContributions,
      recentActivities,
    });
  } catch (error: any) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์" }, { status: 500 });
  }
}

// PUT /api/profile - Update modular profile sections with real activity logging
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { section } = body;

    const updateData: any = {};
    let activityTitle = "อัปเดตข้อมูลโปรไฟล์";
    let activityAction = "UPDATE_PROFILE";

    if (section === "basic") {
      const { name, position, phone, birthDate, avatarUrl, bio } = body;
      if (name !== undefined) updateData.name = name.trim();
      if (position !== undefined) updateData.position = position ? position.trim() : null;
      if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
      if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl ? avatarUrl.trim() : null;
      if (bio !== undefined) updateData.bio = bio ? bio.trim() : null;
      activityTitle = "อัปเดตข้อมูลส่วนตัวและรูปประจำตัว";
      activityAction = "UPDATE_BASIC_PROFILE";
    } else if (section === "education") {
      const { education } = body;
      updateData.education = education;
      activityTitle = "แก้ไขข้อมูลวุฒิการศึกษา";
      activityAction = "UPDATE_EDUCATION";
    } else if (section === "workHistory") {
      const { workHistory } = body;
      updateData.workHistory = workHistory;
      activityTitle = "แก้ไขประวัติการทำงานและผลงาน";
      activityAction = "UPDATE_EXPERIENCE";
    } else if (section === "skills") {
      const { skills } = body;
      updateData.skills = Array.isArray(skills) ? skills : [];
      activityTitle = "อัปเดตทักษะและความเชี่ยวชาญ";
      activityAction = "UPDATE_SKILLS";
    } else if (section === "licenses") {
      const { licenses } = body;
      updateData.licenses = Array.isArray(licenses) ? licenses : [];
      activityTitle = "อัปเดตข้อมูลใบอนุญาตประกอบวิชาชีพ";
      activityAction = "UPDATE_LICENSES";
    } else if (section === "password") {
      const { password } = body;
      if (!password || password.trim().length < 6) {
        return NextResponse.json({ error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
      }
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
      activityTitle = "เปลี่ยนรหัสผ่านเข้าสู่ระบบ";
      activityAction = "CHANGE_PASSWORD";
    } else {
      // General update fallback
      const { name, position, phone, birthDate, avatarUrl, bio, education, workHistory, skills, licenses, password } = body;
      if (name !== undefined) updateData.name = name.trim();
      if (position !== undefined) updateData.position = position ? position.trim() : null;
      if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
      if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl ? avatarUrl.trim() : null;
      if (bio !== undefined) updateData.bio = bio ? bio.trim() : null;
      if (education !== undefined) updateData.education = education;
      if (workHistory !== undefined) updateData.workHistory = workHistory;
      if (skills !== undefined) updateData.skills = Array.isArray(skills) ? skills : [];
      if (licenses !== undefined) updateData.licenses = Array.isArray(licenses) ? licenses : [];
      if (password && password.trim().length >= 6) {
        updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        roleDefinition: true,
      },
    });

    // Log REAL activity
    await logActivity(userId, activityAction, activityTitle, { section });

    return NextResponse.json({
      message: `${activityTitle}เรียบร้อยแล้ว`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("PUT /api/profile error:", error);
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" }, { status: 500 });
  }
}
