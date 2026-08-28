import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import * as bcrypt from "bcryptjs";

// GET /api/profile/[id] - Fetch specific user profile with real contributions & permissions check
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const isSelf = currentUserId === id;
    const isRoot = session.user.role === "ROOT";
    const userPermissions = session.user.permissions || [];

    const canViewAll =
      isRoot ||
      userPermissions.includes("profile.view_all") ||
      userPermissions.includes("profile.edit_all") ||
      userPermissions.includes("/admin/users");

    if (!isSelf && !canViewAll) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์ในการดูโปรไฟล์ของบุคลากรท่านนี้" },
        { status: 403 }
      );
    }

    const canEdit =
      isSelf ||
      isRoot ||
      userPermissions.includes("profile.edit_all") ||
      userPermissions.includes("/admin/users");

    // 1. Fetch user data with role definition and teacher license
    const user = await prisma.user.findUnique({
      where: { id },
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
        teacherLicense: true,
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
        userId: id,
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
    const recentActivities = activities.slice(0, 8);

    return NextResponse.json({
      user,
      contributionMap,
      totalContributions,
      recentActivities,
      canEdit,
      isSelf,
    });
  } catch (error: any) {
    console.error("GET /api/profile/[id] error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์" },
      { status: 500 }
    );
  }
}

