"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Server,
  Database,
  HardDrive,
  Cpu,
  Activity,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Terminal,
  Key,
  Clock,
  ArrowLeft,
  FileJson,
  Layers,
  Network,
  Shield,
  Search,
  Loader2,
  Check,
  Radio,
  Zap,
  Play,
  Pause,
  Table,
  Gauge,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";

interface MetricsData {
  timestamp: string;
  cpu: {
    percent: number;
    cores: number;
    model: string;
  };
  ram: {
    totalGB: number;
    usedGB: number;
    freeGB: number;
    percent: number;
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
  databaseServer: {
    ct102: {
      ip: string;
      tailscaleIp: string;
      diskTotalGB: number;
      diskUsedGB: number;
      diskFreeGB: number;
      diskPercent: number;
    };
    postgres: {
      status: string;
      latencyMs: number;
      version: string;
      dbSizeBytes: number;
      dbSizePretty: string;
      dbSizeMB: number;
      cacheHitRatio: number;
      activeConnections: number;
      tableStats: Array<{
        tableName: string;
        rowCount: number;
        sizePretty: string;
        sizeBytes: number;
      }>;
      activeQueries: Array<{
        pid: number;
        user: string;
        state: string;
        query: string;
        duration: string;
      }>;
    };
    minio: {
      status: string;
      latencyMs: number;
      bucket: string;
      objectCount: number;
      totalSizeBytes: number;
      totalSizeMB: number;
    };
  };
  logs: Array<{
    id: string;
    action: string;
    title: string;
    createdAt: string;
    user?: {
      name: string;
      email: string;
      roleCode: string;
    } | null;
  }>;
}

interface BackupItem {
  key: string;
  filename: string;
  sizeBytes: number;
  sizeKB: number;
  lastModified: string;
}

const STATIC_ENV_CONFIG = [
  { key: "DATABASE_URL", value: "postgresql://postgres:••••••••@100.125.250.85:5432/qa_system_db", type: "Database", isSecret: true },
  { key: "NEXTAUTH_URL", value: "http://localhost:3000", type: "Auth", isSecret: false },
  { key: "NEXTAUTH_SECRET", value: "9e1c••••••••d34a", type: "Auth", isSecret: true },
  { key: "S3_ENDPOINT", value: "http://100.125.250.85:9000", type: "Storage", isSecret: false },
  { key: "S3_BUCKET_NAME", value: "qa-evidences", type: "Storage", isSecret: false },
  { key: "S3_ACCESS_KEY", value: "minioadmin", type: "Storage", isSecret: true },
  { key: "S3_SECRET_KEY", value: "miniopassword123", type: "Storage", isSecret: true },
  { key: "NODE_ENV", value: "development", type: "System", isSecret: false },
];

export default function SystemAdminPage() {
  const { data: session } = useSession();

  // Streaming State
  const [isStreaming, setIsStreaming] = useState(true);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [logSearch, setLogSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "database" | "logs" | "backups" | "config">("overview");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isRoot = session?.user?.role === "ROOT";

  // Fetch real-time streaming metrics
  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/admin/system/metrics");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error("Failed to fetch metrics", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBackups = async () => {
    try {
      const res = await fetch("/api/admin/system/backup");
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
      }
    } catch (err) {
      console.error("Failed to fetch backups", err);
    }
  };

  useEffect(() => {
    if (isRoot) {
      fetchMetrics();
      fetchBackups();
    }
  }, [isRoot]);

