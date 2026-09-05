"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SaveIcon from "@mui/icons-material/Save";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import ComputerIcon from "@mui/icons-material/Computer";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useAcademicYear } from "@/components/layout/AcademicYearContext";

interface Laboratory {
  name: string;
  room: string;
  capacity: number | string;
  equipment: string;
}

interface QualityGoal {
  indicator: string;
  target: string;
  note: string;
}

interface DepartmentProfileData {
  id?: string;
  nameTh: string;
  nameEn: string;
  collegeName: string;
  faculty: string;
  philosophy: string;
  vision: string;
  mission: string;
  identity: string;
  uniqueness: string;
  colors: string;
  roomLocation: string;
  headTeacherName: string;
  phone: string;
  email: string;
  facebook: string;
  website: string;
  laboratories: Laboratory[];
  qualityGoals: QualityGoal[];
  academicYear?: string;
}

export default function AdminDepartmentPage() {
  const { termLabel, selectedYear } = useAcademicYear();

  const [activeTab, setActiveTab] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [form, setForm] = useState<DepartmentProfileData>({
    nameTh: "แผนกวิชาเทคโนโลยีคอมพิวเตอร์",
    nameEn: "Department of Computer Technology",
    collegeName: "วิทยาลัยเทคนิค",
    faculty: "ประเภทวิชาช่างอุตสาหกรรม",
    philosophy: "",
    vision: "",
    mission: "",
    identity: "",
    uniqueness: "",
    colors: "น้ำเงิน - ขาว",
    roomLocation: "อาคาร 4 ชั้น 2 แผนกวิชาเทคโนโลยีคอมพิวเตอร์",
    headTeacherName: "",
    phone: "",
    email: "",
    facebook: "",
    website: "",
    laboratories: [],
    qualityGoals: [],
  });

  // Lab Dialog
  const [labDialogOpen, setLabDialogOpen] = useState<boolean>(false);
  const [labEditIndex, setLabEditIndex] = useState<number | null>(null);
  const [labForm, setLabForm] = useState<Laboratory>({
    name: "",
    room: "",
    capacity: 40,
    equipment: "",
  });

  // Goal Dialog
  const [goalDialogOpen, setGoalDialogOpen] = useState<boolean>(false);
  const [goalEditIndex, setGoalEditIndex] = useState<number | null>(null);
  const [goalForm, setGoalForm] = useState<QualityGoal>({
    indicator: "",
    target: "",
    note: "",
  });

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

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/department?academicYear=${selectedYear || "2569"}`);
      if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลบริบทแผนกวิชาได้");
      const data = await res.json();
      if (data.profile) {
        setForm({
          ...data.profile,
          laboratories: Array.isArray(data.profile.laboratories) ? data.profile.laboratories : [],
          qualityGoals: Array.isArray(data.profile.qualityGoals) ? data.profile.qualityGoals : [],
        });
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/department", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          academicYear: selectedYear || "2569",
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "บันทึกข้อมูลไม่สำเร็จ");
      }
      const data = await res.json();
      if (data.profile) {
        setForm({
          ...data.profile,
          laboratories: Array.isArray(data.profile.laboratories) ? data.profile.laboratories : [],
          qualityGoals: Array.isArray(data.profile.qualityGoals) ? data.profile.qualityGoals : [],
        });
      }
      setSnackbar({
        open: true,
        message: "บันทึกข้อมูลบริบทแผนกวิชาเรียบร้อยแล้ว",
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "เกิดข้อผิดพลาดในการบันทึก",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Lab handlers
  const handleOpenLabDialog = (index: number | null = null) => {
    if (index !== null) {
      setLabEditIndex(index);
      setLabForm(form.laboratories[index]);
    } else {
      setLabEditIndex(null);
      setLabForm({ name: "", room: "", capacity: 40, equipment: "" });
    }
    setLabDialogOpen(true);
  };

  const handleSaveLab = () => {
    if (!labForm.name.trim()) return;
    const updated = [...form.laboratories];
    if (labEditIndex !== null) {
      updated[labEditIndex] = labForm;
    } else {
      updated.push(labForm);
    }
    setForm({ ...form, laboratories: updated });
    setLabDialogOpen(false);
  };

  const handleDeleteLab = (index: number) => {
    const updated = form.laboratories.filter((_, i) => i !== index);
    setForm({ ...form, laboratories: updated });
  };

  // Goal handlers
  const handleOpenGoalDialog = (index: number | null = null) => {
    if (index !== null) {
      setGoalEditIndex(index);
      setGoalForm(form.qualityGoals[index]);
    } else {
      setGoalEditIndex(null);
      setGoalForm({ indicator: "", target: "", note: "" });
    }
    setGoalDialogOpen(true);
  };

  const handleSaveGoal = () => {
    if (!goalForm.indicator.trim()) return;
    const updated = [...form.qualityGoals];
    if (goalEditIndex !== null) {
      updated[goalEditIndex] = goalForm;
    } else {
      updated.push(goalForm);
    }
    setForm({ ...form, qualityGoals: updated });
    setGoalDialogOpen(false);
  };

  const handleDeleteGoal = (index: number) => {
    const updated = form.qualityGoals.filter((_, i) => i !== index);
    setForm({ ...form, qualityGoals: updated });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
        {/* LEFT: Back Button + Title + Info + Category Chip */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <Tooltip title="กลับหน้าหลัก">
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

          <Typography
            variant="h2"
            noWrap
            sx={{ fontWeight: 700, fontSize: "1.125rem", color: "text.primary" }}
          >
            บริบทและข้อมูลแผนกวิชา
          </Typography>

          <Tooltip title="ข้อมูลพื้นฐาน ปรัชญา วิสัยทัศน์ พันธกิจ ห้องปฏิบัติการ และเป้าหมายคุณภาพ SAR ของแผนกวิชา">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Chip
            size="small"
            label="ข้อมูลบริบท SAR"
            color="primary"
            variant="outlined"
            sx={{ height: 20, fontSize: "0.6875rem" }}
          />
        </Box>

        {/* RIGHT: Refresh + Academic Term + Primary Save Button */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Tooltip title="รีเฟรชข้อมูล">
            <IconButton size="small" onClick={fetchProfile} sx={{ p: 0.5 }}>
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Chip
            icon={<CalendarTodayIcon sx={{ fontSize: 13 }} />}
            label={`รอบข้อมูล ${termLabel}`}
            variant="outlined"
            size="small"
            sx={{ height: 22, fontSize: "0.725rem", display: { xs: "none", sm: "inline-flex" } }}
          />

          <Button
            variant="contained"
            size="small"
            onClick={handleSave}
            disabled={saving || loading}
            startIcon={<SaveIcon sx={{ fontSize: 15 }} />}
            sx={{
              px: 1.5,
              py: 0.35,
              fontSize: "0.75rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
              flexShrink: 0,
              height: 30,
            }}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกข้อมูลแผนก"}
          </Button>
        </Box>
      </Box>

      {/* 2. Navigation Tabs */}
      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            px: 1,
            "& .MuiTab-root": {
              minHeight: 40,
              py: 0.5,
              px: 1.5,
              fontSize: "0.8125rem",
              fontWeight: 600,
              textTransform: "none",
            },
          }}
        >
          <Tab icon={<ApartmentIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="ข้อมูลทั่วไปและวิสัยทัศน์" />
          <Tab icon={<ContactPhoneIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="ผู้บริหารและข้อมูลติดต่อ" />
          <Tab
            icon={<ComputerIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label={`ห้องปฏิบัติการ (${form.laboratories.length})`}
          />
          <Tab
            icon={<TrackChangesIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label={`เป้าหมายคุณภาพ SAR (${form.qualityGoals.length})`}
          />
        </Tabs>
      </Paper>

      {/* 3. Tab Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={36} />
        </Box>
      ) : (
        <>
          {/* TAB 0: ข้อมูลทั่วไปและวิสัยทัศน์ */}
          {activeTab === 0 && (
            <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
              <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700, mb: 2, color: "primary.main" }}>
                ข้อมูลพื้นฐานสถานศึกษาและแผนกวิชา
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 3 }}>
                <TextField
                  label="ชื่อแผนกวิชา (ภาษาไทย)"
                  size="small"
                  value={form.nameTh}
                  onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="ชื่อแผนกวิชา (ภาษาอังกฤษ)"
                  size="small"
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="สังกัดสถานศึกษา / วิทยาลัย"
                  size="small"
                  value={form.collegeName}
                  onChange={(e) => setForm({ ...form, collegeName: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="คณะ / ประเภทวิชา"
                  size="small"
                  value={form.faculty}
                  onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="สีประจำแผนก"
                  size="small"
                  value={form.colors}
                  onChange={(e) => setForm({ ...form, colors: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="ที่ตั้งห้องพักครู / อาคารปฏิบัติการ"
                  size="small"
                  value={form.roomLocation}
                  onChange={(e) => setForm({ ...form, roomLocation: e.target.value })}
                  fullWidth
                />
              </Box>

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700, mb: 2, color: "primary.main" }}>
                ปรัชญา วิสัยทัศน์ พันธกิจ และอัตลักษณ์ (SAR Context)
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="ปรัชญาของแผนกวิชา"
                  size="small"
                  multiline
                  rows={2}
                  value={form.philosophy}
                  onChange={(e) => setForm({ ...form, philosophy: e.target.value })}
                  placeholder="เช่น ความรู้คู่คุณธรรม นำเทคโนโลยี สู่มาตรฐานสากล"
                  fullWidth
                />
                <TextField
                  label="วิสัยทัศน์ (Vision)"
                  size="small"
                  multiline
                  rows={2}
                  value={form.vision}
                  onChange={(e) => setForm({ ...form, vision: e.target.value })}
                  placeholder="เช่น ผลิตและพัฒนากำลังคนด้านเทคโนโลยีคอมพิวเตอร์..."
                  fullWidth
                />
                <TextField
                  label="พันธกิจ (Mission)"
                  size="small"
                  multiline
                  rows={2}
                  value={form.mission}
                  onChange={(e) => setForm({ ...form, mission: e.target.value })}
                  placeholder="เช่น 1. จัดการเรียนการสอนด้านเทคโนโลยีคอมพิวเตอร์..."
                  fullWidth
                />
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <TextField
                    label="เอกลักษณ์ของแผนกวิชา"
                    size="small"
                    value={form.uniqueness}
                    onChange={(e) => setForm({ ...form, uniqueness: e.target.value })}
                    placeholder="เช่น บริการวิชาการ เชี่ยวชาญเทคโนโลยี"
                    fullWidth
                  />
                  <TextField
                    label="อัตลักษณ์ของผู้เรียน"
                    size="small"
                    value={form.identity}
                    onChange={(e) => setForm({ ...form, identity: e.target.value })}
                    placeholder="เช่น ทักษะเยี่ยม เปี่ยมคุณธรรม ล้ำหน้าเทคโนโลยี"
                    fullWidth
                  />
                </Box>
              </Box>
            </Paper>
          )}

          {/* TAB 1: ผู้บริหารและข้อมูลติดต่อ */}
          {activeTab === 1 && (
            <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
              <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700, mb: 2, color: "primary.main" }}>
                ผู้บริหารแผนกวิชา
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 3 }}>
                <TextField
                  label="ชื่อ-นามสกุล หัวหน้าแผนกวิชา"
                  size="small"
                  value={form.headTeacherName}
                  onChange={(e) => setForm({ ...form, headTeacherName: e.target.value })}
                  placeholder="เช่น นายสมศักดิ์ รักเรียน"
                  fullWidth
                />
                <TextField
                  label="เบอร์โทรศัพท์ติดต่อแผนก / หัวหน้าแผนก"
                  size="small"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="เช่น 02-xxx-xxxx ต่อ 104 หรือ 08x-xxx-xxxx"
                  fullWidth
                />
              </Box>

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700, mb: 2, color: "primary.main" }}>
                ช่องทางการสื่อสารและประชาสัมพันธ์
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                <TextField
                  label="อีเมลทางการของแผนกวิชา"
                  size="small"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="เช่น techniccom@college.ac.th"
                  fullWidth
                />
                <TextField
                  label="แฟนเพจ Facebook / เพจประชาสัมพันธ์"
                  size="small"
                  value={form.facebook}
                  onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                  placeholder="เช่น แผนกวิชาเทคโนโลยีคอมพิวเตอร์ วท.เชียงใหม่"
                  fullWidth
                />
                <TextField
                  label="เว็บไซต์แผนก / ลิงก์ระบบงาน"
                  size="small"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="เช่น https://techniccom.college.ac.th"
                  fullWidth
                />
              </Box>
            </Paper>
          )}

          {/* TAB 2: ห้องปฏิบัติการและครุภัณฑ์ */}
          {activeTab === 2 && (
            <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Box>
                  <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                    ห้องปฏิบัติการและสถานที่ฝึกปฏิบัติ (Laboratories)
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    บันทึกรายการห้องปฏิบัติการ เครื่องมือ ครุภัณฑ์สำคัญ เพื่อเป็นข้อมูลประกอบการจัดการเรียนรู้ มาตรฐานที่ 2 SAR
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleOpenLabDialog()}
                  startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                  sx={{ fontSize: "0.75rem", whiteSpace: "nowrap", height: 28 }}
                >
                  เพิ่มห้องปฏิบัติการ
                </Button>
              </Box>

              <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "action.hover" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: 50 }}>ลำดับ</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: 200 }}>ชื่อห้องปฏิบัติการ</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: 100 }}>รหัสห้อง</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: 100 }}>ความจุ (ที่นั่ง)</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>ครุภัณฑ์และอุปกรณ์สำคัญ</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: 80, textAlign: "center" }}>จัดการ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {form.laboratories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
                          ยังไม่มีข้อมูลห้องปฏิบัติการ กดปุ่ม "เพิ่มห้องปฏิบัติการ" ด้านบน
                        </TableCell>
                      </TableRow>
                    ) : (
                      form.laboratories.map((lab, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell sx={{ fontSize: "0.8125rem" }}>{idx + 1}</TableCell>
                          <TableCell sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>{lab.name}</TableCell>
                          <TableCell sx={{ fontSize: "0.8125rem" }}>
                            <Chip size="small" label={lab.room || "-"} variant="outlined" sx={{ height: 20, fontSize: "0.6875rem" }} />
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.8125rem" }}>{lab.capacity} คน</TableCell>
                          <TableCell sx={{ fontSize: "0.75rem", color: "text.secondary" }}>{lab.equipment || "-"}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            <Tooltip title="แก้ไข">
                              <IconButton size="small" onClick={() => handleOpenLabDialog(idx)} sx={{ p: 0.3 }}>
                                <EditIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="ลบ">
                              <IconButton size="small" color="error" onClick={() => handleDeleteLab(idx)} sx={{ p: 0.3 }}>
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

          {/* TAB 3: เป้าหมายคุณภาพ SAR */}
          {activeTab === 3 && (
            <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Box>
                  <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                    เป้าหมายคุณภาพประจำปีการศึกษา (SAR Quality Targets)
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    กำหนดเกณฑ์และค่าเป้าหมายการประกันคุณภาพ เพื่อใช้เป็นเกณฑ์เทียบวัดผลการประเมินตนเองของแผนก
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleOpenGoalDialog()}
                  startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                  sx={{ fontSize: "0.75rem", whiteSpace: "nowrap", height: 28 }}
                >
                  เพิ่มเป้าหมายคุณภาพ
                </Button>
              </Box>

              <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "action.hover" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: 50 }}>ลำดับ</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>ตัวบ่งชี้ / ประเด็นการประเมิน</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: 140 }}>ค่าเป้าหมาย</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: 160 }}>เกณฑ์ SAR อ้างอิง</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: 80, textAlign: "center" }}>จัดการ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {form.qualityGoals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
                          ยังไม่มีข้อมูลเป้าหมายคุณภาพ กดปุ่ม "เพิ่มเป้าหมายคุณภาพ" ด้านบน
                        </TableCell>
                      </TableRow>
                    ) : (
                      form.qualityGoals.map((g, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell sx={{ fontSize: "0.8125rem" }}>{idx + 1}</TableCell>
                          <TableCell sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>{g.indicator}</TableCell>
                          <TableCell sx={{ fontSize: "0.8125rem" }}>
                            <Chip size="small" color="primary" label={g.target} sx={{ height: 22, fontWeight: 700, fontSize: "0.75rem" }} />
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.75rem", color: "text.secondary" }}>{g.note || "-"}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            <Tooltip title="แก้ไข">
                              <IconButton size="small" onClick={() => handleOpenGoalDialog(idx)} sx={{ p: 0.3 }}>
                                <EditIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="ลบ">
                              <IconButton size="small" color="error" onClick={() => handleDeleteGoal(idx)} sx={{ p: 0.3 }}>
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
        </>
      )}

      {/* Lab Modal Dialog */}
      <Dialog open={labDialogOpen} onClose={() => setLabDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: 700 }}>
          {labEditIndex !== null ? "แก้ไขห้องปฏิบัติการ" : "เพิ่มห้องปฏิบัติการใหม่"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="ชื่อห้องปฏิบัติการ"
            size="small"
            value={labForm.name}
            onChange={(e) => setLabForm({ ...labForm, name: e.target.value })}
            placeholder="เช่น ห้องปฏิบัติการเครือข่ายคอมพิวเตอร์"
            fullWidth
            required
            autoFocus
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="รหัสห้อง / เลขห้อง"
              size="small"
              value={labForm.room}
              onChange={(e) => setLabForm({ ...labForm, room: e.target.value })}
              placeholder="เช่น Lab 421"
              fullWidth
            />
            <TextField
              label="ความจุที่นั่ง (คน)"
              size="small"
              type="number"
              value={labForm.capacity}
              onChange={(e) => setLabForm({ ...labForm, capacity: parseInt(e.target.value) || 0 })}
              fullWidth
            />
          </Box>
          <TextField
            label="ครุภัณฑ์และอุปกรณ์สำคัญ"
            size="small"
            multiline
            rows={2}
            value={labForm.equipment}
            onChange={(e) => setLabForm({ ...labForm, equipment: e.target.value })}
            placeholder="เช่น คอมพิวเตอร์ 40 เครื่อง, Cisco Switch, ชุดฝึก IoT"
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button size="small" onClick={() => setLabDialogOpen(false)} sx={{ whiteSpace: "nowrap" }}>
            ยกเลิก
          </Button>
          <Button variant="contained" size="small" onClick={handleSaveLab} sx={{ whiteSpace: "nowrap" }}>
            บันทึกรายการห้อง
          </Button>
        </DialogActions>
      </Dialog>

      {/* Goal Modal Dialog */}
      <Dialog open={goalDialogOpen} onClose={() => setGoalDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: 700 }}>
          {goalEditIndex !== null ? "แก้ไขเป้าหมายคุณภาพ SAR" : "เพิ่มเป้าหมายคุณภาพ SAR"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="ตัวบ่งชี้ / ประเด็นการประเมิน"
            size="small"
            value={goalForm.indicator}
            onChange={(e) => setGoalForm({ ...goalForm, indicator: e.target.value })}
            placeholder="เช่น อัตราคงอยู่ของผู้เรียนในแผนกวิชา"
            fullWidth
            required
            autoFocus
          />
          <TextField
            label="ค่าเป้าหมาย"
            size="small"
            value={goalForm.target}
            onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
            placeholder="เช่น ≥ 95% หรือ 100%"
            fullWidth
            required
          />
          <TextField
            label="เกณฑ์ SAR อ้างอิง / หมายเหตุ"
            size="small"
            value={goalForm.note}
            onChange={(e) => setGoalForm({ ...goalForm, note: e.target.value })}
            placeholder="เช่น มาตรฐานที่ 1 SAR ตัวบ่งชี้ที่ 1.1"
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button size="small" onClick={() => setGoalDialogOpen(false)} sx={{ whiteSpace: "nowrap" }}>
            ยกเลิก
          </Button>
          <Button variant="contained" size="small" onClick={handleSaveGoal} sx={{ whiteSpace: "nowrap" }}>
            บันทึกเป้าหมาย
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
