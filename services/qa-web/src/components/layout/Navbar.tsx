"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  Menu,
  Calendar,
  Check,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSidebar } from "./SidebarContext";
import { useAcademicYear } from "./AcademicYearContext";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { toggleMobile } = useSidebar();
  const {
    selectedYear,
    setSelectedYear,
    selectedSemester,
    setSelectedSemester,
    availableYears,
    availableSemesters,
    shortTermLabel,
  } = useAcademicYear();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [termDropdownOpen, setTermDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const termDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (termDropdownRef.current && !termDropdownRef.current.contains(event.target as Node)) {
        setTermDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isRoot = session?.user?.role === "ROOT";
  const userInitial = session?.user?.name ? session.user.name.charAt(0) : "U";

  // Dynamic Page Title
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "ภาพรวมงานครูและบุคลากร";
    if (pathname === "/dashboard/students") return "ภาพรวมงานนักเรียนและนักศึกษา";
    if (pathname === "/profile") return "โปรไฟล์และประวัติการทำงาน";
    if (pathname === "/teachers/lesson-plans") return "แผนการจัดการเรียนรู้ & บันทึกหลังสอน";
    if (pathname === "/teachers/trainings") return "การพัฒนาวิชาชีพ & อบรมสัมมนา";
    if (pathname === "/teachers/researches") return "งานวิจัย นวัตกรรม & สิ่งประดิษฐ์";
    if (pathname === "/students") return "ทะเบียนข้อมูลนักเรียน/นักศึกษา";
    if (pathname === "/students/attendance") return "บันทึกการเข้าเรียน & พฤติกรรม";
    if (pathname === "/students/competencies") return "ผลสัมฤทธิ์ & สมรรถนะวิชาชีพ";
    if (pathname === "/students/activities") return "กิจกรรมผู้เรียน & หน้าเสาธง";
    if (pathname.startsWith("/admin/system")) return "ตั้งค่าระบบและมอนิเตอร์เซิร์ฟเวอร์";
    if (pathname.startsWith("/admin/users")) return "จัดการบัญชีผู้ใช้งานและสิทธิ์";
    if (pathname.startsWith("/admin/licenses")) return "ตั้งค่าประเภทใบอนุญาต & มาตรฐานวิชาชีพ";
    return "ระบบงานประกันคุณภาพ";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-8 backdrop-blur transition-all">
      {/* Left side: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Toggle Button */}
        <button
          type="button"
          onClick={toggleMobile}
          className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition active:scale-95"
          aria-label="Toggle Navigation Drawer"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page Title */}
        <div className="text-sm font-bold text-slate-800 line-clamp-1">
          {getPageTitle()}
        </div>
      </div>

      {/* Right side: Academic Term Selector + Profile Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* 1. Global Academic Year / Term Selector */}
        <div className="relative" ref={termDropdownRef}>
          <button
            type="button"
            onClick={() => setTermDropdownOpen(!termDropdownOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-800 text-xs font-bold transition shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95"
            title="คลิกเพื่อสลับปีการศึกษาหรือภาคเรียน (มีผลทั่วทั้งระบบ)"
          >
            <Calendar className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
            <span className="hidden sm:inline font-bold">ปีการศึกษา {selectedYear}</span>
            <span className="sm:hidden font-bold">{selectedYear}</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-600 text-[10px] text-white font-black leading-none">
              {availableSemesters.find((s) => s.value === selectedSemester)?.shortLabel || "เทอม 1"}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-blue-600 transition-transform duration-200 ${
                termDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Term Popover Dropdown */}
          {termDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/80 animate-in fade-in zoom-in-95 duration-100 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">รอบปีการศึกษาและเทอม</h4>
                    <p className="text-[10px] text-slate-400">คัดกรองข้อมูลตามเกณฑ์ประเมิน SAR</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  กำลังใช้งาน
                </span>
              </div>

              {/* 1. Year Selector */}
              <div className="mb-3">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  1. เลือกปีการศึกษา (Academic Year)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {availableYears.map((year) => {
                    const isSelected = selectedYear === year;
                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => setSelectedYear(year)}
                        className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                        {year}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Semester Selector */}
              <div className="mb-3">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  2. เลือกภาคเรียน (Semester)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {availableSemesters.map((sem) => {
                    const isSelected = selectedSemester === sem.value;
                    return (
                      <button
                        key={sem.value}
                        type="button"
                        onClick={() => setSelectedSemester(sem.value)}
                        className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition text-center ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                        {sem.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary Indicator */}
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  <span>เลือกไว้: <strong className="text-slate-900">{shortTermLabel}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setTermDropdownOpen(false)}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition shadow-2xs"
                >
                  ตกลง
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. User Profile Dropdown */}
        {session?.user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 sm:p-1.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95"
            >
              {/* Avatar Image or Initial */}
              {session.user.avatarUrl ? (
                <img
                  src={session.user.avatarUrl}
                  alt={session.user.name || "Avatar"}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    if (target.nextElementSibling) {
                      (target.nextElementSibling as HTMLElement).style.display = "flex";
                    }
                  }}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-cover border border-slate-200"
                />
              ) : null}
              <div
                style={{ display: session.user.avatarUrl ? "none" : "flex" }}
                className="h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm shadow-xs"
              >
                {userInitial}
              </div>

              <div className="hidden lg:block text-left pr-1">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {session.user.name}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {session.user.roleTitle || (isRoot ? "ROOT" : "บุคลากร")}
                </div>
              </div>

              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* User Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-200/80 animate-in fade-in zoom-in-95 duration-100 z-50">
                {/* Header in Dropdown */}
                <div className="p-3 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {session.user.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {session.user.email}
                  </p>
                  <div className="mt-2">
                    {isRoot ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                        <Shield className="h-3 w-3" />
                        ผู้ดูแลระบบสูงสุด (ROOT)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        บุคลากร (STAFF)
                      </span>
                    )}
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-0.5">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    โปรไฟล์ของฉัน (Profile)
                  </Link>
                </div>

                {/* Divider & Logout */}
                <div className="pt-1 mt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition text-left"
                  >
                    <LogOut className="h-4 w-4 text-rose-500" />
                    ออกจากระบบ (Logout)
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <User className="h-3.5 w-3.5" />
            เข้าสู่ระบบ
          </Link>
        )}
      </div>
    </header>
  );
}
