import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { DEFAULT_LICENSE_CONFIGS, ensureDefaultLicenseConfigs } from "@/lib/license-defaults";

// Helper: Check Admin/ROOT permission
async function checkAdminPermission() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return { error: "กรุณาเข้าสู่ระบบ", status: 401, session: null };
  }

  const isRoot = session.user.role === "ROOT";
  const permissions = session.user.permissions || [];
  const canManage = isRoot || permissions.includes("/admin/users");

  if (!canManage) {
    return {
      error: "คุณไม่มีสิทธิ์ในการจัดการการตั้งค่าประเภทใบอนุญาต (ต้องมีสิทธิ์ /admin/users)",
      status: 403,
      session: null,
    };
  }

  return { error: null, session };
}

// GET /api/admin/license-configs - List all license configurations for Admin
export async function GET() {
  try {
    const auth = await checkAdminPermission();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await ensureDefaultLicenseConfigs();

    const configs = await prisma.licenseTypeConfig.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    // Count usage in TeacherLicense for each code
    const licenseCounts = await prisma.teacherLicense.groupBy({
      by: ["licenseType"],
      _count: {
        _all: true,
      },
    });

    const usageMap: Record<string, number> = {};
    licenseCounts.forEach((item) => {
      usageMap[item.licenseType] = item._count._all;
    });

    const configsWithStats = configs.map((c) => ({
      ...c,
      usageCount: usageMap[c.code] || 0,
    }));

    return NextResponse.json({ configs: configsWithStats });
  } catch (error: any) {
    console.error("GET /api/admin/license-configs error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่าใบอนุญาต" },
      { status: 500 }
    );
  }
}

