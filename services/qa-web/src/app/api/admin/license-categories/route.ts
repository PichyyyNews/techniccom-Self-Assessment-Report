import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { DEFAULT_LICENSE_CATEGORIES, ensureDefaultLicenseConfigs } from "@/lib/license-defaults";

// GET: List all categories with license count & usage count
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== "ROOT" && !session.user?.permissions?.includes("/admin/users"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await ensureDefaultLicenseConfigs();

    const categories = await prisma.licenseCategoryConfig.findMany({
      orderBy: { sortOrder: "asc" },
    });

    // Count how many LicenseTypeConfigs exist under each category
    const licenseTypeCounts = await prisma.licenseTypeConfig.groupBy({
      by: ["category"],
      _count: { _all: true },
    });

    const categoryStats = categories.map((cat) => {
      const match = licenseTypeCounts.find((c) => c.category === cat.code);
      return {
        ...cat,
        licenseCount: match?._count._all || 0,
      };
    });

    return NextResponse.json({ categories: categoryStats });
  } catch (error) {
    console.error("Failed to fetch admin license categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch license categories" },
      { status: 500 }
    );
  }
}

// POST: Create a new license category
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== "ROOT" && !session.user?.permissions?.includes("/admin/users"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { code, title, description, icon, color, sortOrder, isActive } = body;

    if (!code || !title) {
      return NextResponse.json(
        { error: "กรุณาระบุรหัสหมวดหมู่ (Code) และชื่อหมวดหมู่ (Title)" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");

    // Check duplicate code
    const existing = await prisma.licenseCategoryConfig.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `รหัสหมวดหมู่ "${cleanCode}" มีอยู่ในระบบแล้ว` },
        { status: 400 }
      );
    }

    const count = await prisma.licenseCategoryConfig.count();

    const newCategory = await prisma.licenseCategoryConfig.create({
      data: {
        code: cleanCode,
        title: title.trim(),
        description: description?.trim() || null,
        icon: icon || "GraduationCap",
        color: color || "teal",
        sortOrder: typeof sortOrder === "number" ? sortOrder : count + 1,
        isActive: isActive !== false,
        isSystem: false,
      },
    });

    if (session.user?.id) {
      await logActivity(
        session.user.id,
        "CREATE_LICENSE_CATEGORY",
        `สร้างหมวดหมู่ใบประกอบใหม่: ${newCategory.title} (${newCategory.code})`
      );
    }

    return NextResponse.json({ category: newCategory }, { status: 201 });
  } catch (error) {
    console.error("Failed to create license category:", error);
    return NextResponse.json(
      { error: "Failed to create license category" },
      { status: 500 }
    );
  }
}

// PUT: Update category or toggle active status or reset defaults
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== "ROOT" && !session.user?.permissions?.includes("/admin/users"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { action, id } = body;

    // Reset Defaults
    if (action === "reset-defaults") {
      for (const cat of DEFAULT_LICENSE_CATEGORIES) {
        await prisma.licenseCategoryConfig.upsert({
          where: { code: cat.code },
          create: cat,
          update: {
            title: cat.title,
            description: cat.description,
            icon: cat.icon,
            color: cat.color,
            sortOrder: cat.sortOrder,
            isActive: cat.isActive,
            isSystem: cat.isSystem,
          },
        });
      }

      if (session.user?.id) {
        await logActivity(
          session.user.id,
          "RESET_LICENSE_CATEGORIES",
          "รีเซ็ตหมวดหมู่ใบอนุญาตและคุณวุฒิกลับเป็นค่ามาตรฐานเริ่มต้น"
        );
      }

      return NextResponse.json({ success: true, message: "คืนค่าหมวดหมู่มาตรฐานสำเร็จ" });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing category ID" }, { status: 400 });
    }

    const currentCat = await prisma.licenseCategoryConfig.findUnique({
      where: { id },
    });

    if (!currentCat) {
      return NextResponse.json({ error: "ไม่พบหมวดหมู่นี้ในระบบ" }, { status: 404 });
    }

    // Toggle Active
    if (action === "toggle-active") {
      const updated = await prisma.licenseCategoryConfig.update({
        where: { id },
        data: { isActive: !currentCat.isActive },
      });

      if (session.user?.id) {
        await logActivity(
          session.user.id,
          "TOGGLE_LICENSE_CATEGORY",
          `${updated.isActive ? "เปิดการใช้งาน" : "ปิดการใช้งาน"}หมวดหมู่: ${updated.title}`
        );
      }

      return NextResponse.json({ category: updated });
    }

    // Standard Update
    const { title, description, icon, color, sortOrder, isActive } = body;

    const updated = await prisma.licenseCategoryConfig.update({
      where: { id },
      data: {
        title: title ? title.trim() : currentCat.title,
        description: description !== undefined ? description?.trim() : currentCat.description,
        icon: icon || currentCat.icon,
        color: color || currentCat.color,
        sortOrder: typeof sortOrder === "number" ? sortOrder : currentCat.sortOrder,
        isActive: isActive !== undefined ? isActive : currentCat.isActive,
      },
    });

    // Also update any LicenseTypeConfig that references this category to update their categoryLabel
    if (title && title !== currentCat.title) {
      await prisma.licenseTypeConfig.updateMany({
        where: { category: currentCat.code },
        data: { categoryLabel: title.trim() },
      });
    }

    if (session.user?.id) {
      await logActivity(
        session.user.id,
        "UPDATE_LICENSE_CATEGORY",
        `แก้ไขข้อมูลหมวดหมู่: ${updated.title}`
      );
    }

    return NextResponse.json({ category: updated });
  } catch (error) {
    console.error("Failed to update license category:", error);
    return NextResponse.json(
      { error: "Failed to update license category" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a custom category
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== "ROOT" && !session.user?.permissions?.includes("/admin/users"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing category ID" }, { status: 400 });
    }

    const category = await prisma.licenseCategoryConfig.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ error: "ไม่พบหมวดหมู่นี้ในระบบ" }, { status: 404 });
    }

    if (category.isSystem) {
      return NextResponse.json(
        { error: "ไม่สามารถลบหมวดหมู่ตั้งต้นของระบบได้" },
        { status: 400 }
      );
    }

    // Safety check: is any LicenseTypeConfig assigned to this category?
    const assignedCount = await prisma.licenseTypeConfig.count({
      where: { category: category.code },
    });

    if (assignedCount > 0) {
      return NextResponse.json(
        {
          error: `ไม่สามารถลบหมวดหมู่นี้ได้ เนื่องจากมีประเภทใบอนุญาตอยู่ภายใต้หมวดหมู่นี้จำนวน ${assignedCount} รายการ กรุณาย้ายหรือลบประเภทใบอนุญาตก่อน`,
        },
        { status: 400 }
      );
    }

    await prisma.licenseCategoryConfig.delete({
      where: { id },
    });

    if (session.user?.id) {
      await logActivity(
        session.user.id,
        "DELETE_LICENSE_CATEGORY",
        `ลบหมวดหมู่ใบอนุญาต: ${category.title} (${category.code})`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete license category:", error);
    return NextResponse.json(
      { error: "Failed to delete license category" },
      { status: 500 }
    );
  }
}