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
import LinearProgress from "@mui/material/LinearProgress";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

// MUI Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SecurityIcon from "@mui/icons-material/Security";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import RemoveDoneIcon from "@mui/icons-material/RemoveDone";

import { useAcademicYear } from "@/components/layout/AcademicYearContext";
import { PageBreadcrumbs } from "@/components/ui/PageBreadcrumbs";
import {
  PERMISSION_CATEGORIES,
  ALL_PERMISSION_KEYS,
  ROLE_PRESETS,
  RolePreset,
} from "@/lib/permissions";

interface RoleDef {
  id: string;
  code: string;
  title: string;
  description: string | null;
  color: string;
  permissions: string[];
  isSystem: boolean;
  _count?: {
    users: number;
  };
}

const COLOR_OPTIONS = [
  { value: "rose", label: "สีแดง (Rose)" },
  { value: "blue", label: "สีน้ำเงิน (Blue)" },
  { value: "purple", label: "สีม่วง (Purple)" },
  { value: "emerald", label: "สีเขียว (Emerald)" },
  { value: "amber", label: "สีส้มทอง (Amber)" },
  { value: "teal", label: "สีเขียวหัวเป็ด (Teal)" },
  { value: "indigo", label: "สีคราม (Indigo)" },
  { value: "slate", label: "สีเทา (Slate)" },
];

