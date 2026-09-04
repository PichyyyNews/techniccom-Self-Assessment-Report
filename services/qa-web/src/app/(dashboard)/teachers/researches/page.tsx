"use client";

import React from "react";
import Link from "next/link";
import { LiveEvidenceSection } from "@/components/evidence/LiveEvidenceSection";
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  BookOpen,
  Award,
  Lightbulb,
  CheckCircle2,
  Plus,
  FileText,
  Clock,
} from "lucide-react";
import { useAcademicYear } from "@/components/layout/AcademicYearContext";

export default function Page() {
  const { termLabel } = useAcademicYear();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation with Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 text-xs font-bold transition shadow-2xs group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>← กลับหน้าหลัก (ภาพรวมงานครู)</span>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-xs text-blue-800 font-bold">
          <Calendar className="h-3.5 w-3.5 text-blue-600" />
          <span>รอบข้อมูล: {termLabel}</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          มาตรฐานที่ 3 การสร้างสังคมแห่งการเรียนรู้ (ด้านนวัตกรรม สิ่งประดิษฐ์ และงานวิจัย)
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              งานวิจัย นวัตกรรม & สิ่งประดิษฐ์
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1 leading-relaxed">
              ฐานข้อมูลงานวิจัยในชั้นเรียน นวัตกรรมการเรียนรู้ และสิ่งประดิษฐ์ของคนรุ่นใหม่ร่วมกับนักศึกษา เพื่อยกระดับคุณภาพการจัดการศึกษา
            </p>
          </div>
          <Link href="/quick-upload" className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 transition active:scale-95"><Plus className="h-4 w-4" /><span>+ เพิ่มงานวิจัย / สิ่งประดิษฐ์</span></Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">งานวิจัยในชั้นเรียน</div>
          <div className="text-2xl font-black text-slate-900 mt-1">3 ผลงาน</div>
          <div className="text-xs font-semibold text-emerald-600 mt-1">เสร็จสิ้นตามปีการศึกษา</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">การประกวดสิ่งประดิษฐ์</div>
          <div className="text-2xl font-black text-slate-900 mt-1">1 รางวัล</div>
          <div className="text-xs font-semibold text-blue-600 mt-1">ระดับภาค / ระดับชาติ</div>
        </div>
      </div>

      {/* Live Uploaded Evidence Files */}
      <LiveEvidenceSection category="research" sectionTitle="เอกสารงานวิจัยและสิ่งประดิษฐ์ที่อัปโหลด (Live Research & Inventions)" emptyNotice="ยังไม่มีเอกสารงานวิจัยหรือสิ่งประดิษฐ์ในรอบปีการศึกษานี้" />
    </div>
  );
}
