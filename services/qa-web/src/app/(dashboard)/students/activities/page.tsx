"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  Users,
  CheckSquare,
  Trophy,
  Award,
  Plus,
  GraduationCap,
} from "lucide-react";
import { useAcademicYear } from "@/components/layout/AcademicYearContext";

export default function StudentSubPage() {
  const { termLabel } = useAcademicYear();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation with Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/students"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 text-xs font-bold transition shadow-2xs group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>← กลับหน้าภาพรวมงานนักเรียน</span>
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
          มาตรฐานที่ 1 ด้านจิตอาสาและกิจกรรมพัฒนาคุณภาพผู้เรียน (ชมรม/กิจกรรมองค์การวิชาชีพ)
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              กิจกรรมผู้เรียน & บันทึกหน้าเสาธง
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1 leading-relaxed">
              บันทึกการเข้าร่วมกิจกรรมเข้าแถวหน้าเสาธง กิจกรรมชมรมวิชาชีพ อวท. และกิจกรรมจิตอาสาบำเพ็ญประโยชน์เพื่อสังคม
            </p>
          </div>
          <button
            type="button"
            onClick={() => alert("ระบบฟอร์มบันทึกข้อมูลจะเชื่อมต่อกับฐานข้อมูลในเฟสถัดไป")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>+ บันทึกกิจกรรมใหม่</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">อัตราผ่านกิจกรรมหน้าเสาธง</div>
          <div className="text-2xl font-black text-slate-900 mt-1">95.1%</div>
          <div className="text-xs font-semibold text-emerald-600 mt-1">เกณฑ์ขั้นต่ำ 85% ของภาคเรียน</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">นักเรียนสังกัดชมรมวิชาชีพ</div>
          <div className="text-2xl font-black text-slate-900 mt-1">100%</div>
          <div className="text-xs font-semibold text-blue-600 mt-1">ครอบคลุมทุกสาขาวิชา</div>
        </div>
      </div>

      {/* Data Table Preview */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-800">
            รายการบันทึกข้อมูลประจำ {termLabel}
          </div>
          <span className="text-xs text-slate-400 font-semibold">แสดงรายการตัวอย่าง</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 text-left font-bold text-slate-500">ชื่อกิจกรรม / ชมรม</th><th className="py-3 px-4 text-left font-bold text-slate-500">ประเภทกิจกรรม</th><th className="py-3 px-4 text-left font-bold text-slate-500">ผู้เข้าร่วม (คน)</th><th className="py-3 px-4 text-left font-bold text-slate-500">สถานะการประเมิน</th><th className="py-3 px-4 text-left font-bold text-slate-500">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              
                <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 text-xs font-bold text-slate-800">กิจกรรมเข้าแถวเคารพธงชาติและอบรมคุณธรรม</td>
                  <td className="py-3 px-4 text-xs text-slate-600">กิจกรรมบังคับ (หน้าเสาธง)</td>
                  <td className="py-3 px-4 text-xs text-slate-600">1,248 คน</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      บันทึกสะสมต่อเนื่อง
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800">
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 text-xs font-bold text-slate-800">ชมรมวิชาชีพช่างเทคนิคคอมพิวเตอร์ (อวท.)</td>
                  <td className="py-3 px-4 text-xs text-slate-600">ชมรมวิชาชีพ</td>
                  <td className="py-3 px-4 text-xs text-slate-600">280 คน</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ผ่านการประเมิน
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800">
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 text-xs font-bold text-slate-800">จิตอาสาบริการตรวจซ่อมคอมพิวเตอร์ชุมชน</td>
                  <td className="py-3 px-4 text-xs text-slate-600">บริการวิชาชีพเพื่อสังคม</td>
                  <td className="py-3 px-4 text-xs text-slate-600">65 คน</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      เสร็จสิ้นโครงการ
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800">
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
