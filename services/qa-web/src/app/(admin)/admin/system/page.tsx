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
  Play,
  Pause,
  Table,
  Gauge,
  Sparkles,
  Radio,
  Globe,
  Boxes,
  Zap,
  ArrowUpRight,
  ChevronRight,
  HardDriveDownload,
  CircleDot,
} from "lucide-react";
import { clsx } from "clsx";

interface MetricsData {
  timestamp: string;
  webServerNode: {
    name: string;
    service: string;
    port: number;
    status: string;
    uptimeSeconds: number;
    nodeVersion: string;
    platform: string;
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
  };
  databaseServerNode: {
    name: string;
    hostname: string;
    ip: string;
    tailscaleIp: string;
    status: string;
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
      cacheHitRatio: number;
    };
    disk: {
      totalGB: number;
      usedGB: number;
      freeGB: number;
      percent: number;
      dbSizePretty: string;
      dbSizeBytes: number;
      s3SizeMB: number;
    };
    services: {
      postgres: {
        name: string;
        status: string;
        port: number;
        latencyMs: number;
        version: string;
        activeConnections: number;
        cacheHitRatio: number;
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
        name: string;
        status: string;
        port: number;
        consolePort: number;
        latencyMs: number;
        bucket: string;
        objectCount: number;
        totalSizeBytes: number;
        totalSizeMB: number;
      };
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
  const [activeTab, setActiveTab] = useState<"servers" | "database" | "logs" | "backups" | "config">("servers");
  const [lastStreamTime, setLastStreamTime] = useState<string>("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isRoot = session?.user?.role === "ROOT";

  // Fetch real-time streaming metrics
  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/admin/system/metrics");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
        setLastStreamTime(new Date().toLocaleTimeString("th-TH"));
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

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (d > 0) return `${d} วัน ${h} ชม. ${m} น.`;
    if (h > 0) return `${h} ชม. ${m} นาที ${s} วินาที`;
    return `${m} นาที ${s} วินาที`;
  };

  if (!isRoot) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[60vh]">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-600 border border-rose-200 shadow-sm">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-black text-slate-900">
          จำกัดสิทธิ์การเข้าถึง (Access Restricted)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md">
          หน้านี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบสูงสุด (ROOT Admin) เท่านั้นสำหรับตั้งค่าและตรวจสอบโครงสร้างพื้นฐานเซิร์ฟเวอร์
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าหลัก (Dashboard)
        </Link>
      </div>
    );
  }

  const web = metrics?.webServerNode;
  const dbNode = metrics?.databaseServerNode;
  const pg = dbNode?.services.postgres;
  const minio = dbNode?.services.minio;

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
    <div className="w-full max-w-7xl mx-auto p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-8">
      {/* ================= 1. CLEAN LIGHT THEME HERO HEADER (FULLY RESPONSIVE) ================= */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-7 shadow-sm space-y-4 sm:space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-5">
          {/* Title & Navigation */}
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                หน้าหลัก (Dashboard)
              </Link>
              <span className="text-slate-300">/</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                <Shield className="h-3 w-3" />
                ROOT COMMAND CENTER
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 leading-tight">
              ศูนย์มอนิเตอร์ & ตั้งค่าโครงสร้างระบบ
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              สตรีมมิ่งสถานะฮาร์ดแวร์แบบ Real-Time แยก 2 เครื่องเซิร์ฟเวอร์ (Web Host & Proxmox CT 102) พร้อมตรวจจับขนาดฐานข้อมูลและบันทึกประวัติการทำงาน
            </p>
          </div>

          {/* Real-time Streaming Controls Bar (Mobile-Optimized) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200/70 w-full lg:w-auto">
            {/* Live Indicator Pill */}
            <button
              type="button"
              onClick={() => setIsStreaming(!isStreaming)}
              className={clsx(
                "flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition active:scale-95 shadow-2xs select-none min-h-[42px]",
                isStreaming
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100/60"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              )}
            >
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                {isStreaming && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={clsx(
                    "relative inline-flex rounded-full h-2.5 w-2.5",
                    isStreaming ? "bg-emerald-500" : "bg-slate-400"
                  )}
                />
              </span>
              <span className="tracking-wide text-center truncate">{isStreaming ? "LIVE (2.5s)" : "PAUSED"}</span>
              {isStreaming ? (
                <Pause className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              ) : (
                <Play className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
              )}
            </button>

            {/* Quick Refresh Button */}
            <button
              type="button"
              onClick={() => {
                fetchMetrics();
                fetchBackups();
              }}
              title="รีเฟรชข้อมูลทันที"
              className="p-2.5 rounded-xl bg-white hover:bg-slate-100/80 text-slate-700 border border-slate-200 transition active:scale-95 shadow-2xs min-h-[42px] flex items-center justify-center"
            >
              <RefreshCw className={clsx("h-4 w-4 text-blue-600", loading && "animate-spin")} />
            </button>

            {/* Snapshot Trigger Button */}
            <button
              type="button"
              onClick={handleCreateBackup}
              disabled={backingUp}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition active:scale-95 disabled:opacity-50 min-h-[42px]"
            >
              {backingUp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <HardDriveDownload className="h-3.5 w-3.5" />}
              <span className="truncate">สร้าง Snapshot</span>
            </button>
          </div>
        </div>

        {/* Header Summary Sub-Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <CircleDot className="h-2.5 w-2.5 text-emerald-500 flex-shrink-0" />
              Web: <strong className="text-slate-900 font-mono">Port {web?.port || 3000}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <CircleDot className="h-2.5 w-2.5 text-blue-500 flex-shrink-0" />
              DB: <strong className="text-slate-900 font-mono">10.10.10.102</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <CircleDot className="h-2.5 w-2.5 text-indigo-500 flex-shrink-0" />
              Tailscale: <strong className="text-slate-900 font-mono truncate max-w-[110px] sm:max-w-none">100.125.250.85</strong>
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-1.5 text-[11px] text-slate-400">
            <span>อัปเดตล่าสุด:</span>
            <strong className="font-mono text-emerald-700 font-bold">{lastStreamTime || "กำลังเชื่อมต่อ..."}</strong>
          </div>
        </div>
      </div>

      {/* ================= 2. DUAL-NODE STREAMING SYSTEM DASHBOARD (2 LIGHT CARDS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* ================= NODE 1: WEB APPLICATION HOST ================= */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-7 shadow-sm space-y-4 sm:space-y-5">
          {/* Header Strip */}
          <div className="flex items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 sm:pb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 shadow-2xs flex-shrink-0">
                <Globe className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 uppercase flex-shrink-0">
                    Node 1
                  </span>
                  <h2 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 tracking-tight truncate">
                    เครื่องเว็บแอปพลิเคชัน (App Server)
                  </h2>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate mt-0.5">
                  {web?.service} • Platform: {web?.platform}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-xs font-bold shadow-2xs flex-shrink-0 self-start sm:self-center">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </div>
          </div>

          {/* Web Telemetry Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Meter 1: Web CPU */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                  Web CPU Usage
                </span>
                <span className="font-mono font-black text-sm sm:text-base text-slate-900">
                  {web?.cpu.percent ?? 0}%
                </span>
              </div>
              <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all duration-500",
                    (web?.cpu.percent || 0) < 60
                      ? "bg-blue-600"
                      : (web?.cpu.percent || 0) < 85
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  )}
                  style={{ width: `${Math.min(100, Math.max(5, web?.cpu.percent || 0))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-400 pt-0.5">
                <span>{web?.cpu.cores || 4} Cores Total</span>
                <span className="truncate max-w-[120px] sm:max-w-[140px]">{web?.cpu.model}</span>
              </div>
            </div>

            {/* Meter 2: Web RAM */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600" />
                  Web System RAM
                </span>
                <span className="font-mono font-black text-sm sm:text-base text-slate-900">
                  {web?.ram.percent ?? 0}%
                </span>
              </div>
              <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all duration-500",
                    (web?.ram.percent || 0) < 70
                      ? "bg-indigo-600"
                      : (web?.ram.percent || 0) < 90
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  )}
                  style={{ width: `${Math.min(100, Math.max(5, web?.ram.percent || 0))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-500 pt-0.5">
                <span>ใช้: <strong className="text-slate-800">{web?.ram.usedGB} GB</strong></span>
                <span>เหลือ: <strong className="text-emerald-700">{web?.ram.freeGB} GB</strong> / {web?.ram.totalGB} GB</span>
              </div>
            </div>
          </div>

          {/* Node 1 Hardware & Runtime Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-200/70 text-xs">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider block truncate">Heap Used</span>
              <strong className="text-slate-900 font-mono font-bold text-xs sm:text-sm truncate block">{web?.ram.heapUsedMB} MB</strong>
            </div>
            <div className="space-y-0.5 min-w-0">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider block truncate">Node Version</span>
              <strong className="text-slate-900 font-mono font-bold text-xs sm:text-sm truncate block">{web?.nodeVersion}</strong>
            </div>
            <div className="space-y-0.5 min-w-0">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider block truncate">Server Uptime</span>
              <strong className="text-slate-900 font-bold text-[10px] sm:text-xs truncate block">{formatUptime(web?.uptimeSeconds || 0)}</strong>
            </div>
          </div>
        </div>

        {/* ================= NODE 2: DATABASE SERVER (PROXMOX CT 102) ================= */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-7 shadow-sm space-y-4 sm:space-y-5">
          {/* Header Strip */}
          <div className="flex items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 sm:pb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-2xs flex-shrink-0">
                <Database className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase flex-shrink-0">
                    Node 2
                  </span>
                  <h2 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 tracking-tight truncate">
                    เครื่องฐานข้อมูล (Database Server)
                  </h2>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 font-mono truncate mt-0.5">
                  {dbNode?.hostname} • IP: {dbNode?.ip} ({dbNode?.tailscaleIp})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-xs font-bold shadow-2xs flex-shrink-0 self-start sm:self-center">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              LXC CT 102
            </div>
          </div>

          {/* Database Telemetry Meters (CPU, RAM, DISK) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {/* DB CPU */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <Cpu className="h-3.5 w-3.5 text-emerald-600" />
                  DB CPU
                </span>
                <span className="font-mono font-black text-xs sm:text-sm text-slate-900">
                  {dbNode?.cpu.percent ?? 0}%
                </span>
              </div>
              <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, dbNode?.cpu.percent || 0))}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-400">
                <span>{dbNode?.cpu.cores} vCPUs</span>
                <span className="text-emerald-700 font-bold">Query Load</span>
              </div>
            </div>

            {/* DB RAM */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5 text-indigo-600" />
                  DB RAM
                </span>
                <span className="font-mono font-black text-xs sm:text-sm text-slate-900">
                  {dbNode?.ram.percent ?? 0}%
                </span>
              </div>
              <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, dbNode?.ram.percent || 0))}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-500">
                <span>ใช้: <strong>{dbNode?.ram.usedGB} GB</strong></span>
                <span>/ {dbNode?.ram.totalGB} GB</span>
              </div>
            </div>

            {/* CT 102 Disk Space */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <HardDrive className="h-3.5 w-3.5 text-amber-600" />
                  ดิสก์ CT 102
                </span>
                <span className="font-mono font-black text-xs sm:text-sm text-slate-900">
                  {dbNode?.disk.percent ?? 0}%
                </span>
              </div>
              <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, dbNode?.disk.percent || 0))}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-500">
                <span>เหลือ: <strong className="text-emerald-700">{dbNode?.disk.freeGB} GB</strong></span>
                <span>/ {dbNode?.disk.totalGB} GB</span>
              </div>
            </div>
          </div>

          {/* Database Services Health Strip (Postgres & MinIO S3) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {/* PostgreSQL Service */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="font-bold text-slate-900 truncate">PostgreSQL (5432)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] flex-shrink-0">
                <span className="font-mono font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                  {pg?.latencyMs} ms
                </span>
                <span className="text-slate-500">({pg?.activeConnections} conn)</span>
              </div>
            </div>

            {/* MinIO S3 Service */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="font-bold text-slate-900 truncate">MinIO S3 (9000)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] flex-shrink-0">
                <span className="font-mono font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                  {minio?.latencyMs} ms
                </span>
                <span className="text-slate-500">({minio?.objectCount} ไฟล์)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. SEGMENTED TABS (HORIZONTALLY SCROLLABLE ON MOBILE) ================= */}
      <div className="overflow-x-auto no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 min-w-max">
          <button
            onClick={() => setActiveTab("servers")}
            className={clsx(
              "px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-black transition duration-150 select-none flex items-center gap-1.5 sm:gap-2 shadow-2xs whitespace-nowrap",
              activeTab === "servers"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200/70"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            <Server className="h-3.5 w-3.5 text-blue-600" />
            โครงข่าย 2 Server Nodes
          </button>

          <button
            onClick={() => setActiveTab("database")}
            className={clsx(
              "px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-black transition duration-150 select-none flex items-center gap-1.5 sm:gap-2 shadow-2xs whitespace-nowrap",
              activeTab === "database"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200/70"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            <Table className="h-3.5 w-3.5 text-emerald-600" />
            ความจุตาราง Database
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={clsx(
              "px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-black transition duration-150 select-none flex items-center gap-1.5 sm:gap-2 shadow-2xs whitespace-nowrap",
              activeTab === "logs"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200/70"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            <Terminal className="h-3.5 w-3.5 text-purple-600" />
            Streaming Logs
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-800">
              {filteredLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("backups")}
            className={clsx(
              "px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-black transition duration-150 select-none flex items-center gap-1.5 sm:gap-2 shadow-2xs whitespace-nowrap",
              activeTab === "backups"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200/70"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            <FileJson className="h-3.5 w-3.5 text-amber-600" />
            Snapshot
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
              {backups.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("config")}
            className={clsx(
              "px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-black transition duration-150 select-none flex items-center gap-1.5 sm:gap-2 shadow-2xs whitespace-nowrap",
              activeTab === "config"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200/70"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            <Key className="h-3.5 w-3.5 text-slate-600" />
            ENV Config
          </button>
        </div>
      </div>

      {/* ================= TAB 1: SERVERS & TOPOLOGY ================= */}
      {activeTab === "servers" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-8 shadow-sm space-y-5 sm:space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 sm:pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 shadow-2xs flex-shrink-0">
                <Network className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  แผนผังการเชื่อมโยงระบบจริง (Live Network Topology & Data Flow)
                </h3>
                <p className="text-xs text-slate-400">
                  โครงสร้างการสื่อสารและ Port Mapping ระหว่าง Web Host, Proxmox VE 8.x, CT 102, และ Docker Services
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
              {/* Node 1: Web App */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    1. Web Application Host
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                    Online
                  </span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-600 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Framework:</span>
                    <strong className="text-slate-900">Next.js 16 App Router</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Port:</span>
                    <strong className="font-mono text-blue-600 font-bold">Port 3000</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Auth Engine:</span>
                    <span className="font-bold text-emerald-700">NextAuth Live DB</span>
                  </div>
                </div>
              </div>

              {/* Node 2: Proxmox Host */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Server className="h-4 w-4 text-amber-600" />
                    2. Proxmox VE 8.x Host
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                    Online
                  </span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-600 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Node Name:</span>
                    <strong className="text-slate-900">techniccom</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tailscale IP:</span>
                    <strong className="font-mono text-blue-600 font-bold">100.125.250.85</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Local LAN IP:</span>
                    <span className="font-mono text-slate-700">192.168.1.250</span>
                  </div>
                </div>
              </div>

              {/* Node 3: CT 102 Container */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Database className="h-4 w-4 text-emerald-600" />
                    3. CT 102 (database-server)
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                    Running
                  </span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-600 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Internal IP:</span>
                    <strong className="font-mono text-indigo-700 font-bold">10.10.10.102</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Postgres 16:</span>
                    <span className="font-mono font-bold text-emerald-700">Port 5432</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">MinIO S3:</span>
                    <span className="font-mono font-bold text-slate-800">Port 9000 / 9001</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: DATABASE STORAGE & TABLES & QUERIES ================= */}
      {activeTab === "database" && (
        <div className="space-y-5 sm:space-y-6">
          {/* Database Summary & Table Sizes */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-8 shadow-sm space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-2xs flex-shrink-0">
                  <Table className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    ขนาดความจุของแต่ละตารางใน PostgreSQL ({dbNode?.disk.dbSizePretty || "0 MB"})
                  </h3>
                  <p className="text-xs text-slate-400">
                    วิเคราะห์ขนาดตารางจริงและจำนวนแถวข้อมูล (Live Relation Tuples & Size)
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">ชื่อตาราง (Table Name)</th>
                    <th className="p-3.5">จำนวนแถวข้อมูล (Row Count)</th>
                    <th className="p-3.5">ขนาดความจุ (Size)</th>
                    <th className="p-3.5 text-right">สัดส่วนใน DB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {(pg?.tableStats || []).map((t) => {
                    const totalBytes = dbNode?.disk.dbSizeBytes || 1;
                    const percent = parseFloat(((t.sizeBytes / totalBytes) * 100).toFixed(1));
                    return (
                      <tr key={t.tableName} className="hover:bg-slate-50/70 transition">
                        <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <Table className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                          {t.tableName}
                        </td>
                        <td className="p-3.5 text-slate-700 font-semibold">{t.rowCount.toLocaleString()} แถว</td>
                        <td className="p-3.5 text-emerald-700 font-bold">{t.sizePretty}</td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <span className="text-slate-500 text-[11px] font-sans font-bold">{percent}%</span>
                            <div className="w-20 bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.max(5, percent)}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Zero Horizontal Overflow) */}
            <div className="sm:hidden space-y-2.5">
              {(pg?.tableStats || []).map((t) => {
                const totalBytes = dbNode?.disk.dbSizeBytes || 1;
                const percent = parseFloat(((t.sizeBytes / totalBytes) * 100).toFixed(1));
                return (
                  <div key={t.tableName} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Table className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                        {t.tableName}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-700">{t.sizePretty}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{t.rowCount.toLocaleString()} แถว</span>
                      <span className="font-bold">{percent}% ของ DB</span>
                    </div>

                    <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.max(5, percent)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Live Queries (pg_stat_activity) */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-8 shadow-sm space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-2xs flex-shrink-0">
                  <Terminal className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    คำสั่ง SQL Query ที่กำลังทำงานสด (Active Queries)
                  </h3>
                  <p className="text-xs text-slate-400">ตรวจสอบคำสั่ง Database ที่กำลังรันในขณะนี้</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {(pg?.activeQueries || []).length === 0 ? (
                <p className="text-xs text-slate-400 italic py-3 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  ไม่มีคำสั่งค้าง (Database พร้อมรับงานใหม่)
                </p>
              ) : (
                pg?.activeQueries.map((q) => (
                  <div key={q.pid} className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] sm:text-[11px] text-slate-500">
                      <span>PID: <strong className="text-slate-900">{q.pid}</strong> ({q.user})</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {q.state} • {q.duration}
                      </span>
                    </div>
                    <p className="text-slate-800 break-words font-semibold bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 text-[11px] sm:text-xs">
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
        <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-8 shadow-sm space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-3 sm:pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 shadow-2xs flex-shrink-0">
                <Terminal className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  บันทึกกิจกรรมสด (Live Logs)
                  {isStreaming && <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />}
                </h3>
                <p className="text-xs text-slate-400">อัปเดตแบบ Realtime ทุก 2.5 วินาที</p>
              </div>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="ค้นหา Log..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-0.5">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                ไม่พบบันทึกกิจกรรม
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs transition hover:bg-slate-100/80 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={clsx(
                        "px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-black uppercase font-mono flex-shrink-0 shadow-2xs",
                        log.action.includes("BACKUP")
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : log.action.includes("UPDATE")
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-purple-100 text-purple-800 border border-purple-200"
                      )}
                    >
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-900 truncate text-xs">{log.title}</span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 text-[10px] sm:text-[11px] text-slate-400 font-medium pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200/50">
                    {log.user && (
                      <span className="truncate max-w-[140px] sm:max-w-none text-slate-500">
                        {log.user.name}
                      </span>
                    )}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(log.createdAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: SNAPSHOTS & BACKUPS ================= */}
      {activeTab === "backups" && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-8 shadow-sm space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-3 sm:pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-2xs flex-shrink-0">
                <FileJson className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  รายการ Snapshot ใน MinIO S3 ({backups.length} ไฟล์)
                </h3>
                <p className="text-xs text-slate-400">
                  ไฟล์ JSON Snapshot สำรอง Users, Roles และ ActivityLogs ทั้งหมด
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateBackup}
              disabled={backingUp}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-black text-xs shadow-md shadow-blue-500/25 hover:bg-blue-700 transition active:scale-95 disabled:opacity-70 w-full sm:w-auto"
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
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">ชื่อไฟล์สำรองข้อมูล (Snapshot)</th>
                      <th className="p-3.5">ขนาดไฟล์</th>
                      <th className="p-3.5">วันที่บันทึก</th>
                      <th className="p-3.5 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {backups.map((b) => (
                      <tr key={b.key} className="hover:bg-slate-50/70 transition">
                        <td className="p-3.5 font-mono font-bold text-slate-900 flex items-center gap-2.5 truncate">
                          <FileJson className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <span className="truncate">{b.filename}</span>
                        </td>
                        <td className="p-3.5 text-slate-700 font-semibold">{b.sizeKB} KB</td>
                        <td className="p-3.5 text-slate-500 font-medium">
                          {new Date(b.lastModified).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="p-3.5 text-right">
                          <a
                            href={`/api/files/${b.key}`}
                            download={b.filename}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-black text-xs transition shadow-2xs border border-blue-200"
                          >
                            <Download className="h-3.5 w-3.5" />
                            ดาวน์โหลด
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-2.5">
                {backups.map((b) => (
                  <div key={b.key} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileJson className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-mono font-bold text-xs text-slate-900 truncate">{b.filename}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>ขนาด: <strong className="text-slate-800">{b.sizeKB} KB</strong></span>
                      <span>
                        {new Date(b.lastModified).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <a
                      href={`/api/files/${b.key}`}
                      download={b.filename}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs border border-blue-200 shadow-2xs transition"
                    >
                      <Download className="h-3.5 w-3.5" />
                      ดาวน์โหลดไฟล์ Snapshot
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= TAB 5: ENVIRONMENT CONFIG ================= */}
      {activeTab === "config" && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-8 shadow-sm space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-2xs flex-shrink-0">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  การตั้งค่าตัวแปรระบบ (Environment Variables Inspector)
                </h3>
                <p className="text-xs text-slate-400">ตรวจสอบค่าคอนฟิกที่โหลดในระบบ (ค่าสำคัญจะถูกปิดบัง)</p>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Variable Key</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Configured Value</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {STATIC_ENV_CONFIG.map((env) => (
                  <tr key={env.key} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      {env.isSecret && <Key className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
                      {env.key}
                    </td>
                    <td className="p-3.5 font-sans font-semibold text-slate-600">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                        {env.type}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      {env.isSecret ? (
                        <div className="flex items-center gap-2.5">
                          <span>{revealedSecrets[env.key] ? env.value : "••••••••••••••••"}</span>
                          <button
                            type="button"
                            onClick={() => toggleReveal(env.key)}
                            className="font-sans text-[11px] font-bold text-blue-600 hover:underline px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200"
                          >
                            {revealedSecrets[env.key] ? "ซ่อน" : "แสดง"}
                          </button>
                        </div>
                      ) : (
                        <span>{env.value}</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-sans">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <Check className="h-3.5 w-3.5" />
                        Loaded
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-2.5">
            {STATIC_ENV_CONFIG.map((env) => (
              <div key={env.key} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    {env.isSecret && <Key className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
                    {env.key}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 text-[10px] font-semibold">
                    {env.type}
                  </span>
                </div>

                <div className="p-2 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 break-all">
                  {env.isSecret ? (
                    <div className="flex items-center justify-between gap-2">
                      <span>{revealedSecrets[env.key] ? env.value : "••••••••••••••••"}</span>
                      <button
                        type="button"
                        onClick={() => toggleReveal(env.key)}
                        className="font-sans text-[10px] font-bold text-blue-600 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 flex-shrink-0"
                      >
                        {revealedSecrets[env.key] ? "ซ่อน" : "แสดง"}
                      </button>
                    </div>
                  ) : (
                    <span>{env.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
