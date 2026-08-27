"use client";

import React, { useState, useEffect } from "react";
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
  Eye,
  EyeOff,
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
} from "lucide-react";
import { clsx } from "clsx";

interface SystemStatus {
  timestamp: string;
  database: {
    status: string;
    latencyMs: number;
    version: string;
    connections: number;
    counts: {
      users: number;
      roles: number;
      logs: number;
    };
  };
  storage: {
    status: string;
    latencyMs: number;
    bucket: string;
    objectCount: number;
    totalSizeMB: number;
  };
  serverMetrics: {
    uptimeSeconds: number;
    nodeVersion: string;
    platform: string;
    arch: string;
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
  infrastructure: {
    proxmoxHost: {
      name: string;
      tailscaleIp: string;
      localIp: string;
      status: string;
    };
    containerCT102: {
      id: string;
      hostname: string;
      ip: string;
      status: string;
      services: Array<{
        name: string;
        type: string;
        port: number;
        consolePort?: number;
        status: string;
      }>;
    };
    webService: {
      name: string;
      port: number;
      status: string;
      framework: string;
    };
  };
  envConfig: Array<{
    key: string;
    value: string;
    type: string;
    isSecret: boolean;
  }>;
}

interface BackupItem {
  key: string;
  filename: string;
  sizeBytes: number;
  sizeKB: number;
  lastModified: string;
}

interface LogItem {
  id: string;
  action: string;
  title: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    roleCode: string;
  } | null;
}

