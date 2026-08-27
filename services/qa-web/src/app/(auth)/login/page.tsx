"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, AlertCircle, ArrowRight, Loader2, KeyRound } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password: password,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      setLoading(false);
    }
  };

  const setDemoAccount = (demEmail: string, demPass: string) => {
    setEmail(demEmail);
    setPassword(demPass);
    setError(null);
  };

  return (
    <div className="w-full max-w-md">
      {/* Header Card */}
      <div className="mb-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
          TechSAR Portal
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          ระบบรายงานการประเมินตนเองและประกันคุณภาพการศึกษา
        </p>
      </div>

      {/* Main Login Form Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">ลงชื่อเข้าใช้งาน</h2>
          <p className="text-xs text-slate-500">
            กรุณาระบุบัญชีผู้ใช้ที่ได้รับการลงทะเบียนจากผู้ดูแลระบบ
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              อีเมลผู้ใช้งาน (Email)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="เช่น admin@technic.ac.th"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังตรวจสอบสิทธิ์...
              </>
            ) : (
              <>
                เข้าสู่ระบบ
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Accounts Selector */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-3">
            <KeyRound className="h-3.5 w-3.5 text-blue-600" />
            <span>เลือกบัญชีทดสอบระบบ (Demo Accounts):</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDemoAccount("admin@technic.ac.th", "admin1234")}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left transition hover:border-blue-300 hover:bg-blue-50/50"
            >
              <div className="font-semibold text-slate-800 text-[11px]">Super Admin</div>
              <div className="text-[10px] text-slate-500">admin@technic.ac.th</div>
            </button>

            <button
              type="button"
              onClick={() => setDemoAccount("qa.head@technic.ac.th", "qa1234")}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left transition hover:border-blue-300 hover:bg-blue-50/50"
            >
              <div className="font-semibold text-slate-800 text-[11px]">หัวหน้างานประกัน</div>
              <div className="text-[10px] text-slate-500">qa.head@technic.ac.th</div>
            </button>

            <button
              type="button"
              onClick={() => setDemoAccount("head.com@technic.ac.th", "head1234")}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left transition hover:border-blue-300 hover:bg-blue-50/50"
            >
              <div className="font-semibold text-slate-800 text-[11px]">หัวหน้าแผนกคอมฯ</div>
              <div className="text-[10px] text-slate-500">head.com@technic.ac.th</div>
            </button>

            <button
              type="button"
              onClick={() => setDemoAccount("teacher.com@technic.ac.th", "teacher1234")}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left transition hover:border-blue-300 hover:bg-blue-50/50"
            >
              <div className="font-semibold text-slate-800 text-[11px]">ครูผู้รับผิดชอบ</div>
              <div className="text-[10px] text-slate-500">teacher.com@technic.ac.th</div>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition">
          ← กลับหน้าสถานะระบบ (Status Dashboard)
        </Link>
      </div>
    </div>
  );
}
