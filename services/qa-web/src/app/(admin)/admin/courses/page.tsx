"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
import Avatar from "@mui/material/Avatar";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SchoolIcon from "@mui/icons-material/School";

import { useAcademicYear } from "@/components/layout/AcademicYearContext";
import { usePermission } from "@/hooks/usePermission";

interface CourseItem {
  id: string;
  courseCode: string;
  courseName: string;
  theoryHours: number;
  practiceHours: number;
  credits: number;
  level: string;
  majorCode: string;
  isActive: boolean;
  _count?: { assignments: number };
}

interface TeacherUser {
  id: string;
  name: string;
  email: string;
  position?: string | null;
  avatarUrl?: string | null;
}

interface SectionItem {
  id: string;
  level: string;
  year: string;
  majorName: string;
  majorCode: string;
  room: string;
}

interface AssignmentItem {
  id: string;
  courseId: string;
  course: CourseItem;
  teacherId: string;
  teacher: TeacherUser;
  academicYear: string;
  semester: string;
  level: string;
  year: string;
  majorCode: string;
  room: string;
  totalPeriods: number;
  _count?: { sessions: number; records: number };
}

export default function AdminCoursesPage() {
  const { data: session } = useSession();
  const { selectedYear, selectedSemester, termLabel } = useAcademicYear();
  const { hasPermission } = usePermission();

  const [activeTab, setActiveTab] = useState<number>(0);

  // Data states
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Assign Dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState<boolean>(false);
  const [assignForm, setAssignForm] = useState({
    courseId: "",
    teacherId: "",
    level: "ปวช",
    year: "1",
    majorCode: "ชทค",
    room: "1",
    totalPeriods: 72,
  });
  const [assignSubmitting, setAssignSubmitting] = useState<boolean>(false);

  // Course Dialog state
  const [courseDialogOpen, setCourseDialogOpen] = useState<boolean>(false);
  const [isEditingCourse, setIsEditingCourse] = useState<boolean>(false);
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState({
    courseCode: "",
    courseName: "",
    theoryHours: 2,
    practiceHours: 2,
    credits: 3,
    level: "ปวช",
    majorCode: "ชทค",
  });
  const [courseSubmitting, setCourseSubmitting] = useState<boolean>(false);

  // Delete states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: "assignment" | "course"; id: string; title: string } | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  // Fetch all required data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [assignRes, coursesRes, usersRes, sectRes] = await Promise.all([
        fetch(`/api/admin/teaching-assignments?academicYear=${selectedYear}&semester=${selectedSemester}`),
        fetch("/api/admin/courses"),
        fetch("/api/admin/users"),
        fetch("/api/admin/curriculum?active=true"),
      ]);

      if (assignRes.ok) {
        const d = await assignRes.json();
        setAssignments(d.items || []);
      }
      if (coursesRes.ok) {
        const d = await coursesRes.json();
        setCourses(d.items || []);
      }
      if (usersRes.ok) {
        const d = await usersRes.json();
        setTeachers(d.users || []);
      }
      if (sectRes.ok) {
        const d = await sectRes.json();
        setSections(d.items || []);
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedSemester]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Assign Submit
  const handleAssignSubmit = async () => {
    try {
      setAssignSubmitting(true);
      const res = await fetch("/api/admin/teaching-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...assignForm,
          academicYear: selectedYear,
          semester: selectedSemester,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการมอบหมายสอน");

      setSnackbar({ open: true, message: "มอบหมายรายวิชาสอนสำเร็จ", severity: "success" });
      setAssignDialogOpen(false);
      fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "เกิดข้อผิดพลาด", severity: "error" });
    } finally {
      setAssignSubmitting(false);
    }
  };

  // Handle Course Submit (Add/Edit)
  const handleCourseSubmit = async () => {
    try {
      setCourseSubmitting(true);
      const url = isEditingCourse ? `/api/admin/courses/${currentCourseId}` : "/api/admin/courses";
      const method = isEditingCourse ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกรายวิชา");

      setSnackbar({
        open: true,
        message: isEditingCourse ? "แก้ไขรายวิชาสำเร็จ" : "สร้างรายวิชาใหม่สำเร็จ",
        severity: "success",
      });
      setCourseDialogOpen(false);
      fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "เกิดข้อผิดพลาด", severity: "error" });
    } finally {
      setCourseSubmitting(false);
    }
  };

  // Handle Delete Submit
  const handleDeleteSubmit = async () => {
    if (!itemToDelete) return;
    try {
      setDeleteSubmitting(true);
      const endpoint =
        itemToDelete.type === "assignment"
          ? `/api/admin/teaching-assignments/${itemToDelete.id}`
          : `/api/admin/courses/${itemToDelete.id}`;

      const res = await fetch(endpoint, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการลบ");

      setSnackbar({ open: true, message: "ลบข้อมูลสำเร็จ", severity: "success" });
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "เกิดข้อผิดพลาด", severity: "error" });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.25, sm: 2 }, maxWidth: 1300, mx: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* 1. Ultra-Compact Page Header */}
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
          <Tooltip title="กลับหน้าหลักภาพรวม">
            <IconButton
              component={Link}
              href="/dashboard"
              size="small"
              sx={{ color: "text.secondary", p: 0.4 }}
              aria-label="ย้อนกลับ"
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Typography variant="h2" noWrap sx={{ fontWeight: 700, fontSize: "1.125rem", color: "text.primary" }}>
            มอบหมายรายวิชาสอนและหลักสูตร
          </Typography>

          <Tooltip title="สำหรับ Admin หรือหัวหน้าแผนก เพื่อกำหนดผู้รับผิดชอบการสอนและห้องเรียนในแต่ละเทอม">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25, flexShrink: 0 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Chip size="small" label="การบริหารระบบ" color="primary" variant="outlined" sx={{ height: 20, fontSize: "0.6875rem", display: { xs: "none", sm: "inline-flex" }, flexShrink: 0 }} />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
          <Chip
            icon={<CalendarTodayIcon sx={{ fontSize: 13 }} />}
            label={`รอบข้อมูล ${termLabel}`}
            variant="outlined"
            size="small"
            sx={{ height: 22, fontSize: "0.725rem", display: { xs: "none", sm: "inline-flex" }, flexShrink: 0 }}
          />

          <Tooltip title="รีเฟรช">
            <IconButton size="small" onClick={fetchData} sx={{ p: 0.4, flexShrink: 0 }}>
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          {activeTab === 0 ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<AssignmentIndIcon sx={{ fontSize: 15 }} />}
              onClick={() => {
                if (courses.length > 0) setAssignForm((prev) => ({ ...prev, courseId: courses[0].id }));
                if (teachers.length > 0) setAssignForm((prev) => ({ ...prev, teacherId: teachers[0].id }));
                setAssignDialogOpen(true);
              }}
              sx={{ height: 30, px: 1.5, fontSize: "0.75rem", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              มอบหมายผู้สอน
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 15 }} />}
              onClick={() => {
                setIsEditingCourse(false);
                setCurrentCourseId(null);
                setCourseForm({
                  courseCode: "",
                  courseName: "",
                  theoryHours: 2,
                  practiceHours: 2,
                  credits: 3,
                  level: "ปวช",
                  majorCode: "ชทค",
                });
                setCourseDialogOpen(true);
              }}
              sx={{ height: 30, px: 1.5, fontSize: "0.75rem", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              เพิ่มรายวิชาใหม่
            </Button>
          )}
        </Box>
      </Box>

      {/* 2. Tabs */}
      <Paper sx={{ border: "1px solid", borderColor: "divider" }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab
            icon={<AssignmentIndIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label={`การมอบหมายผู้สอนประจำห้อง (${assignments.length} รายการ)`}
            sx={{ fontSize: "0.8125rem", minHeight: 40 }}
          />
          <Tab
            icon={<MenuBookIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label={`บัญชีรายวิชาในแผนก (${courses.length} วิชา)`}
            sx={{ fontSize: "0.8125rem", minHeight: 40 }}
          />
        </Tabs>
      </Paper>

      {/* TAB 0: Teaching Assignments */}
      {activeTab === 0 && (
        <Paper sx={{ overflow: "hidden" }}>
          {loading && <LinearProgress />}
          <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h4" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
              รายการมอบหมายการสอนใน {termLabel}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              ครูผู้สอนจะเห็นเฉพาะวิชาและห้องที่ได้รับมอบหมายในระบบเช็กชื่อ
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 130 }}>รหัสวิชา</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ชื่อรายวิชา</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ครูผู้สอนที่รับผิดชอบ</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 140 }}>ห้องเรียนเป้าหมาย</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 90 }} align="center">คาบสอน</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 100 }} align="center">เช็กชื่อแล้ว</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 80 }} align="center">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        ยังไม่มีการมอบหมายวิชาสอนในเทอมนี้ กรุณากดปุ่ม <b>"มอบหมายผู้สอน"</b>
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments.map((a) => (
                    <TableRow key={a.id} hover>
                      <TableCell>
                        <Chip
                          label={a.course?.courseCode}
                          size="small"
                          sx={{ height: 20, fontSize: "0.6875rem", fontWeight: 700, fontFamily: "monospace" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {a.course?.courseName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          ท-ป-น: {a.course?.theoryHours}-{a.course?.practiceHours}-{a.course?.credits}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar src={a.teacher?.avatarUrl || ""} sx={{ width: 24, height: 24, fontSize: "0.75rem" }}>
                            {a.teacher?.name?.charAt(0) || "T"}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {a.teacher?.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              {a.teacher?.position || a.teacher?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={`${a.level}.${a.year} ${a.majorCode} กลุ่ม ${a.room}`}
                          color="primary"
                          variant="outlined"
                          sx={{ height: 20, fontSize: "0.6875rem", fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontSize: "0.8125rem" }}>
                          {a.totalPeriods} คาบ
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={`${a._count?.sessions || 0} ครั้ง`}
                          color={(a._count?.sessions || 0) > 0 ? "success" : "default"}
                          sx={{ height: 20, fontSize: "0.6875rem" }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="ยกเลิกการมอบหมาย">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setItemToDelete({
                                type: "assignment",
                                id: a.id,
                                title: `${a.course?.courseName} (${a.teacher?.name})`,
                              });
                              setDeleteConfirmOpen(true);
                            }}
                            sx={{ p: 0.3 }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* TAB 1: Courses Catalog */}
      {activeTab === 1 && (
        <Paper sx={{ overflow: "hidden" }}>
          {loading && <LinearProgress />}
          <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h4" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
              รายวิชาตามหลักสูตรแผนกวิชา ({courses.length} วิชา)
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 130 }}>รหัสวิชา</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ชื่อรายวิชา</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 100 }}>ระดับชั้น</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 100 }}>รหัสสาขา</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 120 }} align="center">ท-ป-น (หน่วยกิต)</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 100 }} align="center">มอบหมายแล้ว</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 80 }} align="center">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                        {c.courseCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {c.courseName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={c.level}
                        color={c.level === "ปวส" ? "secondary" : "primary"}
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.6875rem" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={c.majorCode} sx={{ height: 20, fontSize: "0.6875rem" }} />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontSize: "0.8125rem" }}>
                        {c.theoryHours}-{c.practiceHours}-{c.credits}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={`${c._count?.assignments || 0} ห้อง`}
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.6875rem" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                        <Tooltip title="แก้ไข">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setIsEditingCourse(true);
                              setCurrentCourseId(c.id);
                              setCourseForm({
                                courseCode: c.courseCode,
                                courseName: c.courseName,
                                theoryHours: c.theoryHours,
                                practiceHours: c.practiceHours,
                                credits: c.credits,
                                level: c.level,
                                majorCode: c.majorCode,
                              });
                              setCourseDialogOpen(true);
                            }}
                            sx={{ p: 0.3 }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="ลบ">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setItemToDelete({
                                type: "course",
                                id: c.id,
                                title: `${c.courseCode} ${c.courseName}`,
                              });
                              setDeleteConfirmOpen(true);
                            }}
                            sx={{ p: 0.3 }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* ==================== 3. ASSIGN TEACHER DIALOG ==================== */}
      <Dialog open={assignDialogOpen} onClose={() => !assignSubmitting && setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
          มอบหมายผู้สอนประจำวิชาและห้องเรียน ({termLabel})
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
          <FormControl size="small" fullWidth required>
            <InputLabel>เลือกรายวิชา</InputLabel>
            <Select
              value={assignForm.courseId}
              label="เลือกรายวิชา"
              onChange={(e) => setAssignForm((prev) => ({ ...prev, courseId: e.target.value }))}
            >
              {courses.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  [{c.courseCode}] {c.courseName} ({c.level})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth required>
            <InputLabel>เลือกครูผู้สอนที่รับผิดชอบ</InputLabel>
            <Select
              value={assignForm.teacherId}
              label="เลือกครูผู้สอนที่รับผิดชอบ"
              onChange={(e) => setAssignForm((prev) => ({ ...prev, teacherId: e.target.value }))}
            >
              {teachers.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name} ({t.position || t.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1 }}>
              ระบุห้องเรียนที่ครูท่านนี้สอน:
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
              <FormControl size="small">
                <InputLabel>ระดับชั้น</InputLabel>
                <Select
                  value={assignForm.level}
                  label="ระดับชั้น"
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, level: e.target.value }))}
                >
                  <MenuItem value="ปวช">ปวช</MenuItem>
                  <MenuItem value="ปวส">ปวส</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel>ชั้นปี</InputLabel>
                <Select
                  value={assignForm.year}
                  label="ชั้นปี"
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, year: e.target.value }))}
                >
                  <MenuItem value="1">ปี 1</MenuItem>
                  <MenuItem value="2">ปี 2</MenuItem>
                  <MenuItem value="3">ปี 3</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel>ห้อง / กลุ่ม</InputLabel>
                <Select
                  value={assignForm.room}
                  label="ห้อง / กลุ่ม"
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, room: e.target.value }))}
                >
                  <MenuItem value="1">กลุ่ม 1</MenuItem>
                  <MenuItem value="2">กลุ่ม 2</MenuItem>
                  <MenuItem value="3">กลุ่ม 3</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TextField
            size="small"
            label="จำนวนคาบเรียนรวมตลอดเทอม (ปกติ 18 สัปดาห์ x คาบต่อสัปดาห์)"
            type="number"
            value={assignForm.totalPeriods}
            onChange={(e) => setAssignForm((prev) => ({ ...prev, totalPeriods: parseInt(e.target.value, 10) || 72 }))}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setAssignDialogOpen(false)} disabled={assignSubmitting}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleAssignSubmit}
            disabled={assignSubmitting || !assignForm.courseId || !assignForm.teacherId}
          >
            {assignSubmitting ? "กำลังบันทึก..." : "ยืนยันมอบหมาย"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== 4. COURSE ADD / EDIT DIALOG ==================== */}
      <Dialog open={courseDialogOpen} onClose={() => !courseSubmitting && setCourseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
          {isEditingCourse ? "แก้ไขข้อมูลรายวิชา" : "เพิ่มรายวิชาใหม่"}
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 1 }}>
            <TextField
              size="small"
              label="รหัสวิชา"
              placeholder="เช่น 20204-2001"
              value={courseForm.courseCode}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, courseCode: e.target.value }))}
              disabled={isEditingCourse}
              required
            />
            <TextField
              size="small"
              label="ชื่อรายวิชา"
              value={courseForm.courseName}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, courseName: e.target.value }))}
              required
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
            <TextField
              size="small"
              label="ทฤษฎี (ชม./สัปดาห์)"
              type="number"
              value={courseForm.theoryHours}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, theoryHours: parseInt(e.target.value, 10) || 0 }))}
            />
            <TextField
              size="small"
              label="ปฏิบัติ (ชม./สัปดาห์)"
              type="number"
              value={courseForm.practiceHours}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, practiceHours: parseInt(e.target.value, 10) || 0 }))}
            />
            <TextField
              size="small"
              label="หน่วยกิต"
              type="number"
              value={courseForm.credits}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, credits: parseInt(e.target.value, 10) || 0 }))}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            <FormControl size="small">
              <InputLabel>ระดับชั้น</InputLabel>
              <Select
                value={courseForm.level}
                label="ระดับชั้น"
                onChange={(e) => setCourseForm((prev) => ({ ...prev, level: e.target.value }))}
              >
                <MenuItem value="ปวช">ปวช</MenuItem>
                <MenuItem value="ปวส">ปวส</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="รหัสย่อสาขา"
              value={courseForm.majorCode}
              onChange={(e) => setCourseForm((prev) => ({ ...prev, majorCode: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setCourseDialogOpen(false)} disabled={courseSubmitting}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleCourseSubmit}
            disabled={courseSubmitting || !courseForm.courseCode || !courseForm.courseName}
          >
            {courseSubmitting ? "กำลังบันทึก..." : "บันทึกรายวิชา"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== 5. DELETE CONFIRM DIALOG ==================== */}
      <Dialog open={deleteConfirmOpen} onClose={() => !deleteSubmitting && setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", color: "error.main" }}>
          ยืนยันการลบ
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            คุณต้องการลบ <b>{itemToDelete?.title}</b> ใช่หรือไม่?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deleteSubmitting}>
            ยกเลิก
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteSubmit} disabled={deleteSubmitting}>
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
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
