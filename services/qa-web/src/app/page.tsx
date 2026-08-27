"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ShieldCheck,
  Database,
  HardDrive,
  RefreshCw,
  ArrowRight,
  LogIn,
  LayoutDashboard,
  Users,
} from "lucide-react";
import Link from "next/link";

interface ServiceHealth {
  status: "connected" | "error" | "disconnected";
  url?: string;
  endpoint?: string;
  error?: string | null;
}

interface HealthResponse {
  status: string;
  timestamp: string;
  services: {
    database: ServiceHealth;
    storage: ServiceHealth;
  };
}

export default function HomePage() {
  const { data: session } = useSession();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const isDbConnected = health?.services?.database?.status === "connected";
  const isStorageConnected = health?.services?.storage?.status === "connected";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 p-6 md:p-12 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full space-y-8 my-auto">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/25">
            <ShieldCheck className="h-9 w-9" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            ระบบประกันคุณภาพการศึกษา (TechSAR)
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
            ระบบเข้าใช้งานและบริหารจัดการข้อมูลบุคลากร วิทยาลัยเทคนิค
          </p>
        </div>

        {/* Live Service Status Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-9 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">สถานะการเชื่อมต่อระบบจริง (Live Server)</h2>
              <p className="text-xs text-slate-500">Proxmox CT 102 (Tailscale 100.125.250.85)</p>
            </div>
            <button
              onClick={checkHealth}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
              ตรวจสอบใหม่
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {/* Database Card */}
            <div
              className={`rounded-2xl border p-5 transition ${
                isDbConnected
                  ? "border-emerald-200 bg-emerald-50/40"
                  : "border-rose-200 bg-rose-50/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-xl ${
                      isDbConnected ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">PostgreSQL 16</h3>
                    <span className="text-[11px] text-slate-500">พอร์ต 5432</span>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    isDbConnected
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {isDbConnected ? "เชื่อมต่อแล้ว" : "ขาดการเชื่อมต่อ"}
                </span>
              </div>
            </div>

            {/* MinIO Card */}
            <div
              className={`rounded-2xl border p-5 transition ${
                isStorageConnected
                  ? "border-emerald-200 bg-emerald-50/40"
                  : "border-rose-200 bg-rose-50/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-xl ${
                      isStorageConnected ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    <HardDrive className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">MinIO S3 Storage</h3>
                    <span className="text-[11px] text-slate-500">พอร์ต 9000</span>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    isStorageConnected
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {isStorageConnected ? "เชื่อมต่อแล้ว" : "ขาดการเชื่อมต่อ"}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              {session?.user ? (
                <span>
                  เข้าสู่ระบบแล้ว: <b className="text-slate-800">{session.user.name}</b> ({session.user.role})
                </span>
              ) : (
                <span>พร้อมเข้าสู่ระบบงาน</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {session?.user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    ไปยังหน้า Dashboard
                  </Link>

                  {session.user.role === "ROOT" && (
                    <Link
                      href="/admin/users"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50 active:scale-95"
                    >
                      <Users className="h-4 w-4 text-blue-600" />
                      จัดการผู้ใช้งาน
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 active:scale-95"
                >
                  <LogIn className="h-4 w-4" />
                  เข้าสู่ระบบ
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-slate-400 mt-8">
        © 2026 Technical College Department QA System (TechSAR).
      </footer>
    </div>
  );
}