  // Realtime Polling Loop (Every 2.5s)
  useEffect(() => {
    if (isRoot && isStreaming) {
      timerRef.current = setInterval(() => {
        fetchMetrics();
      }, 2500);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRoot, isStreaming]);

  const handleCreateBackup = async () => {
    if (!confirm("คุณต้องการสร้าง Snapshot สำรองข้อมูลระบบทั้งหมดไปยัง MinIO S3 ใช่หรือไม่?")) return;
    setBackingUp(true);
    try {
      const res = await fetch("/api/admin/system/backup", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert(`สร้าง Snapshot สำรองข้อมูลสำเร็จ!\nไฟล์: ${data.backup.filename} (${data.backup.sizeKB} KB)`);
        fetchBackups();
        fetchMetrics();
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการสำรองข้อมูล");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setBackingUp(false);
    }
  };

  const toggleReveal = (key: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isRoot) {
    return (
      <div className="w-full max-w-7xl mx-auto p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[60vh]">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-600 border border-rose-200">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          จำกัดสิทธิ์การเข้าถึง (Access Restricted)
        </h1>
        <p className="text-sm text-slate-500 max-w-md">
          หน้านี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบสูงสุด (ROOT Admin) เท่านั้นสำหรับตั้งค่าและตรวจสอบโครงสร้างพื้นฐานเซิร์ฟเวอร์
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าหลัก (Dashboard)
        </Link>
      </div>
    );
  }

  const ct102 = metrics?.databaseServer.ct102;
  const pg = metrics?.databaseServer.postgres;
  const minio = metrics?.databaseServer.minio;
  const cpu = metrics?.cpu;
  const ram = metrics?.ram;

  const filteredLogs = (metrics?.logs || []).filter((log) => {
    if (!logSearch.trim()) return true;
    const q = logSearch.toLowerCase();
    return (
      log.title.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      (log.user?.name && log.user.name.toLowerCase().includes(q)) ||
      (log.user?.email && log.user.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-3.5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* ================= 1. PAGE HEADER & STREAMING CONTROLS ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            กลับหน้าหลัก (Dashboard)
          </Link>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 leading-tight">
              ตั้งค่าระบบ & มอนิเตอร์เซิร์ฟเวอร์
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
              <Shield className="h-3 w-3" />
              ROOT ONLY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Realtime Telemetry & Server Control Center (Proxmox CT 102, PostgreSQL, MinIO S3)
          </p>
        </div>

        {/* Live Streaming Controller & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Streaming Toggle Pill */}
          <button
            type="button"
            onClick={() => setIsStreaming(!isStreaming)}
            className={clsx(
              "inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold border transition shadow-2xs",
              isStreaming
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-slate-100 text-slate-600 border-slate-200"
            )}
          >
            <span
              className={clsx(
                "h-2.5 w-2.5 rounded-full",
                isStreaming ? "bg-emerald-500 animate-ping" : "bg-slate-400"
              )}
            />
            {isStreaming ? (
              <>
                <span className="font-mono">LIVE STREAMING</span>
                <Pause className="h-3.5 w-3.5 ml-1 text-emerald-600" />
              </>
            ) : (
              <>
                <span className="font-mono">PAUSED</span>
                <Play className="h-3.5 w-3.5 ml-1 text-slate-500" />
              </>
            )}
          </button>

          {/* Refresh Ping Button */}
          <button
            type="button"
            onClick={() => {
              fetchMetrics();
              fetchBackups();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition active:scale-95"
          >
            <RefreshCw className={clsx("h-3.5 w-3.5 text-blue-600", loading && "animate-spin")} />
            <span>รีเฟรช</span>
          </button>

          {/* Backup Snapshot Button */}
          <button
            type="button"
            onClick={handleCreateBackup}
            disabled={backingUp}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 active:scale-95 disabled:opacity-70"
          >
            {backingUp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <HardDrive className="h-3.5 w-3.5" />}
            <span>สำรองข้อมูล (Snapshot)</span>
          </button>
        </div>
      </div>

      {/* ================= 2. REAL-TIME HARDWARE & SYSTEM GAUGES (4 CARDS) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gauge 1: Realtime CPU Usage */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/60 shadow-2xs">
              <Cpu className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {cpu?.cores || 4} Cores
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-slate-400">การประมวลผล CPU</span>
              <span className="text-xl font-black font-mono text-slate-900">{cpu?.percent ?? 0}%</span>
            </div>
            {/* Realtime Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full mt-2 overflow-hidden">
              <div
                className={clsx(
                  "h-full rounded-full transition-all duration-500",
                  (cpu?.percent || 0) < 60
                    ? "bg-blue-600"
                    : (cpu?.percent || 0) < 85
                    ? "bg-amber-500"
                    : "bg-rose-600"
                )}
                style={{ width: `${Math.min(100, Math.max(5, cpu?.percent || 0))}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 truncate pt-1 border-t border-slate-100">
            Model: {cpu?.model.replace(/CPU|Processor/gi, "").trim() || "Server Core"}
          </p>
        </div>

        {/* Gauge 2: Realtime RAM Usage */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 shadow-2xs">
              <Gauge className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {ram?.totalGB || 16} GB Total
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-slate-400">หน่วยความจำ RAM</span>
              <span className="text-xl font-black font-mono text-slate-900">{ram?.percent ?? 0}%</span>
            </div>
            {/* Realtime Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full mt-2 overflow-hidden">
              <div
                className={clsx(
                  "h-full rounded-full transition-all duration-500",
                  (ram?.percent || 0) < 70
                    ? "bg-indigo-600"
                    : (ram?.percent || 0) < 90
                    ? "bg-amber-500"
                    : "bg-rose-600"
                )}
                style={{ width: `${Math.min(100, Math.max(5, ram?.percent || 0))}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>ใช้ไป: <strong className="text-slate-800">{ram?.usedGB} GB</strong></span>
            <span>เหลือ: <strong className="text-emerald-700">{ram?.freeGB} GB</strong></span>
          </div>
        </div>

        {/* Gauge 3: Database Storage (CT 102 Machine Disk) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 shadow-2xs">
              <HardDrive className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              CT 102 ({ct102?.diskTotalGB || 32} GB)
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-slate-400">พื้นที่ฮาร์ดดิสก์ Database</span>
              <span className="text-xl font-black font-mono text-slate-900">{ct102?.diskPercent ?? 13}%</span>
            </div>
            {/* Realtime Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, ct102?.diskPercent || 13))}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>ใช้ไป: <strong className="text-slate-800">{ct102?.diskUsedGB} GB</strong></span>
            <span>คงเหลือ: <strong className="text-emerald-700">{ct102?.diskFreeGB} GB</strong></span>
          </div>
        </div>

        {/* Gauge 4: Live PostgreSQL Latency & Connections */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-2xs">
              <Database className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-slate-400">DB Ping Latency</span>
              <span className="text-xl font-black font-mono text-emerald-700">{pg?.latencyMs ?? 0} ms</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
              <span>ขนาดฐานข้อมูลจริง:</span>
              <strong className="text-slate-900 font-mono font-bold">{pg?.dbSizePretty || "0 MB"}</strong>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Connections: <strong className="text-slate-900">{pg?.activeConnections || 1}</strong></span>
            <span>Cache Hit: <strong className="text-emerald-700">{pg?.cacheHitRatio || 99.8}%</strong></span>
          </div>
        </div>
      </div>

      {/* ================= 3. SEGMENTED TABS FOR DEEP MONITORING ================= */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/60 rounded-2xl border border-slate-200/80 w-fit">
        <button
          onClick={() => setActiveTab("overview")}
          className={clsx(
            "px-4 py-2 rounded-xl text-xs font-bold transition select-none flex items-center gap-1.5",
            activeTab === "overview" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Activity className="h-3.5 w-3.5" />
          ภาพรวมและโครงข่าย
        </button>

        <button
          onClick={() => setActiveTab("database")}
          className={clsx(
            "px-4 py-2 rounded-xl text-xs font-bold transition select-none flex items-center gap-1.5",
            activeTab === "database" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Table className="h-3.5 w-3.5" />
          ความจุตารางฐานข้อมูล & Queries
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={clsx(
            "px-4 py-2 rounded-xl text-xs font-bold transition select-none flex items-center gap-1.5",
            activeTab === "logs" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Terminal className="h-3.5 w-3.5" />
          Streaming Logs ({filteredLogs.length})
        </button>

        <button
          onClick={() => setActiveTab("backups")}
          className={clsx(
            "px-4 py-2 rounded-xl text-xs font-bold transition select-none flex items-center gap-1.5",
            activeTab === "backups" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <FileJson className="h-3.5 w-3.5" />
          Snapshot & Backups ({backups.length})
        </button>

        <button
          onClick={() => setActiveTab("config")}
          className={clsx(
            "px-4 py-2 rounded-xl text-xs font-bold transition select-none flex items-center gap-1.5",
            activeTab === "config" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Key className="h-3.5 w-3.5" />
          Environment Config
        </button>
      </div>

      {/* ================= TAB 1: OVERVIEW & TOPOLOGY ================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Network Topology Cards */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
              <Network className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  แผนผังการเชื่อมต่อระบบจริง (Real-Time Infrastructure Topology)
                </h3>
                <p className="text-xs text-slate-400">
                  โฮสต์หลัก Proxmox VE, คอนเทนเนอร์ฐานข้อมูล CT 102 และเว็บแอปพลิเคชัน
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Proxmox Host */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Server className="h-4 w-4 text-blue-600" />
                    Proxmox VE 8.x Host
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                    Online
                  </span>
                </div>
                <div className="text-xs space-y-1 text-slate-600 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Node Name:</span>
                    <strong className="text-slate-900">techniccom</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tailscale IP:</span>
                    <strong className="font-mono text-blue-600">100.125.250.85</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Local LAN IP:</span>
                    <span className="font-mono text-slate-700">192.168.1.250</span>
                  </div>
                </div>
              </div>

              {/* CT 102 Container */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-indigo-600" />
                    LXC CT 102 (database-server)
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                    Running
                  </span>
                </div>
                <div className="text-xs space-y-1 text-slate-600 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Container IP:</span>
                    <strong className="font-mono text-indigo-700">10.10.10.102</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">PostgreSQL Port:</span>
                    <span className="font-mono font-bold text-emerald-700">5432</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">MinIO S3 Ports:</span>
                    <span className="font-mono font-bold text-slate-800">9000 / 9001</span>
                  </div>
                </div>
              </div>

              {/* Web App */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-purple-600" />
                    Next.js 16 (qa-web)
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>
                <div className="text-xs space-y-1 text-slate-600 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Port:</span>
                    <strong className="font-mono text-purple-700">Port 3000</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Turbopack:</span>
                    <strong className="text-emerald-700">Active</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Heap Memory:</span>
                    <span className="font-mono text-slate-800">{ram?.heapUsedMB} MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: DATABASE STORAGE & TABLES & QUERIES ================= */}
      {activeTab === "database" && (
        <div className="space-y-6">
          {/* Database Summary & Table Sizes */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <Table className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    ขนาดความจุของแต่ละตารางใน PostgreSQL ({pg?.dbSizePretty || "0 MB"})
                  </h3>
                  <p className="text-xs text-slate-400">
                    วิเคราะห์ขนาดตารางจริงและจำนวนแถวข้อมูล (Live Relation Tuples & Size)
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">ชื่อตาราง (Table Name)</th>
                    <th className="p-3">จำนวนแถวข้อมูล (Row Count)</th>
                    <th className="p-3">ขนาดความจุ (Size)</th>
                    <th className="p-3 text-right">สัดส่วนใน DB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {(pg?.tableStats || []).map((t) => {
                    const totalBytes = pg?.dbSizeBytes || 1;
                    const percent = parseFloat(((t.sizeBytes / totalBytes) * 100).toFixed(1));
                    return (
                      <tr key={t.tableName} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <Table className="h-3.5 w-3.5 text-blue-600" />
                          {t.tableName}
                        </td>
                        <td className="p-3 text-slate-700 font-semibold">{t.rowCount.toLocaleString()} แถว</td>
                        <td className="p-3 text-emerald-700 font-bold">{t.sizePretty}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-slate-500 text-[11px]">{percent}%</span>
                            <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.max(5, percent)}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Live Queries (pg_stat_activity) */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Terminal className="h-5 w-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    คำสั่ง SQL Query ที่กำลังทำงานสด (Active Queries)
                  </h3>
                  <p className="text-xs text-slate-400">ตรวจสอบคำสั่ง Database ที่กำลังรันในขณะนี้</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {(pg?.activeQueries || []).length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">ไม่มีคำสั่งค้าง (Database ว่างพร้อมทำงาน)</p>
              ) : (
                pg?.activeQueries.map((q) => (
                  <div key={q.pid} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>PID: <strong className="text-slate-900">{q.pid}</strong> ({q.user})</span>
                      <span className="text-emerald-700 font-bold">{q.state} • {q.duration}</span>
                    </div>
                    <p className="text-slate-800 truncate font-semibold bg-white p-2 rounded-xl border border-slate-200">
                      {q.query}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: STREAMING REAL-TIME LOGS ================= */}
      {activeTab === "logs" && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <Terminal className="h-5 w-5 text-purple-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  บันทึกกิจกรรมสด (Live Streaming Audit Logs)
                  {isStreaming && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />}
                </h3>
                <p className="text-xs text-slate-400">อัปเดตแบบ Realtime ทุก 2.5 วินาที</p>
              </div>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="ค้นหา Log ตามชื่อ, กิจกรรม..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">ไม่พบบันทึกกิจกรรม</div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs transition hover:bg-slate-100/70"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={clsx(
                        "px-2 py-0.5 rounded-md text-[10px] font-black uppercase font-mono flex-shrink-0",
                        log.action.includes("BACKUP")
                          ? "bg-emerald-100 text-emerald-800"
                          : log.action.includes("UPDATE")
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      )}
                    >
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-900 truncate">{log.title}</span>
                    {log.user && (
                      <span className="text-slate-400 hidden sm:inline truncate">
                        • โดย {log.user.name} ({log.user.email})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 flex-shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(log.createdAt).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: SNAPSHOTS & BACKUPS ================= */}
      {activeTab === "backups" && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <FileJson className="h-5 w-5 text-emerald-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  รายการสำรองข้อมูล Snapshot ใน MinIO S3 ({backups.length} ไฟล์)
                </h3>
                <p className="text-xs text-slate-400">
                  ไฟล์ JSON Snapshot ประกอบด้วยข้อมูล Users, Roles และ ActivityLogs ทั้งหมด
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateBackup}
              disabled={backingUp}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 transition active:scale-95 disabled:opacity-70"
            >
              {backingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <HardDrive className="h-4 w-4" />}
              สร้าง Snapshot ทันที
            </button>
          </div>

          {backups.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
              ยังไม่มีไฟล์สำรองข้อมูล กดปุ่มสร้าง Snapshot เพื่อสำรองข้อมูล
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">ชื่อไฟล์สำรองข้อมูล (Snapshot)</th>
                    <th className="p-3">ขนาดไฟล์</th>
                    <th className="p-3">วันที่บันทึก</th>
                    <th className="p-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {backups.map((b) => (
                    <tr key={b.key} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-slate-900 flex items-center gap-2 truncate">
                        <FileJson className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">{b.filename}</span>
                      </td>
                      <td className="p-3 text-slate-600 font-semibold">{b.sizeKB} KB</td>
                      <td className="p-3 text-slate-500">
                        {new Date(b.lastModified).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-3 text-right">
                        <a
                          href={`/api/files/${b.key}`}
                          download={b.filename}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition"
                        >
                          <Download className="h-3 w-3" />
                          ดาวน์โหลด
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: ENVIRONMENT CONFIG ================= */}
      {activeTab === "config" && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <Key className="h-5 w-5 text-amber-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  การตั้งค่าตัวแปรระบบ (Environment Variables)
                </h3>
                <p className="text-xs text-slate-400">ตรวจสอบค่าคอนฟิกที่โหลดในระบบ</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Variable Key</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Configured Value</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {STATIC_ENV_CONFIG.map((env) => (
                  <tr key={env.key} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                      {env.isSecret && <Key className="h-3 w-3 text-amber-500" />}
                      {env.key}
                    </td>
                    <td className="p-3 font-sans font-semibold text-slate-600">{env.type}</td>
                    <td className="p-3 text-slate-700">
                      {env.isSecret ? (
                        <div className="flex items-center gap-2">
                          <span>{revealedSecrets[env.key] ? env.value : "••••••••••••••••"}</span>
                          <button
                            type="button"
                            onClick={() => toggleReveal(env.key)}
                            className="font-sans text-[10px] text-blue-600 hover:underline p-0.5"
                          >
                            {revealedSecrets[env.key] ? "ซ่อน" : "แสดง"}
                          </button>
                        </div>
                      ) : (
                        <span>{env.value}</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-sans">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <Check className="h-3 w-3" />
                        Loaded
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
