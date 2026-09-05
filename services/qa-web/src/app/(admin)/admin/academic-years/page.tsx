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
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";

import { useAcademicYear } from "@/components/layout/AcademicYearContext";
import { PageBreadcrumbs } from "@/components/ui/PageBreadcrumbs";

interface AcademicYearItem {
  id: string;
  year: string;
  semester: string;
  label: string;
  isCurrent: boolean;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
}

export default function AdminAcademicYearsPage() {
  const { termLabel, setSelectedYear, setSelectedSemester } = useAcademicYear();

  const [items, setItems] = useState<AcademicYearItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Snackbar Feedback
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    year: string;
    semester: string;
    label: string;
    isCurrent: boolean;
    isActive: boolean;
  }>({
    year: "2569",
    semester: "1",
    label: "ภาคเรียนที่ 1",
    isCurrent: false,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Delete Confirm Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<AcademicYearItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/academic-years");
      if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลปีการศึกษาได้");
      const data = await res.json();
      setItems(data.items || []);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "เกิดข้อผิดพลาด", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentItemId(null);
    setFormData({
      year: "2569",
      semester: "1",
      label: "ภาคเรียนที่ 1",
      isCurrent: false,
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: AcademicYearItem) => {
    setIsEditing(true);
    setCurrentItemId(item.id);
    setFormData({
      year: item.year,
      semester: item.semester,
      label: item.label,
      isCurrent: item.isCurrent,
      isActive: item.isActive,
    });
    setDialogOpen(true);
  };

  // Set as current system term
  const handleSetCurrent = async (item: AcademicYearItem) => {
    try {
      const res = await fetch(`/api/admin/academic-years/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCurrent: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");

      setSelectedYear(item.year);
      setSelectedSemester(item.semester);

      setSnackbar({
        open: true,
        message: `กำหนดให้ ปีการศึกษา ${item.year} (${item.label}) เป็นรอบข้อมูลหลักแล้ว`,
        severity: "success",
      });
      fetchItems();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "เกิดข้อผิดพลาด", severity: "error" });
    }
  };

  // Save Submit
  const handleSaveSubmit = async () => {
    try {
      setSubmitting(true);
      const url = isEditing ? `/api/admin/academic-years/${currentItemId}` : "/api/admin/academic-years";
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
        message: isEditing ? "แก้ไขรอบปีการศึกษาสำเร็จ" : "เพิ่มรอบปีการศึกษาสำเร็จ",
        severity: "success",
      });
      setDialogOpen(false);
      fetchItems();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "เกิดข้อผิดพลาด", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Submit
  const handleDeleteSubmit = async () => {
    if (!itemToDelete) return;
    try {
      setDeleteSubmitting(true);
      const res = await fetch(`/api/admin/academic-years/${itemToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถลบได้");

      setSnackbar({ open: true, message: "ลบรอบปีการศึกษาสำเร็จ", severity: "success" });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchItems();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "เกิดข้อผิดพลาด", severity: "error" });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.25, sm: 2 }, maxWidth: 1300, mx: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* 0. Breadcrumbs */}
      <PageBreadcrumbs
        items={[
          { label: "ผู้ดูแลระบบ", href: "/dashboard" },
          { label: "กำหนดปีการศึกษาและภาคเรียน" },
        ]}
      />

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

          <Typography variant="h2" sx={{ fontWeight: 700, fontSize: { xs: "0.95rem", sm: "1.125rem" }, color: "text.primary" }}>
            จัดการรอบปีการศึกษาและภาคเรียน
          </Typography>

          <Tooltip title="กำหนดปีการศึกษาและภาคเรียนของสถานศึกษา พร้อมกำหนดรอบข้อมูลหลักของระบบ">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Chip size="small" label="การบริหารระบบ" color="primary" variant="outlined" sx={{ height: 20, fontSize: "0.6875rem", display: { xs: "none", sm: "inline-flex" } }} />
        </Box>

        {/* RIGHT: Term Chip + Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Chip
            icon={<CalendarTodayIcon sx={{ fontSize: 13 }} />}
            label={`รอบข้อมูล ${termLabel}`}
            variant="outlined"
            size="small"
            sx={{ height: 22, fontSize: "0.725rem", display: { xs: "none", sm: "inline-flex" } }}
          />

          <Tooltip title="รีเฟรช">
            <IconButton size="small" onClick={fetchItems} sx={{ p: 0.4 }}>
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
            เพิ่มรอบปีการศึกษา
          </Button>
        </Box>
      </Box>

      {/* 2. Data Table */}
      <Paper sx={{ overflow: "hidden" }}>
        {loading && <LinearProgress />}
        <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h4" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
            รายการรอบปีการศึกษาและภาคเรียน ({items.length} รอบ)
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", display: { xs: "none", sm: "block" } }}>
            รอบที่มีสัญลักษณ์ดาวสีทองคือรอบข้อมูลหลักของสถานศึกษา
          </Typography>
        </Box>

        <TableContainer sx={{ overflowX: "auto", width: "100%" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: { xs: 80, sm: 120 } }}>ปีการศึกษา</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 100, display: { xs: "none", sm: "table-cell" } }}>ภาคเรียน</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>ชื่อรอบข้อมูล</TableCell>
                <TableCell sx={{ fontWeight: 700, width: { xs: 130, sm: 180 } }} align="center">สถานะรอบข้อมูลหลัก</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 100, display: { xs: "none", md: "table-cell" } }} align="center">สถานะเปิดใช้</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 100 }} align="center">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} hover sx={{ bgcolor: item.isCurrent ? "action.hover" : "transparent" }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                      {item.year}
                    </Typography>
                    <Box sx={{ display: { xs: "flex", sm: "none" }, alignItems: "center", gap: 0.5, mt: 0.25 }}>
                      <Chip size="small" label={`เทอม ${item.semester}`} variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    <Chip size="small" label={`เทอม ${item.semester}`} variant="outlined" sx={{ height: 20, fontSize: "0.6875rem" }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: item.isCurrent ? 700 : 500 }}>
                      {item.label}
                    </Typography>
                    <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 0.5, mt: 0.25 }}>
                      <Chip
                        size="small"
                        label={item.isActive ? "เปิดใช้" : "ปิด"}
                        color={item.isActive ? "success" : "default"}
                        sx={{ height: 16, fontSize: 9 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {item.isCurrent ? (
                      <Chip
                        icon={<StarIcon sx={{ fontSize: 13, color: "#d97706 !important" }} />}
                        label="รอบหลัก"
                        sx={{ height: 22, fontSize: "0.6875rem", fontWeight: 700, bgcolor: "amber.50", color: "amber.900" }}
                      />
                    ) : (
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => handleSetCurrent(item)}
                        sx={{ fontSize: "0.6875rem", py: 0.2 }}
                      >
                        ตั้งเป็นรอบหลัก
                      </Button>
                    )}
                  </TableCell>
                  <TableCell align="center" sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Chip
                      size="small"
                      label={item.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      color={item.isActive ? "success" : "default"}
                      sx={{ height: 20, fontSize: "0.6875rem" }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                      <Tooltip title="แก้ไข">
                        <IconButton size="small" onClick={() => handleOpenEdit(item)} sx={{ p: 0.3 }}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      {!item.isCurrent && (
                        <Tooltip title="ลบ">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setItemToDelete(item);
                              setDeleteDialogOpen(true);
                            }}
                            sx={{ p: 0.3 }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 3. Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
          {isEditing ? "แก้ไขรอบปีการศึกษา" : "เพิ่มรอบปีการศึกษาและภาคเรียน"}
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            <TextField
              size="small"
              label="ปีการศึกษา (พ.ศ.)"
              value={formData.year}
              onChange={(e) => setFormData((prev) => ({ ...prev, year: e.target.value }))}
              placeholder="เช่น 2569"
              disabled={isEditing}
              required
            />
            <FormControl size="small">
              <InputLabel>ภาคเรียน</InputLabel>
              <Select
                value={formData.semester}
                label="ภาคเรียน"
                onChange={(e) => {
                  const sem = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    semester: sem,
                    label: sem === "all" ? "ตลอดปีการศึกษา" : `ภาคเรียนที่ ${sem}`,
                  }));
                }}
                disabled={isEditing}
              >
                <MenuItem value="1">ภาคเรียนที่ 1</MenuItem>
                <MenuItem value="2">ภาคเรียนที่ 2</MenuItem>
                <MenuItem value="all">ตลอดปีการศึกษา</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            size="small"
            label="ป้ายกำกับแสดงผล (Label)"
            value={formData.label}
            onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
            fullWidth
            required
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isCurrent}
                onChange={(e) => setFormData((prev) => ({ ...prev, isCurrent: e.target.checked }))}
              />
            }
            label={<Typography variant="body2">ตั้งเป็นรอบข้อมูลหลักของสถานศึกษาทันที</Typography>}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            ยกเลิก
          </Button>
          <Button variant="contained" onClick={handleSaveSubmit} disabled={submitting || !formData.year}>
            {submitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 4. Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => !deleteSubmitting && setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", color: "error.main" }}>
          ยืนยันการลบรอบปีการศึกษา
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            คุณต้องการลบ <b>ปีการศึกษา {itemToDelete?.year} ({itemToDelete?.label})</b> ใช่หรือไม่?
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
