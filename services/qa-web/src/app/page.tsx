"use client";

import { useEffect, useState } from "react";
import { Database, HardDrive, RefreshCw, CheckCircle2, XCircle, Shield, Server } from "lucide-react";

interface HealthData {
  services?: {
    database: { status: string; error?: string };
    storage: { status: string; error?: string };
  };
}

export default function HomePage() {
  const [health, setHealth] = useState<HealthData | null>(null);
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
  const isS3Connected = health?.services?.storage?.status === "connected";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            TechSAR QA System
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            ระบบประกันคุณภาพการศึกษาของแผนกวิชาในวิทยาลัยเทคนิค
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-slate-400" />
              <h2 className="text-base font-semibold text-white">
                สถานะการเชื่อมต่อ Service
              </h2>
            </div>
            <button
              onClick={checkHealth}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              ตรวจสอบใหม่
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PostgreSQL Status */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span>PostgreSQL 16</span>
                </div>
                {loading ? (
                  <span className="text-xs text-slate-500">ตรวจสอบ...</span>
                ) : isDbConnected ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> เชื่อมต่อแล้ว
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-medium">
                    <XCircle className="w-3.5 h-3.5" /> ยังไม่เชื่อมต่อ
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                พอร์ต 5432 (Proxmox CT 102)
              </p>
            </div>

            {/* MinIO S3 Status */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  <HardDrive className="w-4 h-4 text-purple-400" />
                  <span>MinIO S3 Storage</span>
                </div>
                {loading ? (
                  <span className="text-xs text-slate-500">ตรวจสอบ...</span>
                ) : isS3Connected ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> เชื่อมต่อแล้ว
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-medium">
                    <XCircle className="w-3.5 h-3.5" /> ยังไม่เชื่อมต่อ
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                พอร์ต 9000 (Bucket: qa-evidences)
              </p>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800/50 text-xs text-slate-400 space-y-2">
            <div className="font-semibold text-slate-300">💡 ขั้นตอนการเชื่อมต่อ:</div>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>เปิด SSH บน Proxmox Host แล้วรัน: <code className="text-blue-400 font-mono">bash scripts/setup-proxmox-ct102-db.sh</code></li>
              <li>เปิด Tailscale Subnet: <code className="text-blue-400 font-mono">tailscale set --advertise-routes=10.10.10.0/24</code></li>
              <li>เมื่อเชื่อมต่อสำเร็จ สถานะด้านบนจะเปลี่ยนเป็นสีเขียวทันที</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600">
          Next.js 15 • App Router • Prisma ORM • Tailwind CSS
        </p>
      </div>
    </div>
  );
}
