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
} from "lucide-react";
import Link from "next/link";

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

  // Fetch full user details from DB
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
      })
    : null;

  const isRoot = session?.user?.role === "ROOT";
  const userCount = isRoot ? await prisma.user.count() : 0;
  const age = calculateAge(user?.birthDate);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-9 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-slate-200 shadow-md shadow-blue-500/10 flex-shrink-0 bg-white"
              />
            ) : (
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-2xl shadow-lg shadow-blue-500/20 flex-shrink-0">
                {user?.name ? user.name.charAt(0) : "U"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold ${
                    isRoot
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  {isRoot ? "ผู้ดูแลระบบสูงสุด (ROOT)" : "บุคลากร (STAFF)"}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  สถานะปกติ
                </span>
              </div>

              <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {user?.name || session?.user?.name || "ผู้ใช้งาน"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {user?.email || session?.user?.email}
              </p>
            </div>
          </div>

          {/* Quick Action for ROOT */}
          {isRoot && (
            <Link
              href="/admin/users"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 active:scale-95 flex-shrink-0"
            >
              <Users className="h-4 w-4" />
              ไปยังหน้าจัดการผู้ใช้งาน
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* User Information Details Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-9 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-100 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          ข้อมูลส่วนตัวและตำแหน่งงาน (Personnel Profile)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              ตำแหน่ง
            </span>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {user?.position || "- ยังไม่ได้ระบุ -"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              เบอร์โทรศัพท์
            </span>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {user?.phone || "- ยังไม่ได้ระบุ -"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              วันเดือนปีเกิด
            </span>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {user?.birthDate
                ? new Date(user.birthDate).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "- ยังไม่ได้ระบุ -"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4">
            <span className="text-xs font-medium text-slate-400">อายุ</span>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {age !== null ? `${age} ปี` : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Root Admin Statistics Card (Only visible to ROOT) */}
      {isRoot && (
        <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-white to-blue-50/40 p-7 sm:p-9 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-700">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                แผงควบคุมระบบ (Root Control)
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                จัดการบัญชีและกำหนดสิทธิ์บุคลากรในระบบ
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ปัจจุบันมีผู้ใช้งานในฐานข้อมูลทั้งหมด {userCount} บัญชี (คุณสามารถสร้างและแก้ไขสิทธิ์ได้)
              </p>
            </div>

            <Link
              href="/admin/users"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-md transition hover:bg-slate-800 active:scale-95 flex-shrink-0"
            >
              <Users className="h-4 w-4 text-amber-400" />
              จัดการผู้ใช้งานทั้งหมด
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
