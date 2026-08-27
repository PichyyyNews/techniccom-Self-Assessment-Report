"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, AlertCircle, ArrowRight, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
            <Shield className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          ระบบประกันคุณภาพการศึกษา (TechSAR)
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          ระดับแผนกวิชา วิทยาลัยเทคนิค (สำนักงานคณะกรรมการการอาชีวศึกษา)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 shadow-2xl border border-slate-800 rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 flex items-start gap-3 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                อีเมล (Email)
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@technic.ac.th"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "กำลังตรวจสอบข้อมูล..." : "เข้าสู่ระบบ (Sign In)"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Test Accounts Quick Select */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>บัญชีทดสอบในระบบ (Demo Accounts)</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@technic.ac.th", "admin1234")}
                className="p-2.5 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors text-slate-300 cursor-pointer"
              >
                <div className="font-semibold text-white">Super Admin</div>
                <div className="text-[11px] text-slate-500">admin@technic.ac.th</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("head.com@technic.ac.th", "head1234")}
                className="p-2.5 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors text-slate-300 cursor-pointer"
              >
                <div className="font-semibold text-blue-400">หัวหน้าแผนกคอมฯ</div>
                <div className="text-[11px] text-slate-500">head.com@technic.ac.th</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("teacher.com@technic.ac.th", "teacher1234")}
                className="p-2.5 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors text-slate-300 cursor-pointer"
              >
                <div className="font-semibold text-emerald-400">ครูผู้รับผิดชอบ</div>
                <div className="text-[11px] text-slate-500">teacher.com@technic.ac.th</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("auditor@technic.ac.th", "auditor1234")}
                className="p-2.5 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors text-slate-300 cursor-pointer"
              >
                <div className="font-semibold text-amber-400">กรรมการประเมิน</div>
                <div className="text-[11px] text-slate-500">auditor@technic.ac.th</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
