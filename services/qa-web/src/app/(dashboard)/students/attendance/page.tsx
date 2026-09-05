"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import ButtonGroup from "@mui/material/ButtonGroup";
import Divider from "@mui/material/Divider";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import HistoryIcon from "@mui/icons-material/History";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import { useAcademicYear } from "@/components/layout/AcademicYearContext";
import { usePermission } from "@/hooks/usePermission";
import * as XLSX from "xlsx";

interface AssignmentOption {
  id: string;
  course: {
    courseCode: string;
    courseName: string;
    theoryHours: number;
    practiceHours: number;
    credits: number;
  };
  teacher: {
    name: string;
  };
  level: string;
  year: string;
  majorCode: string;
  room: string;
  totalPeriods: number;
}

interface StudentAttendanceSummary {
  id: string;
  studentCode: string;
  prefix: string;
  firstName: string;
  lastName: string;
  room: string;
  status: string;
  present: number;
  late: number;
  absent: number;
  leave: number;
  totalChecked: number;
  rate: number;
  isPassing80: boolean;
}

interface AttendanceSessionItem {
  id: string;
  date: string;
  period: string | null;
  week: number;
  note: string | null;
  totalChecked: number;
  present: number;
  late: number;
  absent: number;
  leave: number;
}

export default function AttendancePage() {
  const { selectedYear, selectedSemester, termLabel } = useAcademicYear();
  const { hasPermission } = usePermission();

  const canRecord = hasPermission("attendance.record");

  // State: Teaching assignments dropdown
  const [assignments, setAssignments] = useState<AssignmentOption[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [loadingAssignments, setLoadingAssignments] = useState<boolean>(true);

  // State: Tab (0 = Student Summary & 80% rule, 1 = Sessions history)
  const [activeTab, setActiveTab] = useState<number>(0);

  // State: Summary & sessions
  const [summaryData, setSummaryData] = useState<{
    assignment?: AssignmentOption;
    totalSessions: number;
    stats: {
      totalStudents: number;
      classAverageRate: number;
      passingCount: number;
      failingCount: number;
      passingPercentage: number;
    };
    students: StudentAttendanceSummary[];
  } | null>(null);

  const [sessions, setSessions] = useState<AttendanceSessionItem[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // Feedback Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Daily Check-in Dialog State
  const [checkinDialogOpen, setCheckinDialogOpen] = useState<boolean>(false);
  const [checkinDate, setCheckinDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [checkinPeriod, setCheckinPeriod] = useState<string>("1-2");
  const [checkinWeek, setCheckinWeek] = useState<number>(1);
  const [checkinNote, setCheckinNote] = useState<string>("");
  const [studentStatuses, setStudentStatuses] = useState<
    Record<string, { status: "PRESENT" | "LATE" | "ABSENT" | "LEAVE"; remark: string }>
  >({});
  const [checkinSubmitting, setCheckinSubmitting] = useState<boolean>(false);

  // RMS Bulk Import Dialog State
  const [rmsDialogOpen, setRmsDialogOpen] = useState<boolean>(false);
  const [rmsRows, setRmsRows] = useState<any[]>([]);
  const [rmsNote, setRmsNote] = useState<string>("นำเข้าข้อมูลเวลาเรียนจากระบบ RMS");
  const [rmsSubmitting, setRmsSubmitting] = useState<boolean>(false);

  // 1. Fetch available teaching assignments for this term
  const fetchAssignments = useCallback(async () => {
    try {
      setLoadingAssignments(true);
      const res = await fetch(
        `/api/admin/teaching-assignments?academicYear=${selectedYear}&semester=${selectedSemester}`
      );
      if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลวิชาสอนได้");
      const data = await res.json();
      const items: AssignmentOption[] = data.items || [];
      setAssignments(items);

      if (items.length > 0) {
        // Keep selected if exists, or select first
        setSelectedAssignmentId((prev) => {
          const exists = items.some((i) => i.id === prev);
          return exists ? prev : items[0].id;
        });
      } else {
        setSelectedAssignmentId("");
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingAssignments(false);
    }
  }, [selectedYear, selectedSemester]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // 2. Fetch summary & sessions when selected assignment changes
  const fetchAssignmentData = useCallback(async () => {
    if (!selectedAssignmentId) {
      setSummaryData(null);
      setSessions([]);
      return;
    }

    try {
      setLoadingData(true);
      const [sumRes, sessRes] = await Promise.all([
        fetch(`/api/attendance/summary?assignmentId=${selectedAssignmentId}`),
        fetch(`/api/attendance/sessions?assignmentId=${selectedAssignmentId}`),
      ]);

      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummaryData(sumData);

        // Pre-fill daily check-in map
        const initialMap: Record<string, { status: "PRESENT" | "LATE" | "ABSENT" | "LEAVE"; remark: string }> = {};
        sumData.students?.forEach((s: StudentAttendanceSummary) => {
          initialMap[s.id] = { status: "PRESENT", remark: "" };
        });
        setStudentStatuses(initialMap);
      }

      if (sessRes.ok) {
        const sessData = await sessRes.json();
        setSessions(sessData.sessions || []);
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลเวลาเรียน", severity: "error" });
    } finally {
      setLoadingData(false);
    }
  }, [selectedAssignmentId]);

  useEffect(() => {
    fetchAssignmentData();
  }, [fetchAssignmentData]);

  // Quick Action: Mark all students as PRESENT
  const handleMarkAllPresent = () => {
    setStudentStatuses((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        updated[key] = { ...updated[key], status: "PRESENT" };
      });
      return updated;
    });
  };

  // Set single student status
  const handleSetStudentStatus = (studentId: string, status: "PRESENT" | "LATE" | "ABSENT" | "LEAVE") => {
    setStudentStatuses((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  // Set single student remark
  const handleSetStudentRemark = (studentId: string, remark: string) => {
    setStudentStatuses((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remark,
      },
    }));
  };

  // Submit Daily Check-in
  const handleCheckinSubmit = async () => {
    if (!selectedAssignmentId || !summaryData) return;

    try {
      setCheckinSubmitting(true);

      const records = summaryData.students.map((std) => ({
        studentId: std.id,
        studentCode: std.studentCode,
        status: studentStatuses[std.id]?.status || "PRESENT",
        remark: studentStatuses[std.id]?.remark || "",
      }));

      const res = await fetch("/api/attendance/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignmentId,
          date: checkinDate,
          period: checkinPeriod,
          week: checkinWeek,
          note: checkinNote,
          records,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึก");

      setSnackbar({ open: true, message: data.message || "บันทึกการเช็คชื่อสำเร็จ", severity: "success" });
      setCheckinDialogOpen(false);
      setCheckinNote("");
      fetchAssignmentData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "เกิดข้อผิดพลาด", severity: "error" });
    } finally {
      setCheckinSubmitting(false);
    }
  };

  // RMS Excel File Upload handler
  const handleRmsFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setRmsRows(data);
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

  // Download RMS Excel Template
  const handleDownloadRmsTemplate = () => {
    const templateData = (summaryData?.students || []).map((s) => ({
      รหัสนักศึกษา: s.studentCode,
      ชื่อสกุล: `${s.prefix}${s.firstName} ${s.lastName}`,
      มา: 64,
      สาย: 4,
      ขาด: 2,
      ลา: 2,
      หมายเหตุ: "ส่งงานครบ",
    }));

    if (templateData.length === 0) {
      templateData.push({
        รหัสนักศึกษา: "68209010001",
        ชื่อสกุล: "นายกิตติศักดิ์ ทองดี",
        มา: 64,
        สาย: 4,
        ขาด: 2,
        ลา: 2,
        หมายเหตุ: "ตัวอย่าง",
      });
    }

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RMS_Attendance");
    XLSX.writeFile(wb, "เทมเพลต_RMS_เวลาเรียน.xlsx");
  };

  // Submit RMS Bulk Import
  const handleRmsSubmit = async () => {
    if (!selectedAssignmentId || rmsRows.length === 0) return;

    try {
      setRmsSubmitting(true);
      const items = rmsRows.map((row) => ({
        studentCode: String(row.studentCode || row["รหัสนักศึกษา"] || "").trim(),
        present: Number(row.present ?? row["มา"] ?? 0),
        late: Number(row.late ?? row["สาย"] ?? 0),
        absent: Number(row.absent ?? row["ขาด"] ?? 0),
        leave: Number(row.leave ?? row["ลา"] ?? 0),
        remark: row.remark || row["หมายเหตุ"] || "",
      }));

      const res = await fetch("/api/attendance/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignmentId,
          note: rmsNote,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการนำเข้า RMS");

      setSnackbar({ open: true, message: data.message || "นำเข้าข้อมูลสำเร็จ", severity: "success" });
      setRmsDialogOpen(false);
      setRmsRows([]);
      fetchAssignmentData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "เกิดข้อผิดพลาด", severity: "error" });
    } finally {
      setRmsSubmitting(false);
    }
  };

  // Export CSV Report
  const handleExportCSV = () => {
    if (!summaryData || summaryData.students.length === 0) {
      setSnackbar({ open: true, message: "ไม่มีข้อมูลที่จะส่งออก", severity: "warning" });
      return;
    }

    const currentAssign = summaryData.assignment;
    const headers = [
      "รหัสนักศึกษา",
      "คำนำหน้า",
      "ชื่อ",
      "นามสกุล",
      "กลุ่ม",
      "มา (คาบ)",
      "สาย (คาบ)",
      "ขาด (คาบ)",
      "ลา (คาบ)",
      "รวมคาบที่เช็ค",
      "ร้อยละเวลาเรียน (%)",
      "ผลการประเมิน 80%",
    ];

    const rows = summaryData.students.map((s) => [
      `="${s.studentCode}"`,
      s.prefix,
      s.firstName,
      s.lastName,
      s.room,
      s.present,
      s.late,
      s.absent,
      s.leave,
      s.totalChecked,
      `${s.rate}%`,
      s.isPassing80 ? "มีสิทธิ์สอบ (ผ่านเกณฑ์ 80%)" : "หมดสิทธิ์สอบ (ม.ส.)",
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `รายงานเวลาเรียน_${currentAssign?.course?.courseCode || "วิชา"}_${selectedYear}_เทอม${selectedSemester}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentAssignment = useMemo(() => {
    return assignments.find((a) => a.id === selectedAssignmentId);
  }, [assignments, selectedAssignmentId]);

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <Tooltip title="กลับภาพรวมงานนักเรียน">
            <IconButton
              component={Link}
              href="/dashboard/students"
              size="small"
              sx={{ color: "text.secondary", p: 0.4, flexShrink: 0 }}
              aria-label="ย้อนกลับ"
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Typography
            variant="h2"
            noWrap
            sx={{ fontWeight: 700, fontSize: "1.125rem", color: "text.primary" }}
          >
            เช็คชื่อเข้าเรียนและพฤติกรรม
          </Typography>

          <Tooltip title="ระบบเช็กชื่อเวลาเรียนรายวัน นำเข้าจาก RMS และประเมินเกณฑ์เวลาเรียน 80% สำหรับ SAR">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25, flexShrink: 0 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Chip
            size="small"
            label="มาตรฐานที่ 1 SAR"
            color="success"
            variant="outlined"
            sx={{ height: 20, fontSize: "0.6875rem", display: { xs: "none", sm: "inline-flex" }, flexShrink: 0 }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
          <Chip
            icon={<CalendarTodayIcon sx={{ fontSize: 13 }} />}
            label={`รอบข้อมูล ${termLabel}`}
            variant="outlined"
            size="small"
            sx={{ height: 22, fontSize: "0.725rem", display: { xs: "none", md: "inline-flex" }, flexShrink: 0 }}
          />

          <Tooltip title="ส่งออกไฟล์รายงาน CSV พร้อม BOM สำหรับ Excel">
            <span>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadIcon sx={{ fontSize: 15 }} />}
                onClick={handleExportCSV}
                disabled={!summaryData || summaryData.students.length === 0}
                sx={{
                  height: 30,
                  px: 1.25,
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  display: { xs: "none", sm: "inline-flex" },
                }}
              >
                ส่งออก CSV
              </Button>
            </span>
          </Tooltip>

          {canRecord && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<CloudUploadIcon sx={{ fontSize: 15 }} />}
              onClick={() => setRmsDialogOpen(true)}
              disabled={!selectedAssignmentId}
              sx={{
                height: 30,
                px: 1.25,
                fontSize: "0.75rem",
                fontWeight: 500,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              นำเข้า RMS
            </Button>
          )}

          {/* Primary CTA */}
          {canRecord && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 15 }} />}
              onClick={() => setCheckinDialogOpen(true)}
              disabled={!selectedAssignmentId}
              sx={{
                height: 30,
                px: 1.5,
                fontSize: "0.75rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              เช็กชื่อวันนี้
            </Button>
          )}
        </Box>
      </Box>

      {/* 2. Course & Classroom Selector Bar */}
      <Paper sx={{ p: 1.5, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 340 } }}>
          <InputLabel>เลือกรายวิชาและห้องเรียนที่สอน</InputLabel>
          <Select
            value={selectedAssignmentId}
            label="เลือกรายวิชาและห้องเรียนที่สอน"
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            disabled={loadingAssignments || assignments.length === 0}
          >
            {assignments.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                [{a.course?.courseCode}] {a.course?.courseName} ({a.level}.{a.year} กลุ่ม {a.room})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {currentAssignment && (
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Chip
              size="small"
              label={`ห้อง: ${currentAssignment.level}.${currentAssignment.year} ${currentAssignment.majorCode} กลุ่ม ${currentAssignment.room}`}
              color="primary"
              variant="outlined"
              sx={{ height: 22, fontSize: "0.725rem", fontWeight: 600 }}
            />
            <Chip
              size="small"
              label={`ผู้สอน: ${currentAssignment.teacher?.name}`}
              sx={{ height: 22, fontSize: "0.725rem" }}
            />
            <Chip
              size="small"
              label={`รวมตามแผน ${currentAssignment.totalPeriods} คาบ`}
              variant="outlined"
              sx={{ height: 22, fontSize: "0.725rem" }}
            />
          </Box>
        )}

        <Tooltip title="รีเฟรชข้อมูล">
          <IconButton size="small" onClick={fetchAssignmentData} sx={{ ml: "auto" }}>
            <RefreshIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* 3. KPI Summary Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 1.5,
        }}
      >
        <Paper sx={{ p: 1.25 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.25, fontSize: "0.75rem" }}>
            สถิติการมาเรียนเฉลี่ยของวิชา
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" sx={{ color: "text.primary", fontSize: "1.25rem", fontWeight: 700 }}>
              {summaryData ? `${summaryData.stats.classAverageRate}%` : "-"}
            </Typography>
            <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600, fontSize: "0.725rem" }}>
              {summaryData?.totalSessions || 0} ครั้งที่เช็ก
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 1.25 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.25, fontSize: "0.75rem" }}>
            ผ่านเกณฑ์เวลาเรียน 80% (สิทธิ์สอบ)
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" sx={{ color: "text.primary", fontSize: "1.25rem", fontWeight: 700 }}>
              {summaryData ? `${summaryData.stats.passingPercentage}%` : "-"}
            </Typography>
            <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.725rem" }}>
              ผ่าน {summaryData?.stats.passingCount || 0} / {summaryData?.stats.totalStudents || 0} คน
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 1.25 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.25, fontSize: "0.75rem" }}>
            กลุ่มเสี่ยงหมดสิทธิ์สอบ (&lt; 80%)
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography
              variant="h3"
              sx={{
                color: (summaryData?.stats.failingCount || 0) > 0 ? "error.main" : "text.primary",
                fontSize: "1.25rem",
                fontWeight: 700,
              }}
            >
              {summaryData ? `${summaryData.stats.failingCount} คน` : "-"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.725rem" }}>
              เกณฑ์ สอศ. ต้องเข้าเรียน &ge; 80%
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* 4. Tabs: Student Summary vs Session History */}
      <Paper sx={{ border: "1px solid", borderColor: "divider" }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab
            icon={<AssessmentIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label={`สรุปสถิติเวลาเรียนรายคน (${summaryData?.students?.length || 0} คน)`}
            sx={{ fontSize: "0.8125rem", minHeight: 40 }}
          />
          <Tab
            icon={<HistoryIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label={`ประวัติการเช็กชื่อย้อนหลัง (${sessions.length} ครั้ง)`}
            sx={{ fontSize: "0.8125rem", minHeight: 40 }}
          />
        </Tabs>
      </Paper>

      {/* TAB 0: Student Attendance Summary */}
      {activeTab === 0 && (
        <Paper sx={{ overflow: "hidden" }}>
          {loadingData && <LinearProgress />}
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 130 }}>รหัสนักศึกษา</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ชื่อ - นามสกุล</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 70 }} align="center">มา</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 70 }} align="center">สาย</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 70 }} align="center">ขาด</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 70 }} align="center">ลา</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 100 }} align="center">รวมคาบ</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 110 }} align="center">ร้อยละเวลาเรียน</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 130 }} align="center">เกณฑ์ 80% (SAR)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!summaryData || summaryData.students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {assignments.length === 0
                          ? "ยังไม่มีการมอบหมายรายวิชาในเทอมนี้ กรุณาให้ Admin/หัวหน้าแผนก กำหนดผู้สอนในหน้า 'มอบหมายรายวิชาสอน'"
                          : "ไม่พบข้อมูลนักเรียนในห้องนี้ กรุณาตรวจสอบทะเบียนนักเรียน หรือกดปุ่ม 'เช็กชื่อวันนี้'"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  summaryData.students.map((std) => (
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
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "success.main" }}>
                          {std.present}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "warning.main" }}>
                          {std.late}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "error.main" }}>
                          {std.absent}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "info.main" }}>
                          {std.leave}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontSize: "0.8125rem" }}>
                          {std.totalChecked} คาบ
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: std.isPassing80 ? "success.main" : "error.main",
                          }}
                        >
                          {std.rate}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={std.isPassing80 ? "มีสิทธิ์สอบ" : "หมดสิทธิ์สอบ (ม.ส.)"}
                          color={std.isPassing80 ? "success" : "error"}
                          sx={{ height: 20, fontSize: "0.6875rem", fontWeight: 700 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* TAB 1: Sessions History */}
      {activeTab === 1 && (
        <Paper sx={{ overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 110 }}>วันที่</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 90 }}>สัปดาห์ที่</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 90 }}>คาบเรียน</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>หัวข้อการสอน / หมายเหตุ</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 80 }} align="center">มา</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 80 }} align="center">สาย</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 80 }} align="center">ขาด</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 80 }} align="center">ลา</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        ยังไม่มีประวัติการเช็กชื่อในรายวิชานี้
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((sess) => (
                    <TableRow key={sess.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                          {new Date(sess.date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={`สัปดาห์ ${sess.week}`} variant="outlined" sx={{ height: 20, fontSize: "0.6875rem" }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "0.8125rem" }}>
                          {sess.period || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{sess.note || "-"}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={sess.present} color="success" sx={{ height: 18, fontSize: "0.625rem" }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={sess.late} color="warning" sx={{ height: 18, fontSize: "0.625rem" }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={sess.absent} color="error" sx={{ height: 18, fontSize: "0.625rem" }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={sess.leave} color="info" sx={{ height: 18, fontSize: "0.625rem" }} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* ==================== 5. DAILY CHECK-IN DIALOG ==================== */}
      <Dialog
        open={checkinDialogOpen}
        onClose={() => !checkinSubmitting && setCheckinDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem", pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>เช็กชื่อประจำวัน: {currentAssignment?.course?.courseName}</span>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DoneAllIcon sx={{ fontSize: 15 }} />}
            onClick={handleMarkAllPresent}
            sx={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}
          >
            มาเรียนทั้งหมด
          </Button>
        </DialogTitle>

        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
          {/* Top Session Metadata */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 1.25 }}>
            <TextField
              size="small"
              label="วันที่เช็กชื่อ"
              type="date"
              value={checkinDate}
              onChange={(e) => setCheckinDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />

            <TextField
              size="small"
              label="สัปดาห์ที่ (1 - 18)"
              type="number"
              value={checkinWeek}
              onChange={(e) => setCheckinWeek(parseInt(e.target.value, 10) || 1)}
              fullWidth
            />

            <TextField
              size="small"
              label="คาบเรียน"
              placeholder="เช่น 1-2 หรือ 3-4"
              value={checkinPeriod}
              onChange={(e) => setCheckinPeriod(e.target.value)}
              fullWidth
            />

            <TextField
              size="small"
              label="หัวข้อที่สอน / กิจกรรม"
              placeholder="เช่น พื้นฐาน if-else"
              value={checkinNote}
              onChange={(e) => setCheckinNote(e.target.value)}
              fullWidth
            />
          </Box>

          <Divider />

          {/* Student Check-in List */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                รายชื่อนักเรียนในห้อง ({summaryData?.students?.length || 0} คน) - กดเลือกสถานะของแต่ละคน:
              </Typography>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 420 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, width: 120 }}>รหัส</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>ชื่อ - นามสกุล</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 220 }} align="center">สถานะการมา</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 180 }}>หมายเหตุพฤติกรรม</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(!summaryData?.students || summaryData.students.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                            ยังไม่พบรายชื่อนักเรียนในห้องเรียนนี้
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", maxWidth: 400 }}>
                            คุณสามารถนำเข้าสถิติเวลาเรียนโดยตรงผ่านระบบ RMS หรือนำเข้ารายชื่อในระบบทะเบียนนักศึกษา
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CloudUploadIcon sx={{ fontSize: 15 }} />}
                            onClick={() => {
                              setCheckinDialogOpen(false);
                              setRmsDialogOpen(true);
                            }}
                            sx={{ mt: 1, fontSize: "0.75rem", whiteSpace: "nowrap" }}
                          >
                            เปิดนำเข้าข้อมูลจาก RMS
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    summaryData.students.map((std) => {
                      const currentStatus = studentStatuses[std.id]?.status || "PRESENT";
                      return (
                        <TableRow key={std.id} hover>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "0.785rem" }}>
                            {std.studentCode}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.8125rem" }}>
                            {std.prefix} {std.firstName} {std.lastName}
                          </TableCell>
                          <TableCell align="center">
                            <ButtonGroup size="small" variant="outlined" sx={{ height: 26 }}>
                              <Button
                                variant={currentStatus === "PRESENT" ? "contained" : "outlined"}
                                color="success"
                                onClick={() => handleSetStudentStatus(std.id, "PRESENT")}
                                sx={{ px: 1, fontSize: "0.6875rem", fontWeight: 700 }}
                              >
                                มา
                              </Button>
                              <Button
                                variant={currentStatus === "LATE" ? "contained" : "outlined"}
                                color="warning"
                                onClick={() => handleSetStudentStatus(std.id, "LATE")}
                                sx={{ px: 1, fontSize: "0.6875rem", fontWeight: 700 }}
                              >
                                สาย
                              </Button>
                              <Button
                                variant={currentStatus === "ABSENT" ? "contained" : "outlined"}
                                color="error"
                                onClick={() => handleSetStudentStatus(std.id, "ABSENT")}
                                sx={{ px: 1, fontSize: "0.6875rem", fontWeight: 700 }}
                              >
                                ขาด
                              </Button>
                              <Button
                                variant={currentStatus === "LEAVE" ? "contained" : "outlined"}
                                color="info"
                                onClick={() => handleSetStudentStatus(std.id, "LEAVE")}
                                sx={{ px: 1, fontSize: "0.6875rem", fontWeight: 700 }}
                              >
                                ลา
                              </Button>
                            </ButtonGroup>
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              placeholder="เช่น ส่งงานช้า, มีอาการป่วย"
                              value={studentStatuses[std.id]?.remark || ""}
                              onChange={(e) =>
                                setStudentStatuses((prev) => ({
                                  ...prev,
                                  [std.id]: {
                                    ...prev[std.id],
                                    remark: e.target.value,
                                  },
                                }))
                              }
                              sx={{ "& input": { fontSize: "0.75rem", py: 0.5 } }}
                              fullWidth
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setCheckinDialogOpen(false)} disabled={checkinSubmitting} sx={{ whiteSpace: "nowrap" }}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleCheckinSubmit}
            disabled={checkinSubmitting || !summaryData?.students || summaryData.students.length === 0}
            startIcon={checkinSubmitting ? <CircularProgress size={16} /> : <CheckCircleIcon />}
            sx={{ whiteSpace: "nowrap", fontWeight: 600 }}
          >
            {checkinSubmitting ? "กำลังบันทึก..." : "ยืนยันบันทึกเวลาเรียน"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== 6. RMS BULK UPLOAD DIALOG ==================== */}
      <Dialog
        open={rmsDialogOpen}
        onClose={() => !rmsSubmitting && setRmsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem", pb: 1 }}>
          นำเข้าข้อมูลสรุปเวลาเรียนจากระบบ RMS หรือไฟล์ Excel
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              อัปโหลดไฟล์สรุปเวลาเรียนที่มีคอลัมน์: รหัสนักศึกษา, มา, สาย, ขาด, ลา
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadIcon sx={{ fontSize: 15 }} />}
              onClick={handleDownloadRmsTemplate}
              sx={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}
            >
              ดาวน์โหลดเทมเพลต Excel RMS
            </Button>
          </Box>

          <TextField
            size="small"
            label="หัวข้อบันทึก / อ้างอิง"
            value={rmsNote}
            onChange={(e) => setRmsNote(e.target.value)}
            fullWidth
          />

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
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              onChange={handleRmsFileUpload}
            />
            <CloudUploadIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              คลิกเพื่อเลือกไฟล์ หรือ ลากไฟล์ Excel / CSV มาวางที่นี่
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              รองรับไฟล์ .xlsx, .xls, .csv จากระบบ RMS หรือแบบฟอร์มฝ่ายวิชาการ
            </Typography>
          </Box>

          {/* Preview Parsed Data */}
          {rmsRows.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "success.main" }}>
                ✓ ตรวจพบข้อมูลนักเรียน {rmsRows.length} รายการ พร้อมนำเข้า:
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 250 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>รหัสนักศึกษา</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">มา</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">สาย</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">ขาด</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">ลา</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>หมายเหตุ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rmsRows.slice(0, 50).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.785rem" }}>
                          {row.studentCode || row["รหัสนักศึกษา"]}
                        </TableCell>
                        <TableCell align="center">{row.present ?? row["มา"] ?? 0}</TableCell>
                        <TableCell align="center">{row.late ?? row["สาย"] ?? 0}</TableCell>
                        <TableCell align="center">{row.absent ?? row["ขาด"] ?? 0}</TableCell>
                        <TableCell align="center">{row.leave ?? row["ลา"] ?? 0}</TableCell>
                        <TableCell sx={{ fontSize: "0.75rem" }}>{row.remark || row["หมายเหตุ"] || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setRmsDialogOpen(false)} disabled={rmsSubmitting} sx={{ whiteSpace: "nowrap" }}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleRmsSubmit}
            disabled={rmsSubmitting || rmsRows.length === 0}
            startIcon={rmsSubmitting ? <CircularProgress size={16} /> : <CheckCircleIcon />}
            sx={{ whiteSpace: "nowrap", fontWeight: 600 }}
          >
            {rmsSubmitting ? "กำลังนำเข้า..." : `ยืนยันนำเข้ารวดเดียว (${rmsRows.length} คน)`}
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
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
