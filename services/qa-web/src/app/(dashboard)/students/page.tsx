"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import Divider from "@mui/material/Divider";

// Icons from @mui/icons-material
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import TableChartIcon from "@mui/icons-material/TableChart";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { useAcademicYear } from "@/components/layout/AcademicYearContext";
import { usePermission } from "@/hooks/usePermission";
import { parseThaiName, countLines, splitLines } from "@/lib/parseThaiName";
import * as XLSX from "xlsx";

interface StudentItem {
  id: string;
  studentCode: string;
  prefix: string;
  firstName: string;
  lastName: string;
  level: string;
  year: string;
  majorName: string;
  majorCode: string;
  room: string;
  status: "ACTIVE" | "GRADUATED" | "SUSPENDED" | "DROPPED";
  academicYear: string;
  semester: string;
  advisorId?: string | null;
  advisor?: { id: string; name: string } | null;
  createdAt: string;
}

interface StatsData {
  totalStudents: number;
  activeStudents: number;
  vocationalCount: number;
  highVocationalCount: number;
  maleCount: number;
  femaleCount: number;
  retentionRate: number;
}

const STATUS_MAP: Record<string, { label: string; color: "success" | "info" | "warning" | "error" | "default" }> = {
  ACTIVE: { label: "กำลังศึกษา", color: "success" },
  GRADUATED: { label: "สำเร็จการศึกษา", color: "info" },
  SUSPENDED: { label: "พักการเรียน", color: "warning" },
  DROPPED: { label: "พ้นสภาพ", color: "error" },
};

const COMMON_MAJORS = [
  { name: "ช่างเทคนิคคอมพิวเตอร์", code: "ชทค" },
  { name: "เทคโนโลยีสารสนเทศ", code: "สทค" },
  { name: "ช่างอิเล็กทรอนิกส์", code: "ชอท" },
  { name: "ช่างไฟฟ้ากำลัง", code: "ชฟก" },
  { name: "การบัญชี", code: "พบช" },
];