// POST /api/admin/license-configs - Create new license type configuration
export async function POST(req: Request) {
  try {
    const auth = await checkAdminPermission();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const {
      code,
      title,
      description,
      category,
      categoryLabel,
      defaultYears,
      issuer,
      color,
      icon,
      requiresProvisionalRound,
      requiresTitle,
      titleLabel,
      titlePlaceholder,
      presetChips,
      sortOrder,
      isActive,
    } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ error: "กรุณาระบุรหัสประเภท (Code)" }, { status: 400 });
    }

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "กรุณาระบุชื่อประเภทใบอนุญาต (Title)" }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase().replace(/\s+/g, "_");

    // Check duplicate
    const existing = await prisma.licenseTypeConfig.findUnique({
      where: { code: normalizedCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `รหัสประเภท '${normalizedCode}' มีอยู่ในระบบแล้ว` },
        { status: 400 }
      );
    }

    const newConfig = await prisma.licenseTypeConfig.create({
      data: {
        code: normalizedCode,
        title: title.trim(),
        description: description ? description.trim() : null,
        category: category || "vocational",
        categoryLabel:
          categoryLabel ||
          (category === "ksp"
            ? "ใบอนุญาตคุรุสภา / ผ่อนผัน (KSP)"
            : category === "vocational"
            ? "คุณวุฒิวิชาชีพ / มาตรฐานฝีมือ (TPQI/DSD/กว.)"
            : "หมวดหมู่อื่นๆ"),
        defaultYears: Number(defaultYears) || 5,
        issuer: issuer ? issuer.trim() : null,
        color: color || "teal",
        icon: icon || "Award",
        requiresProvisionalRound: Boolean(requiresProvisionalRound),
        requiresTitle: Boolean(requiresTitle),
        titleLabel: titleLabel ? titleLabel.trim() : null,
        titlePlaceholder: titlePlaceholder ? titlePlaceholder.trim() : null,
        presetChips: Array.isArray(presetChips) ? presetChips.filter(Boolean) : [],
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        isSystem: false,
      },
    });

    await logActivity(
      auth.session!.user.id,
      "CREATE_LICENSE_CONFIG",
      `เพิ่มประเภทใบอนุญาตใหม่: ${title} (${normalizedCode})`,
      { code: normalizedCode, title }
    );

    return NextResponse.json({
      message: "สร้างประเภทใบอนุญาตเรียบร้อยแล้ว",
      config: newConfig,
    });
  } catch (error: any) {
    console.error("POST /api/admin/license-configs error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างประเภทใบอนุญาต" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/license-configs - Update existing license configuration or preset chips
export async function PUT(req: Request) {
  try {
    const auth = await checkAdminPermission();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { action } = body;

    // 1. Reset Defaults Action
    if (action === "reset-defaults") {
      for (const item of DEFAULT_LICENSE_CONFIGS) {
        await prisma.licenseTypeConfig.upsert({
          where: { code: item.code },
          create: item,
          update: {
            title: item.title,
            description: item.description,
            category: item.category,
            categoryLabel: item.categoryLabel,
            defaultYears: item.defaultYears,
            issuer: item.issuer,
            color: item.color,
            icon: item.icon,
            requiresProvisionalRound: item.requiresProvisionalRound,
            requiresTitle: item.requiresTitle,
            titleLabel: item.titleLabel,
            titlePlaceholder: item.titlePlaceholder,
            presetChips: item.presetChips,
            sortOrder: item.sortOrder,
            isActive: item.isActive,
          },
        });
      }

      await logActivity(
        auth.session!.user.id,
        "RESET_LICENSE_CONFIGS",
        "คืนค่าตั้งต้นประเภทใบอนุญาตและตัวเลือกมาตรฐาน (คุรุสภา/TPQI/DSD/กว.)"
      );

      const configs = await prisma.licenseTypeConfig.findMany({
        orderBy: { sortOrder: "asc" },
      });

      return NextResponse.json({
        message: "คืนค่าตั้งต้นประเภทใบอนุญาตและตัวเลือกมาตรฐานเรียบร้อยแล้ว",
        configs,
      });
    }

    // 2. Toggle Active Status
    if (action === "toggle-active") {
      const { id, isActive } = body;
      if (!id) {
        return NextResponse.json({ error: "ไม่พบรหัสการตั้งค่า (ID)" }, { status: 400 });
      }

      const updated = await prisma.licenseTypeConfig.update({
        where: { id },
        data: { isActive: Boolean(isActive) },
      });

      return NextResponse.json({
        message: `ปรับสถานะเป็น ${updated.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"} สำเร็จ`,
        config: updated,
      });
    }

    // 3. Update Preset Chips Only
    if (action === "update-chips") {
      const { id, presetChips } = body;
      if (!id) {
        return NextResponse.json({ error: "ไม่พบรหัสการตั้งค่า (ID)" }, { status: 400 });
      }

      const updated = await prisma.licenseTypeConfig.update({
        where: { id },
        data: {
          presetChips: Array.isArray(presetChips) ? presetChips.filter(Boolean) : [],
        },
      });

      await logActivity(
        auth.session!.user.id,
        "UPDATE_LICENSE_PRESET_CHIPS",
        `อัปเดตตัวเลือกแนะนำ (Preset Chips) ของ ${updated.title}`,
        { id, presetChips }
      );

      return NextResponse.json({
        message: "อัปเดตตัวเลือกแนะนำเรียบร้อยแล้ว",
        config: updated,
      });
    }

    // 4. Standard Full Update
    const {
      id,
      title,
      description,
      category,
      categoryLabel,
      defaultYears,
      issuer,
      color,
      icon,
      requiresProvisionalRound,
      requiresTitle,
      titleLabel,
      titlePlaceholder,
      presetChips,
      sortOrder,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ไม่พบรหัสการตั้งค่า (ID)" }, { status: 400 });
    }

    const updated = await prisma.licenseTypeConfig.update({
      where: { id },
      data: {
        title: title ? title.trim() : undefined,
        description: description !== undefined ? (description ? description.trim() : null) : undefined,
        category: category !== undefined ? category : undefined,
        categoryLabel: categoryLabel !== undefined ? categoryLabel : undefined,
        defaultYears: defaultYears !== undefined ? Number(defaultYears) : undefined,
        issuer: issuer !== undefined ? (issuer ? issuer.trim() : null) : undefined,
        color: color !== undefined ? color : undefined,
        icon: icon !== undefined ? icon : undefined,
        requiresProvisionalRound:
          requiresProvisionalRound !== undefined ? Boolean(requiresProvisionalRound) : undefined,
        requiresTitle: requiresTitle !== undefined ? Boolean(requiresTitle) : undefined,
        titleLabel: titleLabel !== undefined ? (titleLabel ? titleLabel.trim() : null) : undefined,
        titlePlaceholder:
          titlePlaceholder !== undefined ? (titlePlaceholder ? titlePlaceholder.trim() : null) : undefined,
        presetChips: Array.isArray(presetChips) ? presetChips.filter(Boolean) : undefined,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    await logActivity(
      auth.session!.user.id,
      "UPDATE_LICENSE_CONFIG",
      `แก้ไขการตั้งค่าประเภทใบอนุญาต: ${updated.title} (${updated.code})`,
      { id, title: updated.title }
    );

    return NextResponse.json({
      message: "บันทึกการแก้ไขเรียบร้อยแล้ว",
      config: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/admin/license-configs error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตการตั้งค่าใบอนุญาต" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/license-configs?id=... - Delete custom license configuration
export async function DELETE(req: Request) {
  try {
    const auth = await checkAdminPermission();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "กรุณาระบุรหัสประเภทใบอนุญาตที่ต้องการลบ" }, { status: 400 });
    }

    const target = await prisma.licenseTypeConfig.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "ไม่พบข้อมูลประเภทใบอนุญาต" }, { status: 404 });
    }

    // Check if in use
    const usageCount = await prisma.teacherLicense.count({
      where: { licenseType: target.code },
    });

    if (usageCount > 0) {
      return NextResponse.json(
        {
          error: `ไม่สามารถลบประเภท '${target.title}' ได้เนื่องจากมีข้อมูลบุคลากรใช้งานอยู่ ${usageCount} รายการ กรุณาปิดการใช้งาน (Disable) แทน`,
        },
        { status: 400 }
      );
    }

    await prisma.licenseTypeConfig.delete({ where: { id } });

    await logActivity(
      auth.session!.user.id,
      "DELETE_LICENSE_CONFIG",
      `ลบประเภทใบอนุญาต: ${target.title} (${target.code})`,
      { id, code: target.code, title: target.title }
    );

    return NextResponse.json({
      message: `ลบประเภทใบอนุญาต '${target.title}' สำเร็จ`,
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/license-configs error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบประเภทใบอนุญาต" },
      { status: 500 }
    );
  }
}