export default function SystemAdminPage() {
  const { data: session } = useSession();

  const [statusData, setStatusData] = useState<SystemStatus | null>(null);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingBackups, setLoadingBackups] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [backingUp, setBackingUp] = useState(false);

  // Search & Filters
  const [logSearch, setLogSearch] = useState("");
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});

  const isRoot = session?.user?.role === "ROOT";

  const fetchStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await fetch("/api/admin/system/status");
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchBackups = async () => {
    try {
      setLoadingBackups(true);
      const res = await fetch("/api/admin/system/backup");
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBackups(false);
    }
  };

  const fetchLogs = async (keyword = "") => {
    try {
      setLoadingLogs(true);
      const url = keyword ? `/api/admin/system/logs?search=${encodeURIComponent(keyword)}` : "/api/admin/system/logs";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (isRoot) {
      fetchStatus();
      fetchBackups();
      fetchLogs();
    }
  }, [isRoot]);

  const handleCreateBackup = async () => {
    if (!confirm("คุณต้องการสร้าง Snapshot สำรองข้อมูลระบบทั้งหมดไปยัง MinIO S3 ใช่หรือไม่?")) return;
    setBackingUp(true);
    try {
      const res = await fetch("/api/admin/system/backup", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert(`สร้าง Snapshot สำรองข้อมูลสำเร็จ!\nไฟล์: ${data.backup.filename} (${data.backup.sizeKB} KB)`);
        fetchBackups();
        fetchLogs();
        fetchStatus();
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
    if (d > 0) return `${d} วัน ${h} ชม. ${m} นาที`;
    if (h > 0) return `${h} ชม. ${m} นาที ${s} วินาที`;
    return `${m} นาที ${s} วินาที`;
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

  return (
    <div className="w-full max-w-7xl mx-auto p-3.5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* ================= 1. PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            กลับหน้าหลัก (Dashboard)
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 leading-tight">
              ตั้งค่าระบบ & มอนิเตอร์เซิร์ฟเวอร์
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
              <Shield className="h-3 w-3" />
              ROOT ONLY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            ตรวจสอบการเชื่อมต่อ Database, Object Storage S3, Proxmox CT 102, Environment Variables และสำรองข้อมูล
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              fetchStatus();
              fetchBackups();
              fetchLogs();
            }}
            disabled={loadingStatus}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={clsx("h-4 w-4 text-blue-600", loadingStatus && "animate-spin")} />
            <span>ทดสอบการเชื่อมต่อใหม่</span>
          </button>

          <button
            type="button"
            onClick={handleCreateBackup}
            disabled={backingUp}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 active:scale-95 disabled:opacity-70"
          >
            {backingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <HardDrive className="h-4 w-4" />}
            <span>สำรองข้อมูลด่วน (Backup)</span>
          </button>
        </div>
      </div>

      {/* ================= 2. LIVE HEALTH MONITOR METRICS (4 CARDS) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: PostgreSQL */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/60 shadow-2xs">
              <Database className="h-5 w-5" />
            </div>
            <span
              className={clsx(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold",
                statusData?.database.status === "connected"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              )}
            >
              <span className={clsx("h-2 w-2 rounded-full", statusData?.database.status === "connected" ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
              {statusData?.database.status === "connected" ? "Online" : "Offline"}
            </span>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400">ฐานข้อมูลหลัก (PostgreSQL)</h3>
            <p className="text-lg font-black text-slate-900 mt-0.5">
              {statusData?.database.version.split(" ")[0]} {statusData?.database.version.split(" ")[1]}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Ping Latency:</span>
            <strong className="text-emerald-700 font-mono font-bold">
              {statusData?.database.latencyMs ?? "-"} ms
            </strong>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Active Connections:</span>
            <span className="font-bold text-slate-700">{statusData?.database.connections ?? 1} session</span>
          </div>
        </div>

        {/* Card 2: MinIO S3 Object Storage */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 shadow-2xs">
              <HardDrive className="h-5 w-5" />
            </div>
            <span
              className={clsx(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold",
                statusData?.storage.status === "connected"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              )}
            >
              <span className={clsx("h-2 w-2 rounded-full", statusData?.storage.status === "connected" ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
              {statusData?.storage.status === "connected" ? "Online" : "Offline"}
            </span>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400">พื้นที่จัดเก็บไฟล์ (MinIO S3)</h3>
            <p className="text-lg font-black text-slate-900 mt-0.5 truncate">
              {statusData?.storage.bucket || "qa-evidences"}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>จำนวนไฟล์ที่เก็บ:</span>
            <strong className="text-slate-900 font-bold">
              {statusData?.storage.objectCount ?? 0} ไฟล์ ({statusData?.storage.totalSizeMB ?? 0} MB)
            </strong>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Ping Latency:</span>
            <span className="font-mono font-bold text-emerald-700">{statusData?.storage.latencyMs ?? "-"} ms</span>
          </div>
        </div>

        {/* Card 3: Proxmox Host & CT 102 */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 shadow-2xs">
              <Server className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Proxmox 8.x
            </span>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400">Proxmox CT 102 (LXC)</h3>
            <p className="text-lg font-black text-slate-900 mt-0.5 font-mono">
              100.125.250.85
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Local IP:</span>
            <span className="font-mono font-bold text-slate-700">10.10.10.102</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Docker Services:</span>
            <span className="font-bold text-emerald-700">qa_postgres & qa_minio</span>
          </div>
        </div>

        {/* Card 4: Web Application Metrics */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-200/60 shadow-2xs">
              <Cpu className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Running
            </span>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400">Web App (Next.js 16)</h3>
            <p className="text-lg font-black text-slate-900 mt-0.5">
              {statusData?.serverMetrics.heapUsedMB ?? 0} MB <span className="text-xs font-normal text-slate-400">/ {statusData?.serverMetrics.heapTotalMB ?? 0} MB</span>
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Node Version:</span>
            <span className="font-mono font-bold text-slate-700">{statusData?.serverMetrics.nodeVersion || process.version}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Server Uptime:</span>
            <span className="font-bold text-slate-700">{formatUptime(statusData?.serverMetrics.uptimeSeconds || 0)}</span>
          </div>
        </div>
      </div>

      {/* ================= 3. NETWORK TOPOLOGY & IP CONNECTIONS ================= */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
            <Network className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              แผนผังการเชื่อมต่อเครือข่าย & IP (Network & IP Topology)
            </h3>
            <p className="text-xs text-slate-400">
              โครงสร้างระบบเซิร์ฟเวอร์ Proxmox, Container CT 102, Docker Services และ Web Application
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Node 1: Proxmox Host */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="h-4 w-4 text-blue-600" />
                1. Proxmox VE Host
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                Online
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900">Node: techniccom</p>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Tailscale IP:</span>
                <span className="font-mono font-bold text-blue-600">100.125.250.85</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Local LAN IP:</span>
                <span className="font-mono font-bold text-slate-700">192.168.1.250</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Subnet:</span>
                <span className="font-mono text-slate-500">10.10.10.0/24</span>
              </div>
            </div>
          </div>

          {/* Node 2: CT 102 Container & Docker */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-indigo-600" />
                2. CT 102 (database-server)
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                Running
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 font-mono">IP: 10.10.10.102</p>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">🐘 PostgreSQL:</span>
                <span className="font-mono font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded border">
                  Port 5432
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">🪣 MinIO API:</span>
                <span className="font-mono font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border">
                  Port 9000
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">🖥️ MinIO Console:</span>
                <span className="font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border">
                  Port 9001
                </span>
              </div>
            </div>
          </div>

          {/* Node 3: Web App Client */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-purple-600" />
                3. Web Application (App Router)
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                Next.js 16
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900">Service: qa-web</p>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Web Port:</span>
                <span className="font-mono font-bold text-purple-700">Port 3000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Turbopack:</span>
                <span className="font-bold text-emerald-600">Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Auth Session:</span>
                <span className="font-bold text-slate-800">Live DB Sync</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4. ENVIRONMENT VARIABLES (ENV CONFIG INSPECTOR) ================= */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                การตั้งค่าตัวแปรระบบ (Environment Variables & Config)
              </h3>
              <p className="text-xs text-slate-400">
                ตรวจสอบค่าคอนฟิกที่โหลดในระบบ (ค่าสำคัญจะถูกปิดบังเพื่อความปลอดภัย)
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
            {statusData?.envConfig.length || 8} Variables
          </span>
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
              {statusData?.envConfig.map((env) => (
                <tr key={env.key} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                    {env.isSecret && <Key className="h-3 w-3 text-amber-500" />}
                    {env.key}
                  </td>
                  <td className="p-3">
                    <span className="font-sans text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {env.type}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 font-medium">
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

      {/* ================= 5. BACKUP & SNAPSHOT MANAGEMENT ================= */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <FileJson className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ระบบสำรองข้อมูล & Snapshot (Backup & Restore)
              </h3>
              <p className="text-xs text-slate-400">
                สำรองข้อมูลผู้ใช้ ยศ/สิทธิ์ และประวัติการทำงานลง MinIO S3 Bucket ({backups.length} ไฟล์)
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

        {loadingBackups ? (
          <div className="p-8 text-center text-slate-400 text-xs">กำลังโหลดรายการสำรองข้อมูล...</div>
        ) : backups.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs space-y-1">
            <p className="font-bold">ยังไม่มีไฟล์ Snapshot ใน MinIO S3</p>
            <p className="text-slate-400">กดปุ่ม "สร้าง Snapshot ทันที" เพื่อสำรองข้อมูลครั้งแรก</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">ชื่อไฟล์สำรองข้อมูล (Snapshot)</th>
                  <th className="p-3">ขนาดไฟล์</th>
                  <th className="p-3">วันที่บันทึก (Date)</th>
                  <th className="p-3 text-right">ดาวน์โหลด</th>
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

      {/* ================= 6. SYSTEM AUDIT & ACTIVITY LOGS ================= */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                บันทึกการทำงานของระบบ (System Logs & Audit Trail)
              </h3>
              <p className="text-xs text-slate-400">
                ประวัติกิจกรรมการทำงานและการกระทำของผู้ใช้ทั้งหมดในระบบ ({logs.length} รายการ)
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={logSearch}
              onChange={(e) => {
                setLogSearch(e.target.value);
                fetchLogs(e.target.value);
              }}
              placeholder="ค้นหา Log ตามชื่อ, กิจกรรม..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {loadingLogs ? (
          <div className="p-8 text-center text-slate-400 text-xs">กำลังโหลดบันทึกการทำงาน...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">ไม่พบบันทึกการทำงาน</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {logs.map((log) => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