export default function StudentsPage() {
  const { selectedYear, selectedSemester, termLabel } = useAcademicYear();
  const { hasPermission } = usePermission();
  const canImport = hasPermission("students.import");
  const canEdit = hasPermission("students.edit");
  const canExport = hasPermission("students.export");

  const [majorsList, setMajorsList] = useState(COMMON_MAJORS);

  // State: Data
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [stats, setStats] = useState<StatsData>({
    totalStudents: 0,
    activeStudents: 0,
    vocationalCount: 0,
    highVocationalCount: 0,
    maleCount: 0,
    femaleCount: 0,
    retentionRate: 100,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  // State: Filter & Pagination
  const [search, setSearch] = useState<string>("");
  const [filterLevel, setFilterLevel] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);

  // State: Feedback
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" | "warning" }>({
    open: false,
    message: "",
    severity: "info",
  });

  // State: Bulk Import Dialog
  const [importDialogOpen, setImportDialogOpen] = useState<boolean>(false);
  const [importTab, setImportTab] = useState<number>(0);
  const [importLevel, setImportLevel] = useState<string>("ปวช");
  const [importYear, setImportYear] = useState<string>("1");
  const [importMajorName, setImportMajorName] = useState<string>("ช่างเทคนิคคอมพิวเตอร์");
  const [importMajorCode, setImportMajorCode] = useState<string>("ชทค");
  const [importRoom, setImportRoom] = useState<string>("1");
  const [importInputIds, setImportInputIds] = useState<string>("");
  const [importInputNames, setImportInputNames] = useState<string>("");
  const [excelRows, setExcelRows] = useState<any[]>([]);
  const [importSubmitting, setImportSubmitting] = useState<boolean>(false);

  // State: Single Add/Edit Dialog
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Partial<StudentItem> | null>(null);
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);

  // State: Delete Confirm Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  // ==================== FETCH DATA ====================
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
        academicYear: selectedYear,
        semester: selectedSemester,
      });
      if (search) params.set("search", search);
      if (filterLevel) params.set("level", filterLevel);
      if (filterYear) params.set("year", filterYear);
      if (filterStatus) params.set("status", filterStatus);

      const res = await fetch(`/api/students?${params.toString()}`);
      if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลนักเรียนได้");
      const data = await res.json();
      setStudents(data.students || []);
      setTotalCount(data.pagination?.total || 0);
    } catch (err: any) {
      console.error(err);
      setSnackbar({ open: true, message: err.message || "เกิดข้อผิดพลาด", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, selectedYear, selectedSemester, search, filterLevel, filterYear, filterStatus]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const params = new URLSearchParams({
        academicYear: selectedYear,
        semester: selectedSemester,
      });
      const res = await fetch(`/api/students/stats?${params.toString()}`);
      if (!res.ok) throw new Error("ไม่สามารถดึงสถิติได้");
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  }, [selectedYear, selectedSemester]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetch("/api/admin/curriculum?active=true")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.majors) && data.majors.length > 0) {
          setMajorsList(data.majors);
        }
      })
      .catch(() => {});
  }, []);

  // Handle Major select auto-fills code
  const handleMajorSelect = (majorName: string) => {
    setImportMajorName(majorName);
    const found = majorsList.find((m) => m.name === majorName);
    if (found) setImportMajorCode(found.code);
  };

  // Dual Textarea line count and preview
  const idLinesCount = useMemo(() => countLines(importInputIds), [importInputIds]);
  const nameLinesCount = useMemo(() => countLines(importInputNames), [importInputNames]);
  const isLineCountMatched = idLinesCount > 0 && idLinesCount === nameLinesCount;

  const previewList = useMemo(() => {
    const ids = splitLines(importInputIds);
    const names = splitLines(importInputNames);
    const maxLen = Math.max(ids.length, names.length);
    const list: Array<{ id: string; prefix: string; firstName: string; lastName: string }> = [];

    for (let i = 0; i < Math.min(maxLen, 10); i++) {
      const parsed = names[i] ? parseThaiName(names[i]) : { prefix: "-", firstName: "-", lastName: "-" };
      list.push({
        id: ids[i] || "-",
        prefix: parsed.prefix,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
      });
    }
    return list;
  }, [importInputIds, importInputNames]);

  // ==================== ACTIONS ====================

  // Bulk Import Submit
  const handleBulkImportSubmit = async () => {
    try {
      setImportSubmitting(true);

      let payload: any = {};

      if (importTab === 0) {
        // Dual Textarea
        if (!isLineCountMatched) {
          throw new Error("จำนวนแถวของรหัสนักศึกษาและรายชื่อไม่เท่ากัน");
        }
        payload = {
          ids: splitLines(importInputIds),
          names: splitLines(importInputNames),
          level: importLevel,
          year: importYear,
          majorName: importMajorName,
          majorCode: importMajorCode,
          room: importRoom,
          academicYear: selectedYear,
          semester: selectedSemester,
        };
      } else {
        // Excel/CSV
        if (excelRows.length === 0) {
          throw new Error("ไม่มีข้อมูลในไฟล์ Excel/CSV ที่อัปโหลด");
        }
        payload = {
          items: excelRows.map((row) => ({
            studentCode: String(row.studentCode || row["รหัสนักศึกษา"] || "").trim(),
            fullName: String(row.fullName || row["ชื่อ-นามสกุล"] || row["ชื่อ นามสกุล"] || "").trim(),
            prefix: String(row.prefix || row["คำนำหน้า"] || "").trim(),
            firstName: String(row.firstName || row["ชื่อ"] || "").trim(),
            lastName: String(row.lastName || row["นามสกุล"] || "").trim(),
            level: String(row.level || row["ระดับชั้น"] || importLevel).trim(),
            year: String(row.year || row["ชั้นปี"] || importYear).trim(),
            majorName: String(row.majorName || row["สาขาวิชา"] || importMajorName).trim(),
            majorCode: String(row.majorCode || row["รหัสสาขา"] || importMajorCode).trim(),
            room: String(row.room || row["ห้อง"] || row["กลุ่ม"] || importRoom).trim(),
            academicYear: selectedYear,
            semester: selectedSemester,
          })),
        };
      }

      const res = await fetch("/api/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการนำเข้า");

      setSnackbar({
        open: true,
        message: data.message || `นำเข้าสำเร็จ ${data.count} คน`,
        severity: "success",
      });
      setImportDialogOpen(false);
      setImportInputIds("");
      setImportInputNames("");
      setExcelRows([]);
      fetchStudents();
      fetchStats();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "เกิดข้อผิดพลาด", severity: "error" });
    } finally {
      setImportSubmitting(false);
    }
  };

  // Excel file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws);
        setExcelRows(data);
        setSnackbar({
          open: true,
          message: `อ่านข้อมูลจากไฟล์สำเร็จ ${data.length} รายการ`,
          severity: "info",
        });
      } catch (err: any) {
        setSnackbar({ open: true, message: "ไม่สามารถอ่านไฟล์ Excel/CSV ได้", severity: "error" });
      }
    };
    reader.readAsBinaryString(file);
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        รหัสนักศึกษา: "66209010001",
        คำนำหน้า: "นาย",
        ชื่อ: "สมชาย",
        นามสกุล: "ใจมั่น",
        ระดับชั้น: "ปวช",
        ชั้นปี: "1",
        สาขาวิชา: "ช่างเทคนิคคอมพิวเตอร์",
        รหัสสาขา: "ชทค",
        ห้อง: "1",
      },
      {
        รหัสนักศึกษา: "66209010002",
        คำนำหน้า: "นางสาว",
        ชื่อ: "วิภาดา",
        นามสกุล: "แก้วเกิด",
        ระดับชั้น: "ปวช",
        ชั้นปี: "1",
        สาขาวิชา: "ช่างเทคนิคคอมพิวเตอร์",
        รหัสสาขา: "ชทค",
        ห้อง: "1",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "แบบฟอร์มนำเข้านักเรียน");
    XLSX.writeFile(wb, "เทมเพลตนำเข้านักศึกษา_TechSAR.xlsx");
  };

  // Export Current Students to CSV with Thai BOM \uFEFF and ="" formatting
  const handleExportCSV = () => {
    if (students.length === 0) {
      setSnackbar({ open: true, message: "ไม่มีข้อมูลนักเรียนที่จะส่งออก", severity: "warning" });
      return;
    }

    const headers = [
      "รหัสนักศึกษา",
      "คำนำหน้า",
      "ชื่อ",
      "นามสกุล",
      "ระดับชั้น",
      "ชั้นปี",
      "สาขาวิชา",
      "รหัสสาขา",
      "ห้อง",
      "สถานะ",
      "ปีการศึกษา",
      "ภาคเรียน",
    ];

    const rows = students.map((s) => [
      `="${s.studentCode}"`, // Force Excel text format (avoid scientific notation)
      s.prefix,
      s.firstName,
      s.lastName,
      s.level,
      s.year,
      s.majorName,
      s.majorCode,
      s.room,
      STATUS_MAP[s.status]?.label || s.status,
      s.academicYear,
      s.semester,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `รายชื่อนักศึกษา_${selectedYear}_เทอม${selectedSemester}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Single Save (Add/Edit) Submit
  const handleSingleSaveSubmit = async () => {
    if (!editingStudent) return;
    try {
      setEditSubmitting(true);
      const isEdit = Boolean(editingStudent.id);
      const url = isEdit ? `/api/students/${editingStudent.id}` : "/api/students";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        studentCode: editingStudent.studentCode,
        prefix: editingStudent.prefix || "นาย",
        firstName: editingStudent.firstName,
        lastName: editingStudent.lastName,
        level: editingStudent.level || "ปวช",
        year: editingStudent.year || "1",
        majorName: editingStudent.majorName || "ช่างเทคนิคคอมพิวเตอร์",
        majorCode: editingStudent.majorCode || "ชทค",
        room: editingStudent.room || "1",
        status: editingStudent.status || "ACTIVE",
        academicYear: editingStudent.academicYear || selectedYear,
        semester: editingStudent.semester || selectedSemester,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");

      setSnackbar({
        open: true,
        message: isEdit ? "แก้ไขข้อมูลนักเรียนสำเร็จ" : "เพิ่มนักเรียนสำเร็จ",
        severity: "success",
      });
      setEditDialogOpen(false);
      setEditingStudent(null);
      fetchStudents();
      fetchStats();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "เกิดข้อผิดพลาด", severity: "error" });
    } finally {
      setEditSubmitting(false);
    }
  };

  // Delete Submit
  const handleDeleteSubmit = async () => {
    if (!studentToDelete) return;
    try {
      setDeleteSubmitting(true);
      const res = await fetch(`/api/students/${studentToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการลบ");

      setSnackbar({ open: true, message: "ลบข้อมูลนักเรียนสำเร็จ", severity: "success" });
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      fetchStudents();
      fetchStats();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "เกิดข้อผิดพลาด", severity: "error" });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.25, sm: 2 }, maxWidth: 1300, mx: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* 1. Ultra-Compact Page Header (Standardized as per GEMINI.md) */}
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
        {/* LEFT: Back Button + Title + Info + Standard Tag */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="กลับภาพรวมงานนักเรียน">
            <IconButton
              component={Link}
              href="/dashboard/students"
              size="small"
              sx={{ color: "text.secondary", p: 0.4 }}
              aria-label="ย้อนกลับ"
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Typography variant="h2" sx={{ fontWeight: 700, fontSize: "1.125rem", color: "text.primary" }}>
            ทะเบียนข้อมูลนักเรียนและนักศึกษา
          </Typography>

          <Tooltip title="ระบบจัดการและนำเข้าข้อมูลทะเบียนนักเรียนนักศึกษา พร้อมจำแนกสาขาและสถานะ">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Chip size="small" label="มาตรฐานที่ 1 SAR" color="primary" variant="outlined" sx={{ height: 20, fontSize: "0.6875rem" }} />
        </Box>

        {/* RIGHT: Academic Term + Action Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Chip
            icon={<CalendarTodayIcon sx={{ fontSize: 13 }} />}
            label={`รอบข้อมูล ${termLabel}`}
            variant="outlined"
            size="small"
            sx={{ height: 22, fontSize: "0.725rem", display: { xs: "none", sm: "inline-flex" } }}
          />

          {canExport && (
            <Tooltip title="ส่งออกไฟล์ CSV พร้อม BOM ภาษาไทย">
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadIcon sx={{ fontSize: 15 }} />}
                onClick={handleExportCSV}
                sx={{ px: 1, py: 0.35, fontSize: "0.75rem", display: { xs: "none", md: "inline-flex" } }}
              >
                ส่งออก CSV
              </Button>
            </Tooltip>
          )}

          {canEdit && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<PersonAddIcon sx={{ fontSize: 15 }} />}
              onClick={() => {
                setEditingStudent({
                  studentCode: "",
                  prefix: "นาย",
                  firstName: "",
                  lastName: "",
                  level: "ปวช",
                  year: "1",
                  majorName: "ช่างเทคนิคคอมพิวเตอร์",
                  majorCode: "ชทค",
                  room: "1",
                  status: "ACTIVE",
                  academicYear: selectedYear,
                  semester: selectedSemester,
                });
                setEditDialogOpen(true);
              }}
              sx={{ px: 1, py: 0.35, fontSize: "0.75rem" }}
            >
              เพิ่มรายคน
            </Button>
          )}

          {/* Primary CTA Button */}
          {canImport && (
            <Button
              variant="contained"
              size="small"
              startIcon={<FileUploadIcon sx={{ fontSize: 15 }} />}
              onClick={() => setImportDialogOpen(true)}
              sx={{ px: 1.25, py: 0.35, fontSize: "0.75rem", fontWeight: 600 }}
            >
              นำเข้านักศึกษา
            </Button>
          )}
        </Box>
      </Box>

      {/* 2. Compact KPI Summary Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 1.5,
        }}
      >
        <Paper sx={{ p: 1.25 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.25, fontSize: "0.75rem" }}>
            จำนวนนักเรียนและนักศึกษาทั้งหมด
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" sx={{ color: "text.primary", fontSize: "1.25rem", fontWeight: 700 }}>
              {statsLoading ? "..." : `${stats.totalStudents.toLocaleString()} คน`}
            </Typography>
            <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600, fontSize: "0.725rem" }}>
              ปวช {stats.vocationalCount} • ปวส {stats.highVocationalCount}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", ml: "auto" }}>
              ชาย {stats.maleCount} / หญิง {stats.femaleCount}
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 1.25 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.25, fontSize: "0.75rem" }}>
            อัตราการคงอยู่ของผู้เรียน
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" sx={{ color: "text.primary", fontSize: "1.25rem", fontWeight: 700 }}>
              {statsLoading ? "..." : `${stats.retentionRate}%`}
            </Typography>
            <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.725rem" }}>
              กำลังศึกษา {stats.activeStudents} คน
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", ml: "auto" }}>
              เกณฑ์ สอศ. ≥ 90%
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* 3. Search & Filter Bar */}
      <Paper sx={{ p: 1.25, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
        <TextField
          size="small"
          placeholder="ค้นหารหัส หรือชื่อ-นามสกุล..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 220, flex: { xs: "1 1 100%", sm: "1 1 auto" } }}
        />

        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>ระดับชั้น</InputLabel>
          <Select
            value={filterLevel}
            label="ระดับชั้น"
            onChange={(e) => {
              setFilterLevel(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">ทั้งหมด</MenuItem>
            <MenuItem value="ปวช">ปวช</MenuItem>
            <MenuItem value="ปวส">ปวส</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 90 }}>
          <InputLabel>ชั้นปี</InputLabel>
          <Select
            value={filterYear}
            label="ชั้นปี"
            onChange={(e) => {
              setFilterYear(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">ทั้งหมด</MenuItem>
            <MenuItem value="1">ปี 1</MenuItem>
            <MenuItem value="2">ปี 2</MenuItem>
            <MenuItem value="3">ปี 3</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>สถานะ</InputLabel>
          <Select
            value={filterStatus}
            label="สถานะ"
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">ทั้งหมด</MenuItem>
            <MenuItem value="ACTIVE">กำลังศึกษา</MenuItem>
            <MenuItem value="GRADUATED">สำเร็จการศึกษา</MenuItem>
            <MenuItem value="SUSPENDED">พักการเรียน</MenuItem>
            <MenuItem value="DROPPED">พ้นสภาพ</MenuItem>
          </Select>
        </FormControl>

        <Tooltip title="รีเฟรชข้อมูล">
          <IconButton size="small" onClick={() => { fetchStudents(); fetchStats(); }} sx={{ ml: "auto" }}>
            <RefreshIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* 4. Student Data Table */}
      <Paper sx={{ overflow: "hidden" }}>
        {loading && <LinearProgress />}
        <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h4" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
            รายชื่อนักเรียนนักศึกษา ({totalCount.toLocaleString()} รายการ)
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            ประจำ {termLabel}
          </Typography>
        </Box>

        <TableContainer sx={{ maxHeight: 600 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: 130 }}>รหัสนักศึกษา</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>ชื่อ - นามสกุล</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>ระดับชั้น / สาขาวิชา</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 70 }}>ห้อง</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>ครูที่ปรึกษา</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 100 }} align="center">สถานะ</TableCell>
                {canEdit && <TableCell sx={{ fontWeight: 700, width: 90 }} align="center">จัดการ</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 7 : 6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      ไม่พบข้อมูลนักเรียน กรุณากดปุ่ม <b>"นำเข้านักศึกษา"</b> หรือ <b>"เพิ่มรายคน"</b> เพื่อเริ่มต้นบันทึกข้อมูล
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((std) => (
                  <TableRow key={std.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "monospace", fontSize: "0.8125rem" }}>
                        {std.studentCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: "0.8125rem" }}>
                        {std.prefix} {std.firstName} {std.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: "text.primary", display: "block", fontWeight: 600 }}>
                        {std.level}.{std.year} {std.majorName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.6875rem" }}>
                        ({std.majorCode})
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={`กลุ่ม ${std.room}`} variant="outlined" sx={{ height: 20, fontSize: "0.6875rem" }} />
                    </TableCell>
                    <TableCell>
                      {std.advisor?.name ? (
                        <Chip size="small" label={std.advisor.name} color="primary" variant="outlined" sx={{ height: 20, fontSize: "0.6875rem" }} />
                      ) : (
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={STATUS_MAP[std.status]?.label || std.status}
                        color={STATUS_MAP[std.status]?.color || "default"}
                        sx={{ height: 20, fontSize: "0.6875rem", fontWeight: 600 }}
                      />
                    </TableCell>
                    {canEdit && (
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                          <Tooltip title="แก้ไข">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingStudent(std);
                                setEditDialogOpen(true);
                              }}
                              sx={{ p: 0.3 }}
                            >
                              <EditIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="ลบ">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setStudentToDelete(std);
                                setDeleteDialogOpen(true);
                              }}
                              sx={{ p: 0.3 }}
                            >
                              <DeleteIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="แสดงต่อหน้า:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`}
          sx={{ borderTop: "1px solid", borderColor: "divider" }}
        />
      </Paper>

      {/* ==================== 5. BULK IMPORT DIALOG (Adapted from activity_attendance_System) ==================== */}
      <Dialog
        open={importDialogOpen}
        onClose={() => !importSubmitting && setImportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem", pb: 1 }}>
          นำเข้าข้อมูลนักเรียนนักศึกษาแบบกลุ่ม
        </DialogTitle>

        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
          {/* Target Section Selectors */}
          <Box sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1 }}>
              ระบุห้องเรียนเป้าหมายที่จะนำเข้า (รอบข้อมูล {termLabel})
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(5, 1fr)" }, gap: 1 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>ระดับชั้น</InputLabel>
                <Select value={importLevel} label="ระดับชั้น" onChange={(e) => setImportLevel(e.target.value)}>
                  <MenuItem value="ปวช">ปวช</MenuItem>
                  <MenuItem value="ปวส">ปวส</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>ชั้นปี</InputLabel>
                <Select value={importYear} label="ชั้นปี" onChange={(e) => setImportYear(e.target.value)}>
                  <MenuItem value="1">ปี 1</MenuItem>
                  <MenuItem value="2">ปี 2</MenuItem>
                  <MenuItem value="3">ปี 3</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth sx={{ gridColumn: { xs: "span 2", sm: "span 1" } }}>
                <InputLabel>สาขาวิชา</InputLabel>
                <Select
                  value={importMajorName}
                  label="สาขาวิชา"
                  onChange={(e) => handleMajorSelect(e.target.value)}
                >
                  {majorsList.map((m) => (
                    <MenuItem key={m.name} value={m.name}>
                      {m.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                label="รหัสย่อสาขา"
                value={importMajorCode}
                onChange={(e) => setImportMajorCode(e.target.value)}
                fullWidth
              />

              <FormControl size="small" fullWidth>
                <InputLabel>ห้อง / กลุ่ม</InputLabel>
                <Select value={importRoom} label="ห้อง / กลุ่ม" onChange={(e) => setImportRoom(e.target.value)}>
                  <MenuItem value="1">กลุ่ม 1</MenuItem>
                  <MenuItem value="2">กลุ่ม 2</MenuItem>
                  <MenuItem value="3">กลุ่ม 3</MenuItem>
                  <MenuItem value="4">กลุ่ม 4</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Import Mode Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={importTab} onChange={(_, val) => setImportTab(val)}>
              <Tab
                icon={<ContentPasteIcon sx={{ fontSize: 16 }} />}
                iconPosition="start"
                label="คัดลอกและวาง (Dual-Textarea)"
                sx={{ fontSize: "0.8125rem", minHeight: 40 }}
              />
              <Tab
                icon={<TableChartIcon sx={{ fontSize: 16 }} />}
                iconPosition="start"
                label="อัปโหลดไฟล์ Excel / CSV"
                sx={{ fontSize: "0.8125rem", minHeight: 40 }}
              />
            </Tabs>
          </Box>

          {/* TAB 0: Dual Textarea Mode */}
          {importTab === 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      1. รหัสนักศึกษา (11 หลัก หนึ่งบรรทัดต่อคน)
                    </Typography>
                    <Chip size="small" label={`${idLinesCount} แถว`} color={idLinesCount > 0 ? "primary" : "default"} sx={{ height: 18, fontSize: "0.625rem" }} />
                  </Box>
                  <TextField
                    multiline
                    rows={8}
                    fullWidth
                    placeholder={`66209010001\n66209010002\n66209010003`}
                    value={importInputIds}
                    onChange={(e) => setImportInputIds(e.target.value)}
                    sx={{ "& textarea": { fontFamily: "monospace", fontSize: "0.8125rem" } }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      2. รายชื่อ นามสกุล (มีคำนำหน้า หรือไม่มีก็ได้)
                    </Typography>
                    <Chip size="small" label={`${nameLinesCount} แถว`} color={nameLinesCount > 0 ? "primary" : "default"} sx={{ height: 18, fontSize: "0.625rem" }} />
                  </Box>
                  <TextField
                    multiline
                    rows={8}
                    fullWidth
                    placeholder={`นายสมชาย ใจมั่น\nนางสาววิภาดา แก้วเกิด\nด.ช.ณัฐวุฒิ สดใส`}
                    value={importInputNames}
                    onChange={(e) => setImportInputNames(e.target.value)}
                    sx={{ "& textarea": { fontSize: "0.8125rem" } }}
                  />
                </Box>
              </Box>

              {/* Line count check indicator */}
              {idLinesCount > 0 && nameLinesCount > 0 && (
                <Alert
                  severity={isLineCountMatched ? "success" : "warning"}
                  icon={isLineCountMatched ? <CheckCircleIcon fontSize="inherit" /> : <WarningAmberIcon fontSize="inherit" />}
                  sx={{ py: 0.25 }}
                >
                  {isLineCountMatched
                    ? `ข้อมูลแถวตรงกันสมบูรณ์ (${idLinesCount} คน) ระบบจะแยกคำนำหน้า/ชื่อ/นามสกุล อัตโนมัติ`
                    : `จำนวนแถวไม่ตรงกัน! รหัสมี ${idLinesCount} แถว แต่ชื่อมี ${nameLinesCount} แถว (ต้องเท่ากัน)`}
                </Alert>
              )}

              {/* Live Preview of parsed names */}
              {previewList.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: "block", mb: 0.5 }}>
                    ตัวอย่างข้อมูลที่แยกได้ (แสดงสูงสุด 10 รายการแรก):
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ py: 0.5, fontSize: "0.75rem", fontWeight: 700 }}>รหัส</TableCell>
                          <TableCell sx={{ py: 0.5, fontSize: "0.75rem", fontWeight: 700 }}>คำนำหน้า</TableCell>
                          <TableCell sx={{ py: 0.5, fontSize: "0.75rem", fontWeight: 700 }}>ชื่อจริง</TableCell>
                          <TableCell sx={{ py: 0.5, fontSize: "0.75rem", fontWeight: 700 }}>นามสกุล</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {previewList.map((p, idx) => (
                          <TableRow key={idx}>
                            <TableCell sx={{ py: 0.4, fontSize: "0.75rem", fontFamily: "monospace" }}>{p.id}</TableCell>
                            <TableCell sx={{ py: 0.4, fontSize: "0.75rem" }}>{p.prefix}</TableCell>
                            <TableCell sx={{ py: 0.4, fontSize: "0.75rem" }}>{p.firstName}</TableCell>
                            <TableCell sx={{ py: 0.4, fontSize: "0.75rem" }}>{p.lastName}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}

          {/* TAB 1: Excel / CSV File Upload Mode */}
          {importTab === 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  เลือกไฟล์ Excel (.xlsx, .xls) หรือ CSV ที่มีคอลัมน์: รหัสนักศึกษา, ชื่อ-นามสกุล
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownloadIcon sx={{ fontSize: 15 }} />}
                  onClick={handleDownloadTemplate}
                  sx={{ fontSize: "0.75rem" }}
                >
                  ดาวน์โหลดไฟล์เทมเพลต Excel
                </Button>
              </Box>

              <Box
                component="label"
                sx={{
                  border: "2px dashed",
                  borderColor: "primary.main",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  bgcolor: "action.hover",
                  "&:hover": { bgcolor: "action.selected" },
                  display: "block",
                }}
              >
                <FileUploadIcon sx={{ fontSize: 36, color: "primary.main", mb: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  รองรับไฟล์ .xlsx, .xls, .csv
                </Typography>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
              </Box>

              {excelRows.length > 0 && (
                <Alert severity="success" sx={{ py: 0.5 }}>
                  พร้อมนำเข้าข้อมูลจากไฟล์จำนวน <b>{excelRows.length}</b> รายการ
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setImportDialogOpen(false)} disabled={importSubmitting}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleBulkImportSubmit}
            disabled={
              importSubmitting ||
              (importTab === 0 && !isLineCountMatched) ||
              (importTab === 1 && excelRows.length === 0)
            }
            startIcon={importSubmitting ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          >
            {importSubmitting ? "กำลังนำเข้า..." : `ยืนยันนำเข้า (${importTab === 0 ? idLinesCount : excelRows.length} คน)`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== 6. ADD / EDIT STUDENT DIALOG ==================== */}
      <Dialog
        open={editDialogOpen}
        onClose={() => !editSubmitting && setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
          {editingStudent?.id ? "แก้ไขข้อมูลนักเรียนนักศึกษา" : "เพิ่มข้อมูลนักเรียนนักศึกษา"}
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 1 }}>
            <TextField
              size="small"
              label="รหัสนักศึกษา (11 หลัก)"
              value={editingStudent?.studentCode || ""}
              onChange={(e) => setEditingStudent((prev) => ({ ...prev, studentCode: e.target.value }))}
              required
            />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 1 }}>
              <FormControl size="small">
                <InputLabel>คำนำหน้า</InputLabel>
                <Select
                  value={editingStudent?.prefix || "นาย"}
                  label="คำนำหน้า"
                  onChange={(e) => setEditingStudent((prev) => ({ ...prev, prefix: e.target.value }))}
                >
                  <MenuItem value="นาย">นาย</MenuItem>
                  <MenuItem value="นางสาว">นางสาว</MenuItem>
                  <MenuItem value="เด็กชาย">เด็กชาย</MenuItem>
                  <MenuItem value="เด็กหญิง">เด็กหญิง</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="ชื่อจริง"
                value={editingStudent?.firstName || ""}
                onChange={(e) => setEditingStudent((prev) => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </Box>
          </Box>

          <TextField
            size="small"
            label="นามสกุล"
            value={editingStudent?.lastName || ""}
            onChange={(e) => setEditingStudent((prev) => ({ ...prev, lastName: e.target.value }))}
            required
            fullWidth
          />

          <Divider sx={{ my: 0.5 }} />

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
            <FormControl size="small">
              <InputLabel>ระดับชั้น</InputLabel>
              <Select
                value={editingStudent?.level || "ปวช"}
                label="ระดับชั้น"
                onChange={(e) => setEditingStudent((prev) => ({ ...prev, level: e.target.value }))}
              >
                <MenuItem value="ปวช">ปวช</MenuItem>
                <MenuItem value="ปวส">ปวส</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>ชั้นปี</InputLabel>
              <Select
                value={editingStudent?.year || "1"}
                label="ชั้นปี"
                onChange={(e) => setEditingStudent((prev) => ({ ...prev, year: e.target.value }))}
              >
                <MenuItem value="1">ปี 1</MenuItem>
                <MenuItem value="2">ปี 2</MenuItem>
                <MenuItem value="3">ปี 3</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>ห้อง / กลุ่ม</InputLabel>
              <Select
                value={editingStudent?.room || "1"}
                label="ห้อง / กลุ่ม"
                onChange={(e) => setEditingStudent((prev) => ({ ...prev, room: e.target.value }))}
              >
                <MenuItem value="1">กลุ่ม 1</MenuItem>
                <MenuItem value="2">กลุ่ม 2</MenuItem>
                <MenuItem value="3">กลุ่ม 3</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 1 }}>
            <TextField
              size="small"
              label="สาขาวิชา"
              value={editingStudent?.majorName || ""}
              onChange={(e) => setEditingStudent((prev) => ({ ...prev, majorName: e.target.value }))}
              fullWidth
            />
            <TextField
              size="small"
              label="รหัสสาขา"
              value={editingStudent?.majorCode || ""}
              onChange={(e) => setEditingStudent((prev) => ({ ...prev, majorCode: e.target.value }))}
              fullWidth
            />
          </Box>

          <FormControl size="small" fullWidth>
            <InputLabel>สถานะภาพ</InputLabel>
            <Select
              value={editingStudent?.status || "ACTIVE"}
              label="สถานะภาพ"
              onChange={(e) => setEditingStudent((prev) => ({ ...prev, status: e.target.value as any }))}
            >
              <MenuItem value="ACTIVE">กำลังศึกษา</MenuItem>
              <MenuItem value="GRADUATED">สำเร็จการศึกษา</MenuItem>
              <MenuItem value="SUSPENDED">พักการเรียน</MenuItem>
              <MenuItem value="DROPPED">พ้นสภาพ</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setEditDialogOpen(false)} disabled={editSubmitting}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleSingleSaveSubmit}
            disabled={
              editSubmitting ||
              !editingStudent?.studentCode ||
              !editingStudent?.firstName ||
              !editingStudent?.lastName
            }
          >
            {editSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== 7. DELETE CONFIRMATION DIALOG ==================== */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleteSubmitting && setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", color: "error.main" }}>
          ยืนยันการลบข้อมูลนักเรียน
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            คุณต้องการลบข้อมูลของ{" "}
            <b>
              {studentToDelete?.prefix} {studentToDelete?.firstName} {studentToDelete?.lastName}
            </b>{" "}
            (รหัส {studentToDelete?.studentCode}) ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteSubmitting}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteSubmit}
            disabled={deleteSubmitting}
          >
            {deleteSubmitting ? "กำลังลบ..." : "ยืนยันการลบ"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
