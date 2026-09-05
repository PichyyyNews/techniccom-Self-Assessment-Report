"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import LinearProgress from "@mui/material/LinearProgress";
import InputAdornment from "@mui/material/InputAdornment";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useAcademicYear } from "@/components/layout/AcademicYearContext";

interface SectionItem {
  id: string;
  level: string;
  year: string;
  majorName: string;
  majorCode: string;
  room: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

const COMMON_MAJORS_PRESET = [
  { name: "ช่างเทคนิคคอมพิวเตอร์", code: "ชทค" },
  { name: "เทคโนโลยีสารสนเทศ", code: "สทค" },
  { name: "ช่างอิเล็กทรอนิกส์", code: "ชอท" },
  { name: "ช่างไฟฟ้ากำลัง", code: "ชฟก" },
  { name: "การบัญชี", code: "พบช" },
  { name: "การตลาด", code: "พตก" },
];

export default function AdminCurriculumPage() {
  const { termLabel } = useAcademicYear();

  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [filterLevel, setFilterLevel] = useState<string>("");
  const [search, setSearch] = useState<string>("");

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

  // Add / Edit Dialog
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    level: string;
    year: string;
    majorName: string;
    majorCode: string;
    room: string;
    isActive: boolean;
  }>({
    level: "ปวช",
    year: "1",
    majorName: "ช่างเทคนิคคอมพิวเตอร์",
    majorCode: "ชทค",
    room: "1",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Delete Confirm Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<SectionItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/curriculum");
      if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลห้องเรียนได้");
      const data = await res.json();
      setSections(data.items || []);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "เกิดข้อผิดพลาด", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const filteredSections = sections.filter((s) => {
    const matchLevel = !filterLevel || s.level === filterLevel;
    const matchSearch =
      !search ||
      s.majorName.toLowerCase().includes(search.toLowerCase()) ||
      s.majorCode.toLowerCase().includes(search.toLowerCase()) ||
      s.room.includes(search);
    return matchLevel && matchSearch;
  });

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      level: "ปวช",
      year: "1",
      majorName: "ช่างเทคนิคคอมพิวเตอร์",
      majorCode: "ชทค",
      room: "1",
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (sec: SectionItem) => {
    setIsEditing(true);
    setCurrentId(sec.id);
    setFormData({
      level: sec.level,
      year: sec.year,
      majorName: sec.majorName,
      majorCode: sec.majorCode,
      room: sec.room,
      isActive: sec.isActive,
    });
    setDialogOpen(true);
  };

  const handleSelectPresetMajor = (majorName: string) => {
    const found = COMMON_MAJORS_PRESET.find((m) => m.name === majorName);
    setFormData((prev) => ({
      ...prev,
      majorName,
      majorCode: found ? found.code : prev.majorCode,
    }));
  };

  const handleSaveSubmit = async () => {
    try {
      setSubmitting(true);
      const url = isEditing ? `/api/admin/curriculum/${currentId}` : "/api/admin/curriculum";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึก");

      setSnackbar({
        open: true,
        message: isEditing ? "แก้ไขห้องเรียนสำเร็จ" : "เพิ่มห้องเรียนสำเร็จ",
        severity: "success",
      });
      setDialogOpen(false);
      fetchSections();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "เกิดข้อผิดพลาด", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!itemToDelete) return;
    try {
      setDeleteSubmitting(true);
      const res = await fetch(`/api/admin/curriculum/${itemToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถลบได้");

      setSnackbar({ open: true, message: "ลบห้องเรียนสำเร็จ", severity: "success" });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchSections();
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
        {/* LEFT: Back Button + Title + Standard Tag */}
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

          <Typography variant="h2" sx={{ fontWeight: 700, fontSize: "1.125rem", color: "text.primary" }}>
            จัดการระดับชั้น สาขาวิชา และห้องเรียน (Curriculum & Sections)
          </Typography>

          <Tooltip title="กำหนดโครงสร้างชั้นเรียนเป้าหมายสำหรับนักศึกษา การเช็คชื่อ และตัวกรองในระบบ">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Chip size="small" label="การบริหารระบบ" color="primary" variant="outlined" sx={{ height: 20, fontSize: "0.6875rem" }} />
        </Box>

        {/* RIGHT: Academic Term + Primary CTA */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Chip
            icon={<CalendarTodayIcon sx={{ fontSize: 13 }} />}
            label={`รอบข้อมูล ${termLabel}`}
            variant="outlined"
            size="small"
            sx={{ height: 22, fontSize: "0.725rem", display: { xs: "none", sm: "inline-flex" } }}
          />

          <Tooltip title="รีเฟรช">
            <IconButton size="small" onClick={fetchSections} sx={{ p: 0.4 }}>
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 15 }} />}
            onClick={handleOpenCreate}
            sx={{ px: 1.25, py: 0.35, fontSize: "0.75rem", fontWeight: 600 }}
          >
            เพิ่มห้องเรียน
          </Button>
        </Box>
      </Box>

      {/* 2. Filter Bar */}
      <Paper sx={{ p: 1.25, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <TextField
          size="small"
          placeholder="ค้นหาสาขาวิชา หรือรหัสย่อ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 240, flex: { xs: "1 1 100%", sm: "1 1 auto" } }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>ระดับชั้น</InputLabel>
          <Select value={filterLevel} label="ระดับชั้น" onChange={(e) => setFilterLevel(e.target.value)}>
            <MenuItem value="">ทั้งหมด</MenuItem>
            <MenuItem value="ปวช">ปวช</MenuItem>
            <MenuItem value="ปวส">ปวส</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="caption" sx={{ color: "text.secondary", ml: "auto" }}>
          พบ {filteredSections.length} ห้องเรียน
        </Typography>
      </Paper>

      {/* 3. Data Table */}
      <Paper sx={{ overflow: "hidden" }}>
        {loading && <LinearProgress />}
        <TableContainer sx={{ maxHeight: 620 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: 100 }}>ระดับชั้น</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 80 }}>ชั้นปี</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>สาขาวิชา</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 100 }}>รหัสย่อ</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 90 }}>ห้อง/กลุ่ม</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 100 }} align="center">สถานะ</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 90 }} align="center">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSections.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Chip
                      size="small"
                      label={s.level}
                      color={s.level === "ปวส" ? "secondary" : "primary"}
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.6875rem", fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ปี {s.year}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{s.majorName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={s.majorCode} sx={{ height: 20, fontSize: "0.6875rem", fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={`กลุ่ม ${s.room}`} variant="outlined" sx={{ height: 20, fontSize: "0.6875rem" }} />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={s.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      color={s.isActive ? "success" : "default"}
                      sx={{ height: 20, fontSize: "0.6875rem" }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                      <Tooltip title="แก้ไข">
                        <IconButton size="small" onClick={() => handleOpenEdit(s)} sx={{ p: 0.3 }}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ลบ">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setItemToDelete(s);
                            setDeleteDialogOpen(true);
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

      {/* 4. Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
          {isEditing ? "แก้ไขข้อมูลห้องเรียน" : "เพิ่มระดับชั้น สาขาวิชา และห้องเรียน"}
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
            <FormControl size="small">
              <InputLabel>ระดับชั้น</InputLabel>
              <Select
                value={formData.level}
                label="ระดับชั้น"
                onChange={(e) => setFormData((prev) => ({ ...prev, level: e.target.value }))}
              >
                <MenuItem value="ปวช">ปวช</MenuItem>
                <MenuItem value="ปวส">ปวส</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>ชั้นปี</InputLabel>
              <Select
                value={formData.year}
                label="ชั้นปี"
                onChange={(e) => setFormData((prev) => ({ ...prev, year: e.target.value }))}
              >
                <MenuItem value="1">ปี 1</MenuItem>
                <MenuItem value="2">ปี 2</MenuItem>
                <MenuItem value="3">ปี 3</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>ห้อง / กลุ่ม</InputLabel>
              <Select
                value={formData.room}
                label="ห้อง / กลุ่ม"
                onChange={(e) => setFormData((prev) => ({ ...prev, room: e.target.value }))}
              >
                <MenuItem value="1">กลุ่ม 1</MenuItem>
                <MenuItem value="2">กลุ่ม 2</MenuItem>
                <MenuItem value="3">กลุ่ม 3</MenuItem>
                <MenuItem value="4">กลุ่ม 4</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 1 }}>
            <TextField
              size="small"
              label="ชื่อเต็มสาขาวิชา"
              value={formData.majorName}
              onChange={(e) => setFormData((prev) => ({ ...prev, majorName: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              size="small"
              label="รหัสย่อสาขา"
              value={formData.majorCode}
              onChange={(e) => setFormData((prev) => ({ ...prev, majorCode: e.target.value }))}
              placeholder="เช่น ชทค"
              fullWidth
              required
            />
          </Box>

          {/* Quick Major Selector */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
              สาขาแนะนำ:
            </Typography>
            {COMMON_MAJORS_PRESET.map((m) => (
              <Chip
                key={m.code}
                size="small"
                label={m.name}
                onClick={() => handleSelectPresetMajor(m.name)}
                clickable
                sx={{ height: 20, fontSize: "0.6875rem" }}
              />
            ))}
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
            }
            label={<Typography variant="body2">เปิดใช้งานห้องเรียนนี้ในระบบ</Typography>}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            ยกเลิก
          </Button>
          <Button variant="contained" onClick={handleSaveSubmit} disabled={submitting || !formData.majorName || !formData.majorCode}>
            {submitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 5. Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => !deleteSubmitting && setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", color: "error.main" }}>
          ยืนยันการลบห้องเรียน
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            คุณต้องการลบห้องเรียน <b>{itemToDelete?.level}.{itemToDelete?.year} {itemToDelete?.majorName} (กลุ่ม {itemToDelete?.room})</b> ใช่หรือไม่?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteSubmitting}>
            ยกเลิก
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteSubmit} disabled={deleteSubmitting}>
            {deleteSubmitting ? "กำลังลบ..." : "ยืนยันการลบ"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
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
