"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";

import DnsIcon from "@mui/icons-material/Dns";
import StorageIcon from "@mui/icons-material/Storage";
import MemoryIcon from "@mui/icons-material/Memory";
import SpeedIcon from "@mui/icons-material/Speed";
import ComputerIcon from "@mui/icons-material/Computer";
import SecurityIcon from "@mui/icons-material/Security";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import TerminalIcon from "@mui/icons-material/Terminal";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DataObjectIcon from "@mui/icons-material/DataObject";
import HubIcon from "@mui/icons-material/Hub";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import TableChartIcon from "@mui/icons-material/TableChart";
import PublicIcon from "@mui/icons-material/Public";
import BackupIcon from "@mui/icons-material/Backup";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import InfoIcon from "@mui/icons-material/Info";
import { PageBreadcrumbs } from "@/components/ui/PageBreadcrumbs";

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
  name: string;
  description: string;
  creator: string;
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
  const [activeTab, setActiveTab] = useState<number>(0);
  const [lastStreamTime, setLastStreamTime] = useState<string>("");

  // Feedback Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Modal State for Creating Snapshot
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [snapshotName, setSnapshotName] = useState("");
  const [snapshotDescription, setSnapshotDescription] = useState("");

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

  const openCreateSnapshotModal = () => {
    const defaultName = `Snapshot_${new Date().toLocaleDateString("th-TH").replace(/\//g, "_")}_${new Date().toLocaleTimeString("th-TH").replace(/:/g, "")}`;
    setSnapshotName(defaultName);
    setSnapshotDescription("");
    setShowSnapshotModal(true);
  };

  const handleCreateBackupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotName.trim()) {
      setSnackbar({
        open: true,
        message: "กรุณาระบุชื่อ Snapshot",
        severity: "warning",
      });
      return;
    }

    setBackingUp(true);
    try {
      const res = await fetch("/api/admin/system/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: snapshotName.trim(),
          description: snapshotDescription.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowSnapshotModal(false);
        setSnackbar({
          open: true,
          message: `สร้าง Snapshot สำรองข้อมูลสำเร็จ ${data.backup.name} (${data.backup.sizeKB} KB)`,
          severity: "success",
        });
        fetchBackups();
        fetchMetrics();
      } else {
        setSnackbar({
          open: true,
          message: data.error || "เกิดข้อผิดพลาดในการสำรองข้อมูล",
          severity: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
        severity: "error",
      });
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
      <Box sx={{ width: "100%", maxWidth: 1280, mx: "auto", p: { xs: 2, sm: 4 }, textAlign: "center", minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Paper elevation={0} sx={{ p: 4, border: "1px solid", borderColor: "divider", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <SecurityIcon sx={{ fontSize: 56, color: "error.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            จำกัดสิทธิ์การเข้าถึง (Access Restricted)
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            หน้านี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบสูงสุด (ROOT Admin) เท่านั้นสำหรับตั้งค่าและตรวจสอบโครงสร้างพื้นฐานเซิร์ฟเวอร์
          </Typography>
          <Button
            component={Link}
            href="/dashboard"
            variant="contained"
            startIcon={<ArrowBackIcon />}
            sx={{ mt: 1, fontWeight: 700 }}
          >
            กลับหน้าหลัก
          </Button>
        </Paper>
      </Box>
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: { xs: 1.5, sm: 2.5 } }}>
      {/* 0. Breadcrumbs */}
      <PageBreadcrumbs />

      {/* 1. Ultra-Compact Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          pb: 0.75,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="กลับหน้าหลัก">
            <IconButton
              component={Link}
              href="/dashboard"
              size="small"
              sx={{ color: "text.secondary", p: 0.4 }}
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Typography variant="h2" sx={{ fontWeight: 700, fontSize: { xs: "0.95rem", sm: "1.125rem" }, color: "text.primary" }}>
            ศูนย์มอนิเตอร์และตั้งค่าโครงสร้างระบบ
          </Typography>
          <Tooltip title="สตรีมมิ่งสถานะฮาร์ดแวร์แบบ Real Time แยก 2 เครื่องเซิร์ฟเวอร์ พร้อมตรวจจับขนาดฐานข้อมูล">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
              <InfoIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Chip
            icon={<SecurityIcon sx={{ fontSize: "0.8rem !important" }} />}
            label="ROOT COMMAND CENTER"
            size="small"
            color="error"
            variant="outlined"
            sx={{ fontWeight: 800, fontSize: "0.6875rem", height: 20, display: { xs: "none", sm: "inline-flex" } }}
          />
        </Box>

        {/* Real-time Streaming Controls Bar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Button
            variant={isStreaming ? "contained" : "outlined"}
            color={isStreaming ? "success" : "inherit"}
            size="small"
            startIcon={isStreaming ? <PauseIcon sx={{ fontSize: 14 }} /> : <PlayArrowIcon sx={{ fontSize: 14 }} />}
            onClick={() => setIsStreaming(!isStreaming)}
            sx={{ fontWeight: 700, px: 1.25, py: 0.35, fontSize: "0.725rem" }}
          >
            {isStreaming ? "LIVE (2.5s)" : "PAUSED"}
          </Button>

          <Tooltip title="รีเฟรชข้อมูลทันที">
            <IconButton
              size="small"
              onClick={() => {
                fetchMetrics();
                fetchBackups();
              }}
              sx={{ p: 0.4 }}
            >
              <RefreshIcon sx={{ fontSize: 18 }} className={loading ? "animate-spin" : ""} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Node Status Sub-bar */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          border: "1px solid",
          borderColor: "divider",
          mb: 3,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <FiberManualRecordIcon sx={{ fontSize: 10, color: "success.main" }} />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>Web Port</Typography>
            <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700, color: "text.primary" }}>
              {web?.port || 3000}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <FiberManualRecordIcon sx={{ fontSize: 10, color: "primary.main" }} />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>DB Host</Typography>
            <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700, color: "text.primary" }}>
              10.10.10.102
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <FiberManualRecordIcon sx={{ fontSize: 10, color: "secondary.main" }} />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>Tailscale IP</Typography>
            <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700, color: "text.primary" }}>
              100.125.250.85
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>อัปเดตล่าสุด</Typography>
          <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700, color: "success.main" }}>
            {lastStreamTime || "กำลังเชื่อมต่อ"}
          </Typography>
        </Box>
      </Paper>

      {/* ================= 2. DUAL-NODE STREAMING SYSTEM CARDS ================= */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* NODE 1: WEB APPLICATION HOST */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider", height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 2, mb: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PublicIcon color="primary" />
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip label="Node 1" size="small" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary" }}>
                      เครื่องเว็บแอปพลิเคชัน (App Server)
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {web?.service} • Platform {web?.platform}
                  </Typography>
                </Box>
              </Box>
              <Chip label="Active" size="small" color="success" variant="outlined" sx={{ fontWeight: 700, height: 22 }} />
            </Box>

            {/* Meters: CPU & RAM */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "grey.50" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <MemoryIcon fontSize="small" color="primary" />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>Web CPU</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 800 }}>
                      {web?.cpu.percent ?? 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(5, web?.cpu.percent || 0))}
                    color={(web?.cpu.percent || 0) > 80 ? "error" : "primary"}
                    sx={{ height: 6, borderRadius: 3, mb: 1 }}
                  />
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", display: "block" }}>
                    {web?.cpu.cores || 4} Cores Total
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "grey.50" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <SpeedIcon fontSize="small" color="secondary" />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>Web RAM</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 800 }}>
                      {web?.ram.percent ?? 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(5, web?.ram.percent || 0))}
                    color={(web?.ram.percent || 0) > 85 ? "error" : "secondary"}
                    sx={{ height: 6, borderRadius: 3, mb: 1 }}
                  />
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", display: "block" }}>
                    ใช้ {web?.ram.usedGB} GB จาก {web?.ram.totalGB} GB
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Hardware Info */}
            <Box sx={{ display: "flex", justifyContent: "space-between", p: 1.5, bgcolor: "grey.50", borderRadius: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>Heap Used</Typography>
                <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700 }}>{web?.ram.heapUsedMB} MB</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>Node Version</Typography>
                <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700 }}>{web?.nodeVersion}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>Uptime</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>{formatUptime(web?.uptimeSeconds || 0)}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* NODE 2: DATABASE SERVER (PROXMOX CT 102) */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider", height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 2, mb: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <StorageIcon color="success" />
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip label="Node 2" size="small" color="success" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary" }}>
                      เครื่องฐานข้อมูล (Database Server)
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "monospace" }}>
                    {dbNode?.hostname} • IP {dbNode?.ip}
                  </Typography>
                </Box>
              </Box>
              <Chip label="LXC CT 102" size="small" color="success" variant="outlined" sx={{ fontWeight: 700, height: 22 }} />
            </Box>

            {/* Meters: CPU, RAM, Disk */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "grey.50" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>DB CPU</Typography>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 800 }}>
                      {dbNode?.cpu.percent ?? 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(5, dbNode?.cpu.percent || 0))}
                    color="success"
                    sx={{ height: 6, borderRadius: 3, mb: 1 }}
                  />
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", display: "block" }}>
                    {dbNode?.cpu.cores} vCPUs
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "grey.50" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>DB RAM</Typography>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 800 }}>
                      {dbNode?.ram.percent ?? 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(5, dbNode?.ram.percent || 0))}
                    color="primary"
                    sx={{ height: 6, borderRadius: 3, mb: 1 }}
                  />
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", display: "block" }}>
                    ใช้ {dbNode?.ram.usedGB} GB จาก {dbNode?.ram.totalGB} GB
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "grey.50" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>ดิสก์ CT 102</Typography>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 800 }}>
                      {dbNode?.disk.percent ?? 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(5, dbNode?.disk.percent || 0))}
                    color="warning"
                    sx={{ height: 6, borderRadius: 3, mb: 1 }}
                  />
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", display: "block" }}>
                    เหลือ {dbNode?.disk.freeGB} GB จาก {dbNode?.disk.totalGB} GB
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Services Strip */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, bgcolor: "grey.50", borderRadius: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FiberManualRecordIcon sx={{ fontSize: 10, color: "success.main" }} />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>PostgreSQL (5432)</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700, color: "success.main" }}>
                    {pg?.latencyMs} ms ({pg?.activeConnections} conn)
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, bgcolor: "grey.50", borderRadius: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FiberManualRecordIcon sx={{ fontSize: 10, color: "success.main" }} />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>MinIO S3 (9000)</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700, color: "success.main" }}>
                    {minio?.latencyMs} ms ({minio?.objectCount} ไฟล์)
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* ================= 3. NAVIGATION TABS ================= */}
      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            px: { xs: 0.5, sm: 2 },
            "& .MuiTab-root": {
              minHeight: 44,
              fontWeight: 700,
              fontSize: { xs: "0.8125rem", sm: "0.875rem" },
              textTransform: "none",
            },
          }}
        >
          <Tab icon={<HubIcon fontSize="small" />} iconPosition="start" label="โครงข่าย 2 Server Nodes" />
          <Tab icon={<TableChartIcon fontSize="small" />} iconPosition="start" label="ความจุตาราง Database" />
          <Tab
            icon={<TerminalIcon fontSize="small" />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <span>Streaming Logs</span>
                <Chip label={filteredLogs.length} size="small" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }} />
              </Box>
            }
          />
          <Tab
            icon={<DataObjectIcon fontSize="small" />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <span>Snapshot & Backups</span>
                <Chip label={backups.length} size="small" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }} />
              </Box>
            }
          />
          <Tab icon={<VpnKeyIcon fontSize="small" />} iconPosition="start" label="ENV Config" />
        </Tabs>
      </Paper>

      {/* ================= TAB 0: SERVERS & TOPOLOGY ================= */}
      {activeTab === 0 && (
        <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 2, mb: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
            <HubIcon color="primary" />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                แผนผังการเชื่อมโยงระบบจริง (Live Network Topology & Data Flow)
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                โครงสร้างการสื่อสารและ Port Mapping ระหว่าง Web Host, Proxmox VE 8.x, CT 102, และ Docker Services
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
                    <PublicIcon fontSize="small" color="primary" />
                    1. Web Application Host
                  </Typography>
                  <Chip label="Online" size="small" color="success" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, fontSize: "0.8125rem" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Framework</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Next.js 16 App Router</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Port</Typography>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700, color: "primary.main" }}>
                      Port 3000
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Auth Engine</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "success.main" }}>NextAuth Live DB</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
                    <DnsIcon fontSize="small" color="warning" />
                    2. Proxmox VE 8.x Host
                  </Typography>
                  <Chip label="Online" size="small" color="success" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, fontSize: "0.8125rem" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Node Name</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>techniccom</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Tailscale IP</Typography>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700, color: "primary.main" }}>
                      100.125.250.85
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Local LAN IP</Typography>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700 }}>192.168.1.250</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
                    <StorageIcon fontSize="small" color="success" />
                    3. CT 102 (database server)
                  </Typography>
                  <Chip label="Running" size="small" color="success" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, fontSize: "0.8125rem" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Internal IP</Typography>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700, color: "secondary.main" }}>
                      10.10.10.102
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Postgres 16</Typography>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700, color: "success.main" }}>
                      Port 5432
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>MinIO S3</Typography>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700 }}>Port 9000 / 9001</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* ================= TAB 1: DATABASE STORAGE & TABLES & QUERIES ================= */}
      {activeTab === 1 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Table Stats */}
          <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflowX: "auto", width: "100%" }}>
            <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <TableChartIcon color="success" />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    ขนาดความจุของแต่ละตารางใน PostgreSQL ({dbNode?.disk.dbSizePretty || "0 MB"})
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    วิเคราะห์ขนาดตารางจริงและจำนวนแถวข้อมูล (Live Relation Tuples & Size)
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Table size="small">
              <TableHead sx={{ bgcolor: "grey.50" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>ชื่อตาราง (Table Name)</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>จำนวนแถวข้อมูล</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>ขนาดความจุ</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary" }}>สัดส่วนใน DB</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(pg?.tableStats || []).map((t) => {
                  const totalBytes = dbNode?.disk.dbSizeBytes || 1;
                  const percent = parseFloat(((t.sizeBytes / totalBytes) * 100).toFixed(1));

                  return (
                    <TableRow key={t.tableName} hover>
                      <TableCell sx={{ fontFamily: "monospace", fontWeight: 700 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <TableChartIcon fontSize="small" sx={{ color: "success.main" }} />
                          {t.tableName}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t.rowCount.toLocaleString()} แถว</TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontWeight: 700, color: "success.main" }}>
                        {t.sizePretty}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                          <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700 }}>
                            {percent}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.max(5, percent)}
                            color="success"
                            sx={{ width: 80, height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Active Live Queries */}
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1.5, mb: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <TerminalIcon color="primary" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  คำสั่ง SQL Query ที่กำลังทำงานสด (Active Queries)
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  ตรวจสอบคำสั่ง Database ที่กำลังรันในขณะนี้
                </Typography>
              </Box>
            </Box>

            {(pg?.activeQueries || []).length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center", bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                  ไม่มีคำสั่งค้าง Database พร้อมรับงานใหม่
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {pg?.activeQueries.map((q) => (
                  <Paper key={q.pid} variant="outlined" sx={{ p: 1.5, bgcolor: "grey.50" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                      <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700 }}>
                        PID {q.pid} ({q.user})
                      </Typography>
                      <Chip label={`${q.state} • ${q.duration}`} size="small" color="success" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }} />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        fontFamily: "monospace",
                        p: 1,
                        bgcolor: "background.paper",
                        borderRadius: 0.5,
                        wordBreak: "break-all",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      {q.query}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* ================= TAB 2: STREAMING REAL-TIME LOGS ================= */}
      {activeTab === 2 && (
        <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 2,
              pb: 2,
              mb: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <TerminalIcon color="secondary" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  บันทึกกิจกรรมสด (Live Logs)
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  อัปเดตแบบ Realtime ทุก 2.5 วินาที
                </Typography>
              </Box>
            </Box>

            <TextField
              size="small"
              placeholder="ค้นหา Log"
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              sx={{ width: { xs: "100%", sm: 280 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Box sx={{ maxHeight: 500, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
            {filteredLogs.length === 0 ? (
              <Box sx={{ p: 6, textAlign: "center", bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>ไม่พบบันทึกกิจกรรม</Typography>
              </Box>
            ) : (
              filteredLogs.map((log) => (
                <Paper
                  key={log.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                    <Chip
                      label={log.action}
                      size="small"
                      color={log.action.includes("BACKUP") ? "success" : log.action.includes("UPDATE") ? "primary" : "secondary"}
                      sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700, fontFamily: "monospace" }}
                    />
                    <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: "text.primary" }}>
                      {log.title}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
                    {log.user && (
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {log.user.name}
                      </Typography>
                    )}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: "0.875rem", color: "text.disabled" }} />
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {new Date(log.createdAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        </Paper>
      )}

      {/* ================= TAB 3: SNAPSHOTS & BACKUPS ================= */}
      {activeTab === 3 && (
        <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 2,
              pb: 2,
              mb: 2.5,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <DataObjectIcon color="warning" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  รายการ Snapshot ใน MinIO S3 ({backups.length} ไฟล์)
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  ไฟล์ JSON Snapshot สำรอง Users, Roles และ ActivityLogs ทั้งหมด
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={openCreateSnapshotModal}
              sx={{ fontWeight: 700 }}
            >
              สร้าง Snapshot ใหม่
            </Button>
          </Box>

          {backups.length === 0 ? (
            <Box sx={{ p: 6, textAlign: "center", bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                ยังไม่มีไฟล์สำรองข้อมูล กดปุ่มสร้าง Snapshot เพื่อสำรองข้อมูล
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflowX: "auto", width: "100%" }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>ชื่อ Snapshot และคำอธิบาย</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "text.secondary", display: { xs: "none", sm: "table-cell" } }}>ผู้สร้าง</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>ขนาดไฟล์</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "text.secondary", display: { xs: "none", md: "table-cell" } }}>วันที่บันทึก</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary" }}>ดาวน์โหลด</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {backups.map((b) => (
                    <TableRow key={b.key} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                          <DataObjectIcon fontSize="small" sx={{ color: "warning.main", mt: 0.25 }} />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{b.name}</Typography>
                            {b.description && (
                              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                                {b.description}
                              </Typography>
                            )}
                            <Typography variant="caption" sx={{ fontFamily: "monospace", color: "text.disabled", display: "block" }}>
                              {b.filename}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                        <Chip
                          icon={<PersonIcon sx={{ fontSize: "0.875rem !important" }} />}
                          label={b.creator}
                          size="small"
                          variant="outlined"
                          sx={{ height: 22, fontSize: "0.75rem" }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontWeight: 700 }}>{b.sizeKB} KB</TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: "0.8125rem", display: { xs: "none", md: "table-cell" } }}>
                        {new Date(b.lastModified).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          component="a"
                          href={`/api/files/${b.key}`}
                          download={b.filename}
                          target="_blank"
                          rel="noreferrer"
                          size="small"
                          variant="outlined"
                          startIcon={<DownloadIcon fontSize="small" />}
                          sx={{ fontWeight: 700 }}
                        >
                          ดาวน์โหลด
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* ================= TAB 4: ENVIRONMENT CONFIG ================= */}
      {activeTab === 4 && (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflowX: "auto", width: "100%" }}>
          <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
            <VpnKeyIcon color="warning" />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                การตั้งค่าตัวแปรระบบ (Environment Variables Inspector)
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                ตรวจสอบค่าคอนฟิกที่โหลดในระบบ ค่าสำคัญจะถูกปิดบังเพื่อความปลอดภัย
              </Typography>
            </Box>
          </Box>

          <Table size="small">
            <TableHead sx={{ bgcolor: "grey.50" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Variable Key</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Configured Value</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {STATIC_ENV_CONFIG.map((env) => (
                <TableRow key={env.key} hover>
                  <TableCell sx={{ fontFamily: "monospace", fontWeight: 700 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {env.isSecret && <VpnKeyIcon fontSize="small" sx={{ color: "warning.main" }} />}
                      {env.key}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={env.type} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }} />
                  </TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>
                    {env.isSecret ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <span>{revealedSecrets[env.key] ? env.value : "••••••••••••••••"}</span>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => toggleReveal(env.key)}
                          sx={{ fontSize: "0.75rem", minWidth: "auto", p: 0.5 }}
                        >
                          {revealedSecrets[env.key] ? "ซ่อน" : "แสดง"}
                        </Button>
                      </Box>
                    ) : (
                      <span>{env.value}</span>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      icon={<CheckIcon sx={{ fontSize: "0.875rem !important" }} />}
                      label="Loaded"
                      size="small"
                      color="success"
                      sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ================= SNAPSHOT CREATION MODAL ================= */}
      <Dialog
        open={showSnapshotModal}
        onClose={() => setShowSnapshotModal(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BackupIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              สร้าง Snapshot สำรองข้อมูลระบบ
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setShowSnapshotModal(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleCreateBackupSubmit}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="ชื่อ Snapshot"
              required
              fullWidth
              size="small"
              placeholder="เช่น Snapshot_ก่อนเริ่มเทอมใหม่ หรือ Full_Backup_2026"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
            />

            <TextField
              label="คำอธิบายเพิ่มเติมหรือบันทึกช่วยจำ"
              multiline
              rows={3}
              fullWidth
              size="small"
              placeholder="เช่น สำรองข้อมูลผู้ใช้งานและยศสิทธิ์ทั้งหมดก่อนอัปเดตระบบ"
              value={snapshotDescription}
              onChange={(e) => setSnapshotDescription(e.target.value)}
            />

            <Paper variant="outlined" sx={{ p: 2, bgcolor: "primary.50", borderColor: "primary.200" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <InfoIcon fontSize="small" color="primary" />
                <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                  ข้อมูลที่จะถูกสำรองและบันทึกลงในไฟล์ Snapshot
                </Typography>
              </Box>
              <Grid container spacing={1}>
                <Grid size={{ xs: 4 }}>
                  <Paper sx={{ p: 1, textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>บัญชีผู้ใช้</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {metrics?.databaseServerNode.services.postgres.tableStats.find(t => t.tableName === "User")?.rowCount ?? 0} บัญชี
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Paper sx={{ p: 1, textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>ยศหรือสิทธิ์</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {metrics?.databaseServerNode.services.postgres.tableStats.find(t => t.tableName === "RoleDefinition")?.rowCount ?? 0} สิทธิ์
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Paper sx={{ p: 1, textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>ปลายทาง</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "secondary.main" }}>MinIO S3</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShowSnapshotModal(false)} disabled={backingUp} color="inherit">
              ยกเลิก
            </Button>
            <Button type="submit" variant="contained" disabled={backingUp} startIcon={backingUp ? <CircularProgress size={16} /> : <BackupIcon />}>
              {backingUp ? "กำลังสร้าง Snapshot..." : "ยืนยันการสร้าง Snapshot"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", boxShadow: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
