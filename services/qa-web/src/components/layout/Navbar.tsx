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
} from "lucide-react";
import Link from "next/link";
import { useSidebar } from "./SidebarContext";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { toggleMobile } = useSidebar();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
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
    if (pathname === "/dashboard") return "ภาพรวมและข้อมูลส่วนตัว";
    if (pathname.startsWith("/admin/users")) return "จัดการบัญชีผู้ใช้งาน";
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

        {/* Page Title (No redundant logo text) */}
        <div className="text-sm font-bold text-slate-800">
          {getPageTitle()}
        </div>
      </div>

      {/* Right side: Profile Avatar with Dropdown Menu */}
      <div className="flex items-center gap-4">
        {session?.user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95"
            >
              {/* Avatar Image or Initial */}
              {session.user.avatarUrl ? (
                <img
                  src={session.user.avatarUrl}
                  alt={session.user.name || "Avatar"}
                  className="h-9 w-9 rounded-xl object-cover border border-slate-200"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm shadow-xs">
                  {userInitial}
                </div>
              )}

              <div className="hidden md:block text-left pr-1">
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

            {/* Dropdown Menu */}
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
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    โปรไฟล์ของฉัน (Profile)
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      alert("ระบบตั้งค่า (Setting) จะเปิดให้ใช้งานในเฟสถัดไป");
                    }}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition text-left"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    ตั้งค่าระบบ (Setting)
                  </button>
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