// PUT /api/profile/[id] - Update modular profile sections with permission check & audit logging
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const isSelf = currentUserId === id;
    const isRoot = session.user.role === "ROOT";
    const userPermissions = session.user.permissions || [];

    const canEdit =
      isSelf ||
      isRoot ||
      userPermissions.includes("profile.edit_all") ||
      userPermissions.includes("/admin/users");

    if (!canEdit) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์ในการแก้ไขโปรไฟล์ของบุคลากรท่านนี้" },
        { status: 403 }
      );
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    const body = await req.json();
    const { section } = body;

    const updateData: any = {};
    let activityTitle = "อัปเดตข้อมูลโปรไฟล์";
    let activityAction = "UPDATE_PROFILE";

    // Handle TeacherLicense (คุรุสภา) Upsert
    if (section === "teacherLicense") {
      const {
        licenseType,
        licenseNumber,
        requestNumber,
        nameTh,
        nameEn,
        issuedDate,
        expiredDate,
        status,
        attachmentKey,
        attachmentName,
      } = body;

      if (!licenseNumber || !licenseNumber.trim()) {
        return NextResponse.json({ error: "กรุณาระบุเลขที่ใบอนุญาต" }, { status: 400 });
      }

      if (!issuedDate || !expiredDate) {
        return NextResponse.json({ error: "กรุณาระบุวันที่ออกบัตรและวันหมดอายุ" }, { status: 400 });
      }

      const issueDt = new Date(issuedDate);
      const expireDt = new Date(expiredDate);

      let computedStatus = status || "ACTIVE";
      if (computedStatus !== "IN_RENEWAL") {
        const today = new Date();
        const diffTime = expireDt.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          computedStatus = "EXPIRED";
        } else if (diffDays <= 180) {
          computedStatus = "EXPIRING_SOON";
        } else {
          computedStatus = "ACTIVE";
        }
      }

      const savedLicense = await prisma.teacherLicense.upsert({
        where: { userId: id },
        create: {
          userId: id,
          licenseType: licenseType || "BASIC_TEACHER",
          licenseNumber: licenseNumber.trim(),
          requestNumber: requestNumber ? requestNumber.trim() : null,
          nameTh: nameTh ? nameTh.trim() : null,
          nameEn: nameEn ? nameEn.trim() : null,
          issuedDate: issueDt,
          expiredDate: expireDt,
          status: computedStatus,
          attachmentKey: attachmentKey ? attachmentKey.trim() : null,
          attachmentName: attachmentName ? attachmentName.trim() : null,
        },
        update: {
          licenseType: licenseType || "BASIC_TEACHER",
          licenseNumber: licenseNumber.trim(),
          requestNumber: requestNumber ? requestNumber.trim() : null,
          nameTh: nameTh ? nameTh.trim() : null,
          nameEn: nameEn ? nameEn.trim() : null,
          issuedDate: issueDt,
          expiredDate: expireDt,
          status: computedStatus,
          attachmentKey: attachmentKey ? attachmentKey.trim() : null,
          attachmentName: attachmentName ? attachmentName.trim() : null,
        },
      });

      activityTitle = isSelf
        ? "อัปเดตข้อมูลใบอนุญาตประกอบวิชาชีพทางการศึกษา (คุรุสภา)"
        : `อัปเดตข้อมูลใบอนุญาตประกอบวิชาชีพทางการศึกษา (โดย ${session.user.name || "ผู้ดูแลระบบ"})`;
      activityAction = "UPDATE_TEACHER_LICENSE";

      await logActivity(id, activityAction, activityTitle, {
        licenseType,
        licenseNumber,
        editorId: session.user.id,
        editorName: session.user.name,
      });

      const updatedUser = await prisma.user.findUnique({
        where: { id },
        include: { roleDefinition: true, teacherLicense: true },
      });

      return NextResponse.json({
        message: "บันทึกข้อมูลใบอนุญาตประกอบวิชาชีพทางการศึกษาสำเร็จ",
        user: updatedUser,
        teacherLicense: savedLicense,
      });
    }

    if (section === "basic") {
      const { name, position, phone, birthDate, avatarUrl, bio } = body;
      if (name !== undefined) updateData.name = name.trim();
      if (position !== undefined) updateData.position = position ? position.trim() : null;
      if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
      if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl ? avatarUrl.trim() : null;
      if (bio !== undefined) updateData.bio = bio ? bio.trim() : null;
      activityTitle = isSelf
        ? "อัปเดตข้อมูลส่วนตัวและรูปประจำตัว"
        : `อัปเดตข้อมูลส่วนตัว (โดย ${session.user.name || "ผู้ดูแลระบบ"})`;
      activityAction = "UPDATE_BASIC_PROFILE";
    } else if (section === "education") {
      const { education } = body;
      updateData.education = education;
      activityTitle = isSelf
        ? "แก้ไขข้อมูลวุฒิการศึกษา"
        : `แก้ไขข้อมูลวุฒิการศึกษา (โดย ${session.user.name || "ผู้ดูแลระบบ"})`;
      activityAction = "UPDATE_EDUCATION";
    } else if (section === "workHistory") {
      const { workHistory } = body;
      updateData.workHistory = workHistory;
      activityTitle = isSelf
        ? "แก้ไขประวัติการทำงานและผลงาน"
        : `แก้ไขประวัติการทำงาน (โดย ${session.user.name || "ผู้ดูแลระบบ"})`;
      activityAction = "UPDATE_EXPERIENCE";
    } else if (section === "skills") {
      const { skills } = body;
      updateData.skills = Array.isArray(skills) ? skills : [];
      activityTitle = isSelf
        ? "อัปเดตทักษะและความเชี่ยวชาญ"
        : `อัปเดตทักษะและความเชี่ยวชาญ (โดย ${session.user.name || "ผู้ดูแลระบบ"})`;
      activityAction = "UPDATE_SKILLS";
    } else if (section === "licenses") {
      const { licenses } = body;
      updateData.licenses = Array.isArray(licenses) ? licenses : [];
      activityTitle = isSelf
        ? "อัปเดตข้อมูลใบอนุญาตประกอบวิชาชีพ"
        : `อัปเดตข้อมูลใบอนุญาตประกอบวิชาชีพ (โดย ${session.user.name || "ผู้ดูแลระบบ"})`;
      activityAction = "UPDATE_LICENSES";
    } else if (section === "password") {
      const { password } = body;
      if (!password || password.trim().length < 6) {
        return NextResponse.json(
          { error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" },
          { status: 400 }
        );
      }
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
      activityTitle = isSelf
        ? "เปลี่ยนรหัสผ่านเข้าสู่ระบบ"
        : `รีเซ็ตรหัสผ่านใหม่ (โดย ${session.user.name || "ผู้ดูแลระบบ"})`;
      activityAction = "CHANGE_PASSWORD";
    } else {
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
      where: { id },
      data: updateData,
      include: {
        roleDefinition: true,
        teacherLicense: true,
      },
    });

    // Log REAL activity to target user's timeline
    await logActivity(id, activityAction, activityTitle, {
      section,
      isSelf,
      editorId: currentUserId,
      editorName: session.user.name,
    });

    // If edited by another user, also log on editor's timeline
    if (!isSelf) {
      await logActivity(
        currentUserId,
        "EDIT_USER_PROFILE",
        `แก้ไขโปรไฟล์ของ ${targetUser.name} (${activityTitle})`,
        { targetUserId: id, targetUserName: targetUser.name, section }
      );
    }

    return NextResponse.json({
      message: `${activityTitle}เรียบร้อยแล้ว`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("PUT /api/profile/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" },
      { status: 500 }
    );
  }
}