export default function AdminRolesPage() {
  const { data: session } = useSession();
  const { termLabel } = useAcademicYear();

  const [roles, setRoles] = useState<RoleDef[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Snackbar feedback
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Edit / Create Dialog State
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentRoleId, setCurrentRoleId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    code: string;
    description: string;
    color: string;
    permissions: string[];
  }>({
    title: "",
    code: "",
    description: "",
    color: "blue",
    permissions: ["/dashboard"],
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Delete Confirm Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleDef | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  // Fetch roles
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/roles");
      if (!res.ok) {
        throw new Error("ไม่สามารถโหลดข้อมูลยศและสิทธิ์ได้");
      }
      const data = await res.json();
      setRoles(data.roles || []);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "เกิดข้อผิดพลาด", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Open Create Dialog
  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentRoleId(null);
    setFormData({
      title: "",
      code: "",
      description: "",
      color: "blue",
      permissions: ["/dashboard"],
    });
    setDialogOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (role: RoleDef) => {
    setIsEditing(true);
    setCurrentRoleId(role.id);
    setFormData({
      title: role.title,
      code: role.code,
      description: role.description || "",
      color: role.color || "blue",
      permissions: role.permissions || ["/dashboard"],
    });
    setDialogOpen(true);
  };

  // Apply Preset
  const handleApplyPreset = (preset: RolePreset) => {
    setFormData((prev) => ({
      ...prev,
      title: prev.title || preset.title,
      description: prev.description || preset.description,
      color: preset.color,
      permissions: preset.permissions,
    }));
    setSnackbar({
      open: true,
      message: `โหลดสิทธิ์เทมเพลต "${preset.title}" เรียบร้อยแล้ว`,
      severity: "info",
    });
  };

  // Toggle single permission
  const handleTogglePermission = (permKey: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permKey);
      if (exists) {
        return {
          ...prev,
          permissions: prev.permissions.filter((p) => p !== permKey),
        };
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, permKey],
        };
      }
    });
  };

  // Toggle category all
  const handleToggleCategory = (catKeys: string[]) => {
    setFormData((prev) => {
      const allSelected = catKeys.every((k) => prev.permissions.includes(k));
      if (allSelected) {
        // Deselect all in category
        return {
          ...prev,
          permissions: prev.permissions.filter((p) => !catKeys.includes(p)),
        };
      } else {
        // Select all in category
        const combined = Array.from(new Set([...prev.permissions, ...catKeys]));
        return {
          ...prev,
          permissions: combined,
        };
      }
    });
  };

  // Select all permissions
  const handleSelectAll = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: [...ALL_PERMISSION_KEYS, "/dashboard", "/admin/users"],
    }));
  };

  // Clear all permissions
  const handleClearAll = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: ["/dashboard"],
    }));
  };

  // Save submit
  const handleSaveSubmit = async () => {
    try {
      setSubmitting(true);
      if (!formData.title) {
        throw new Error("กรุณาระบุชื่อยศ/สิทธิ์");
      }

      const url = isEditing ? `/api/admin/roles/${currentRoleId}` : "/api/admin/roles";
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
        message: isEditing ? "แก้ไขยศและสิทธิ์สำเร็จ" : "สร้างยศใหม่สำเร็จ",
        severity: "success",
      });
      setDialogOpen(false);
      fetchRoles();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "เกิดข้อผิดพลาด", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete submit
  const handleDeleteSubmit = async () => {
    if (!roleToDelete) return;
    try {
      setDeleteSubmitting(true);
      const res = await fetch(`/api/admin/roles/${roleToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถลบยศนี้ได้");

      setSnackbar({ open: true, message: "ลบยศสำเร็จ", severity: "success" });
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
      fetchRoles();
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
          { label: "จัดการสิทธิ์และบทบาท" },
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
            กำหนดยศและสิทธิ์การใช้งาน
          </Typography>

          <Tooltip title="ระบบกำหนดยศและ Matrix สิทธิ์ Read vs Edit/Action อย่างละเอียดสำหรับทุกปุ่มในระบบ">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Chip size="small" label="การบริหารระบบ" color="primary" variant="outlined" sx={{ height: 20, fontSize: "0.6875rem", display: { xs: "none", sm: "inline-flex" } }} />
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

          <Tooltip title="รีเฟรชข้อมูล">
            <IconButton size="small" onClick={fetchRoles} sx={{ p: 0.4 }}>
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
            สร้างยศใหม่
          </Button>
        </Box>
      </Box>

      {/* 2. Quick Presets Bar */}
      <Paper sx={{ p: 1.25, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mr: 1 }}>
          <AutoAwesomeIcon sx={{ fontSize: 16, color: "primary.main" }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
            เทมเพลตยศมาตรฐาน (Role Presets):
          </Typography>
        </Box>
        {ROLE_PRESETS.map((p) => (
          <Chip
            key={p.code}
            label={p.title}
            size="small"
            onClick={() => {
              handleOpenCreate();
              handleApplyPreset(p);
            }}
            variant="outlined"
            clickable
            sx={{
              height: 22,
              fontSize: "0.725rem",
              fontWeight: 600,
              borderColor: "divider",
              "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
            }}
          />
        ))}
      </Paper>

      {/* 3. Roles Table */}
      <Paper sx={{ overflow: "hidden" }}>
        {loading && <LinearProgress />}
        <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h4" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
            รายการยศและสิทธิ์ในระบบ ({roles.length} ยศ)
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", display: { xs: "none", sm: "block" } }}>
            คลิกปุ่มแก้ไขเพื่อปรับแต่ง Matrix สิทธิ์ Read vs Edit
          </Typography>
        </Box>

        <TableContainer sx={{ overflowX: "auto", width: "100%" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: { xs: 80, sm: 140 } }}>รหัสยศ</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>ชื่อยศ / บทบาท</TableCell>
                <TableCell sx={{ fontWeight: 700, display: { xs: "none", md: "table-cell" } }}>คำอธิบายหน้าที่</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 120, display: { xs: "none", sm: "table-cell" } }} align="center">จำนวนผู้ใช้</TableCell>
                <TableCell sx={{ fontWeight: 700, width: { xs: 110, sm: 140 } }} align="center">สิทธิ์ที่ได้รับ</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 80 }} align="center">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((r) => {
                const permCount = r.code === "ROOT" ? ALL_PERMISSION_KEYS.length : r.permissions?.length || 0;
                return (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <Chip
                          label={r.code}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            bgcolor: r.code === "ROOT" ? "error.50" : "action.hover",
                            color: r.code === "ROOT" ? "error.main" : "text.primary",
                          }}
                        />
                        {r.isSystem && (
                          <Chip size="small" label="ระบบ" variant="outlined" sx={{ height: 18, fontSize: "0.5625rem", display: { xs: "none", sm: "inline-flex" } }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {r.title}
                      </Typography>
                      <Box sx={{ display: { xs: "flex", sm: "none" }, alignItems: "center", gap: 0.5, mt: 0.25 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>{r._count?.users || 0} คน</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {r.description || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ display: { xs: "none", sm: "table-cell" } }}>
                      <Chip
                        size="small"
                        label={`${r._count?.users || 0} คน`}
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.6875rem" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={r.code === "ROOT" ? "สิทธิ์ทั้งหมด 100%" : `${permCount} สิทธิ์`}
                        color={r.code === "ROOT" ? "error" : permCount > 10 ? "success" : "primary"}
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.6875rem", fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                        <Tooltip title="แก้ไขยศและ Matrix สิทธิ์">
                          <IconButton size="small" onClick={() => handleOpenEdit(r)} sx={{ p: 0.3 }}>
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        {!r.isSystem && r.code !== "ROOT" && (
                          <Tooltip title="ลบยศ">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setRoleToDelete(r);
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
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ==================== 4. ROLE EDIT / MATRIX DIALOG ==================== */}
      <Dialog
        open={dialogOpen}
        onClose={() => !submitting && setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem", pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{isEditing ? `แก้ไขยศ: ${formData.title}` : "สร้างยศใหม่และกำหนดยศ"}</span>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Button size="small" startIcon={<DoneAllIcon sx={{ fontSize: 14 }} />} onClick={handleSelectAll} sx={{ fontSize: "0.7rem" }}>
              เลือกทั้งหมด
            </Button>
            <Button size="small" startIcon={<RemoveDoneIcon sx={{ fontSize: 14 }} />} onClick={handleClearAll} sx={{ fontSize: "0.7rem" }}>
              ล้างทั้งหมด
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Top Form Fields */}
          <Box sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr" }, gap: 1.25, mb: 1 }}>
              <TextField
                size="small"
                label="ชื่อยศ / ตำแหน่งสิทธิ์"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
                fullWidth
              />
              <TextField
                size="small"
                label="รหัสย่อ (Code)"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                disabled={isEditing}
                placeholder="เช่น REGISTRAR"
                fullWidth
              />
              <FormControl size="small" fullWidth>
                <InputLabel>สีประจำยศ</InputLabel>
                <Select
                  value={formData.color}
                  label="สีประจำยศ"
                  onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                >
                  {COLOR_OPTIONS.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              size="small"
              label="คำอธิบายหน้าที่ความรับผิดชอบ"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              fullWidth
              sx={{ mb: 1 }}
            />

            {/* Quick Preset loader dropdown inside dialog */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                สลับใช้สิทธิ์สำเร็จรูป (Preset):
              </Typography>
              {ROLE_PRESETS.map((p) => (
                <Button
                  key={p.code}
                  size="small"
                  variant="outlined"
                  onClick={() => handleApplyPreset(p)}
                  sx={{ py: 0.15, px: 0.75, fontSize: "0.6875rem", height: 20 }}
                >
                  {p.title.split(" ")[0]}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Permission Matrix by Categories */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                ตารางสิทธิ์การใช้งานแยกตามปุ่ม/ฟังก์ชัน (เลือกแล้ว {formData.permissions.length} สิทธิ์)
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                ติ๊กถูกในช่องที่ต้องการเปิดสิทธิ์ให้ยศนี้
              </Typography>
            </Box>

            {PERMISSION_CATEGORIES.map((cat) => {
              const catKeys = cat.items.map((i) => i.key);
              const allChecked = catKeys.every((k) => formData.permissions.includes(k));
              const someChecked = catKeys.some((k) => formData.permissions.includes(k));

              return (
                <Card key={cat.id} variant="outlined" sx={{ borderRadius: 1.5 }}>
                  {/* Category Header */}
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.75,
                      bgcolor: "action.hover",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Checkbox
                        size="small"
                        checked={allChecked}
                        indeterminate={someChecked && !allChecked}
                        onChange={() => handleToggleCategory(catKeys)}
                        sx={{ p: 0 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>
                        {cat.title}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", display: { xs: "none", sm: "block" } }}>
                      {cat.description}
                    </Typography>
                  </Box>

                  {/* Items in category */}
                  <CardContent sx={{ p: 1.25, "&:last-child": { pb: 1.25 } }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                      {cat.items.map((item) => {
                        const checked = formData.permissions.includes(item.key);
                        return (
                          <Paper
                            key={item.key}
                            variant="outlined"
                            onClick={() => handleTogglePermission(item.key)}
                            sx={{
                              p: 1,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1,
                              borderRadius: 1,
                              borderColor: checked ? "primary.main" : "divider",
                              bgcolor: checked ? "action.hover" : "transparent",
                              transition: "all 0.15s ease",
                              "&:hover": { borderColor: "primary.main" },
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={checked}
                              onChange={() => handleTogglePermission(item.key)}
                              sx={{ p: 0, mt: 0.2 }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.785rem" }}>
                                  {item.title}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={item.type === "read" ? "อ่าน" : item.type === "edit" ? "แก้ไข" : "แอดมิน"}
                                  color={item.type === "read" ? "info" : item.type === "edit" ? "warning" : "error"}
                                  sx={{ height: 16, fontSize: "0.5625rem", fontWeight: 700 }}
                                />
                              </Box>
                              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.6875rem", display: "block", mt: 0.25 }}>
                                {item.description}
                              </Typography>
                            </Box>
                          </Paper>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSubmit}
            disabled={submitting || !formData.title}
          >
            {submitting ? "กำลังบันทึก..." : "บันทึกยศและสิทธิ์"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== 5. DELETE CONFIRM DIALOG ==================== */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleteSubmitting && setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", color: "error.main" }}>
          ยืนยันการลบยศ/สิทธิ์
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            คุณต้องการลบยศ <b>{roleToDelete?.title}</b> ({roleToDelete?.code}) ใช่หรือไม่?
          </Typography>
          {roleToDelete?._count?.users ? (
            <Alert severity="warning" sx={{ mt: 1.5, py: 0.5 }}>
              มียูสเซอร์อยู่ในยศนี้จำนวน {roleToDelete._count.users} คน กรุณาย้ายยูสเซอร์ก่อนลบ
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteSubmitting}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteSubmit}
            disabled={deleteSubmitting || (roleToDelete?._count?.users || 0) > 0}
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
