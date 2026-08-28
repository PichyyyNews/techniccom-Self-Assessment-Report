import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Users,
  ShieldCheck,
  User,
  Phone,
  Calendar,
  Briefcase,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Shield,
  Layers,
  Scroll,
  FileBadge,
  AlertTriangle,
  ExternalLink,
  Award,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

function calculateAge(birthDateString?: string | Date | null) {
  if (!birthDateString) return null;
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Fetch full user details from DB including teacherLicenses
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          roleDefinition: true,
          teacherLicenses: {
            orderBy: { issuedDate: "desc" },
          },
        },
      })
    : null;

  const isRoot = session?.user?.role === "ROOT";
  const userPermissions = session?.user?.permissions || ["/dashboard"];
  const canManageUsers = isRoot || userPermissions.includes("/admin/users");

  const [userCount, roleCount, totalActiveTeachers, validLicenseCount, expiringCount] = await Promise.all([
    canManageUsers ? prisma.user.count() : 0,
    canManageUsers ? prisma.roleDefinition.count() : 0,
    canManageUsers ? prisma.user.count({ where: { isActive: true } }) : 0,
    canManageUsers
      ? prisma.teacherLicense.count({
          where: {
            status: { in: ["ACTIVE", "EXPIRING_SOON"] },
            expiredDate: { gte: new Date() },
          },
        })
      : 0,
    canManageUsers
      ? prisma.teacherLicense.count({
          where: {
            OR: [
              { status: "EXPIRING_SOON" },
              {
                expiredDate: {
                  gte: new Date(),
                  lte: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
                },
              },
            ],
          },
        })
      : 0,
  ]);

  const sarLicensePercentage =
    totalActiveTeachers > 0 ? Math.round((validLicenseCount / totalActiveTeachers) * 100) : 0;

  // Personal Teacher License Status Check
  let licenseAlert: {
    type: "expired" | "expiring" | "renewal" | "missing" | "provisional3";
    title: string;
    description: string;
    daysLeft?: number;
  } | null = null;

  if (user) {
    const kspLicense = user.teacherLicenses?.find((l) =>
      ["KSP_A_LICENSE", "KSP_B_LICENSE", "KSP_P_LICENSE", "KSP_PROVISIONAL"].includes(l.licenseType)
    );

    if (!kspLicense) {
      licenseAlert = {
        type: "missing",
        title: "ยังไม่ได้บันทึกข้อมูลใบอนุญาตประกอบวิชาชีพทางการศึกษา (คุรุสภา / หนังสือผ่อนผัน)",
        description: "กรุณากรอกข้อมูลและแนบไฟล์หลักฐานเพื่อใช้ในรายงานประเมินตนเอง (SAR)",
      };
    } else if (kspLicense.licenseType === "KSP_PROVISIONAL" && kspLicense.provisionalRound === 3) {
      licenseAlert = {
        type: "provisional3",
        title: "หนังสือผ่อนผันคุรุสภาครั้งที่ 3 (ครั้งสุดท้ายตามระเบียบ สอศ.)",
        description: "กรุณาเร่งสำเร็จคุณวุฒิครู / ป.บัณฑิต หรือสอบผ่านเกณฑ์คุรุสภาเพื่อขอ B-License ก่อนหนังสือผ่อนผันหมดอายุ",
      };
    } else if (kspLicense.status === "IN_RENEWAL") {
      licenseAlert = {
        type: "renewal",
        title: "ใบอนุญาตประกอบวิชาชีพอยู่ระหว่างดำเนินการต่ออายุ",
        description: "รอผลการพิจารณาอนุมัติจากคุรุสภา",
      };
    } else if (kspLicense.expiredDate) {
      const exp = new Date(kspLicense.expiredDate);
      const today = new Date();
      const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        licenseAlert = {
          type: "expired",
          title: "ใบอนุญาตประกอบวิชาชีพครู (คุรุสภา) ของคุณหมดอายุแล้ว",
          description: `หมดอายุเมื่อ ${Math.abs(diffDays)} วันที่แล้ว กรุณายื่นคำขอต่ออายุผ่านระบบ KSP Self-Service โดยด่วน`,
          daysLeft: diffDays,
        };
      } else if (diffDays <= 180) {
        licenseAlert = {
          type: "expiring",
          title: `ใบอนุญาตประกอบวิชาชีพครู (คุรุสภา) ใกล้หมดอายุ (เหลือ ${diffDays} วัน)`,
          description: "สามารถยื่นคำขอต่ออายุล่วงหน้าได้แล้วในระบบ KSP Self-Service (ยื่นล่วงหน้าได้ 180 วัน)",
          daysLeft: diffDays,
        };
      }
    }
  }

  const age = calculateAge(user?.birthDate);
  const roleTitle = user?.roleDefinition?.title || session?.user?.roleTitle || (isRoot ? "ผู้ดูแลระบบสูงสุด (ROOT)" : "บุคลากร (STAFF)");
  const roleColor = user?.roleDefinition?.color || (isRoot ? "rose" : "blue");

  const getBadgeStyle = (color?: string | null) => {
    if (isRoot || color === "rose") return "bg-rose-50 text-rose-700 border-rose-200";
    if (color === "purple") return "bg-purple-50 text-purple-700 border-purple-200";
    if (color === "emerald") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (color === "amber") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* 0. Khurusapha Teacher License Alert Banner */}
      {licenseAlert && (
        <div
          className={clsx(
            "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl border shadow-sm transition animate-in fade-in duration-300",
            licenseAlert.type === "expired"
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : licenseAlert.type === "expiring"
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : licenseAlert.type === "renewal"
              ? "bg-blue-50 border-blue-200 text-blue-900"
              : "bg-teal-50 border-teal-200 text-teal-900"
          )}
        >
          <div className="flex items-start gap-3.5 min-w-0">
            <div
              className={clsx(
                "flex h-10 w-10 items-center justify-center rounded-2xl flex-shrink-0 mt-0.5",
                licenseAlert.type === "expired"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-500/20"
                  : licenseAlert.type === "expiring"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                  : licenseAlert.type === "renewal"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-teal-600 text-white shadow-md shadow-teal-500/20"
              )}
            >
              {licenseAlert.type === "expired" || licenseAlert.type === "expiring" ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <Scroll className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-black leading-tight truncate">
                  {licenseAlert.title}
                </h4>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-white/80 border border-current/20">
                  คุรุสภา (KSP)
                </span>
              </div>
              <p className="text-xs opacity-90 mt-0.5">
                {licenseAlert.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
            {licenseAlert.type !== "missing" && (
              <a
                href="https://ksp-selfservice.ksp.or.th"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                <span>KSP Self-Service</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </a>
            )}

            <Link
              href="/profile"
              className={clsx(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition active:scale-95",
                licenseAlert.type === "expired"
                  ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
                  : licenseAlert.type === "expiring"
                  ? "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20"
                  : licenseAlert.type === "renewal"
                  ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                  : "bg-teal-600 hover:bg-teal-700 shadow-teal-500/20"
              )}
            >
              <span>{licenseAlert.type === "missing" ? "กรอกข้อมูลคุรุสภา" : "ตรวจสอบในโปรไฟล์"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 1. Header Profile Banner */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-slate-200 shadow-md shadow-blue-500/10 flex-shrink-0 bg-white"
              />
            ) : null}
            <div
              style={{ display: user?.avatarUrl ? "none" : "flex" }}
              className="h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-2xl shadow-lg shadow-blue-500/20 flex-shrink-0"
            >
              {user?.name ? user.name.charAt(0) : "U"}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black border ${getBadgeStyle(roleColor)}`}>
                  {isRoot && <Sparkles className="h-3 w-3" />}
                  {roleTitle}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  สถานะปกติ
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                {user?.name || session?.user?.name || "ผู้ใช้งาน"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                {user?.email || session?.user?.email} • {user?.position || "บุคลากรวิทยาลัย"}
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          {canManageUsers && (
            <Link
              href="/admin/users"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 active:scale-95 flex-shrink-0"
            >
              <Users className="h-4 w-4" />
              จัดการผู้ใช้และสิทธิ์
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* 2. Personnel Details Grid */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                ข้อมูลส่วนตัวและตำแหน่งงาน
              </h2>
              <p className="text-xs text-slate-400">
                Personnel Profile Information
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 transition hover:bg-slate-50">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              ตำแหน่งงาน
            </span>
            <p className="text-sm font-bold text-slate-900 truncate">
              {user?.position || "- ยังไม่ได้ระบุ -"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 transition hover:bg-slate-50">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              เบอร์โทรศัพท์
            </span>
            <p className="text-sm font-bold text-slate-900 truncate">
              {user?.phone ? (
                <a href={`tel:${user.phone}`} className="text-blue-600 hover:underline">
                  {user.phone}
                </a>
              ) : (
                "- ยังไม่ได้ระบุ -"
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 transition hover:bg-slate-50">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              วันเดือนปีเกิด
            </span>
            <p className="text-sm font-bold text-slate-900 truncate">
              {user?.birthDate
                ? new Date(user.birthDate).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "- ยังไม่ได้ระบุ -"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 transition hover:bg-slate-50">
            <span className="text-xs font-semibold text-slate-400 mb-1 block">
              อายุ (คำนวณอัตโนมัติ)
            </span>
            <p className="text-sm font-bold text-slate-900">
              {age !== null ? `${age} ปี` : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* 3. SAR Quality Metrics (มาตรฐานวิชาชีพครูและผู้บริหารสถานศึกษา) */}
      {canManageUsers && (
        <div className="rounded-3xl border border-teal-200/80 bg-gradient-to-br from-teal-50/60 via-emerald-50/30 to-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-500/20">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  มาตรฐานด้านคุณวุฒิและมาตรฐานวิชาชีพครู (SAR Metric)
                </h3>
                <p className="text-xs text-slate-500">
                  เกณฑ์การประเมินคุณภาพการศึกษา • สำนักงานคณะกรรมการการอาชีวศึกษา (สอศ.) &amp; คุรุสภา
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-teal-100 text-teal-800 self-start sm:self-auto">
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
              ตัวชี้วัดความพร้อม SAR
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Metric 1: Percentage */}
            <div className="p-5 rounded-2xl bg-white border border-teal-100 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-slate-500">
                ร้อยละครูที่มีใบอนุญาตถูกต้อง
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-teal-700">
                  {sarLicensePercentage}%
                </span>
                <span className="text-xs font-medium text-slate-400">
                  ({validLicenseCount}/{totalActiveTeachers} ท่าน)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${sarLicensePercentage}%` }}
                />
              </div>
            </div>

            {/* Metric 2: Valid Active */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ใบอนุญาตพร้อมใช้งาน (Active)
              </span>
              <p className="text-2xl font-black text-slate-900">
                {validLicenseCount} <span className="text-xs font-normal text-slate-400">คน</span>
              </p>
              <p className="text-[11px] text-emerald-600 font-medium">
                ผ่านเกณฑ์มาตรฐานวิชาชีพ
              </p>
            </div>

            {/* Metric 3: Expiring Soon */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                ใกล้หมดอายุ / ต้องต่ออายุ
              </span>
              <p className="text-2xl font-black text-amber-600">
                {expiringCount} <span className="text-xs font-normal text-slate-400">คน</span>
              </p>
              <p className="text-[11px] text-slate-400">
                หมดอายุภายใน 180 วัน
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. System Statistics Banner (For Admin/Root) */}
      {canManageUsers && (
        <div className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-8 text-white shadow-md shadow-blue-500/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-blue-200">
                <ShieldCheck className="h-4 w-4" />
                แผงควบคุมระบบ (System Control)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                จัดการบัญชีและยศ/สิทธิ์บุคลากร
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/90">
                มีผู้ใช้งานทั้งหมด <strong className="text-white underline">{userCount} บัญชี</strong> แบ่งเป็น <strong className="text-white underline">{roleCount} ยศ/สิทธิ์</strong>
              </p>
            </div>

            <Link
              href="/admin/users"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-md transition hover:bg-blue-50 active:scale-95 flex-shrink-0"
            >
              <Users className="h-4 w-4 text-blue-600" />
              จัดการผู้ใช้และยศ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
