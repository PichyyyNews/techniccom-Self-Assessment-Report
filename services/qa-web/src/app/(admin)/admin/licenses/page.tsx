"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";

// MUI Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import BadgeIcon from "@mui/icons-material/Badge";
import SchoolIcon from "@mui/icons-material/School";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SecurityIcon from "@mui/icons-material/Security";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WorkIcon from "@mui/icons-material/Work";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DescriptionIcon from "@mui/icons-material/Description";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { useAcademicYear } from "@/components/layout/AcademicYearContext";
import { PageBreadcrumbs } from "@/components/ui/PageBreadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";

export interface LicenseCategoryItem {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  isSystem: boolean;
  licenseCount?: number;
}

export interface LicenseConfigItem {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  category: string;
  categoryLabel?: string | null;
  defaultYears: number;
  issuer?: string | null;
  color: string;
  icon: string;
  requiresProvisionalRound: boolean;
  requiresTitle: boolean;
  titleLabel?: string | null;
  titlePlaceholder?: string | null;
  presetChips: string[];
  sortOrder: number;
  isActive: boolean;
  isSystem: boolean;
  usageCount?: number;
}

const COLOR_OPTIONS = [
  { value: "teal", label: "สีเขียวหัวเป็ด (Teal)", colorCode: "#0f766e" },
  { value: "blue", label: "สีน้ำเงิน (Blue)", colorCode: "#1d4ed8" },
  { value: "purple", label: "สีม่วง (Purple)", colorCode: "#7e22ce" },
  { value: "emerald", label: "สีเขียว (Emerald)", colorCode: "#047857" },
  { value: "amber", label: "สีส้ม/ทอง (Amber)", colorCode: "#b45309" },
  { value: "indigo", label: "สีคราม (Indigo)", colorCode: "#4338ca" },
  { value: "rose", label: "สีแดง (Rose)", colorCode: "#be123c" },
  { value: "slate", label: "สีเทา (Slate)", colorCode: "#475569" },
];

const ICON_OPTIONS = [
  { value: "GraduationCap", label: "หมวกบัณฑิต (GraduationCap)", icon: <SchoolIcon /> },
  { value: "Award", label: "เหรียญรางวัล (Award)", icon: <EmojiEventsIcon /> },
  { value: "Shield", label: "โล่ป้องกัน (Shield)", icon: <SecurityIcon /> },
  { value: "Clock", label: "นาฬิกาผ่อนผัน (Clock)", icon: <AccessTimeIcon /> },
  { value: "FileBadge", label: "บัตรรับรอง (FileBadge)", icon: <BadgeIcon /> },
  { value: "Briefcase", label: "กระเป๋าช่าง/งาน (Briefcase)", icon: <WorkIcon /> },
  { value: "Sparkles", label: "ประกายดาว/สากล (Sparkles)", icon: <AutoAwesomeIcon /> },
  { value: "FileText", label: "เอกสารทั่วไป (FileText)", icon: <DescriptionIcon /> },
];

function renderLicenseIcon(iconName: string, fontSize = 20) {
  switch (iconName) {
    case "GraduationCap":
      return <SchoolIcon sx={{ fontSize }} />;
    case "Award":
      return <EmojiEventsIcon sx={{ fontSize }} />;
    case "Shield":
      return <SecurityIcon sx={{ fontSize }} />;
    case "Clock":
      return <AccessTimeIcon sx={{ fontSize }} />;
    case "FileBadge":
      return <BadgeIcon sx={{ fontSize }} />;
    case "Briefcase":
      return <WorkIcon sx={{ fontSize }} />;
    case "Sparkles":
      return <AutoAwesomeIcon sx={{ fontSize }} />;
    case "FileText":
    default:
      return <DescriptionIcon sx={{ fontSize }} />;
  }
}

export default function AdminLicensesPage() {
  const { data: session } = useSession();
  const { termLabel } = useAcademicYear();

  // Licenses Config State
  const [licenseConfigs, setLicenseConfigs] = useState<LicenseConfigItem[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [licenseCategoryFilter, setLicenseCategoryFilter] = useState("ALL");
  const [inlineNewChip, setInlineNewChip] = useState<Record<string, string>>({});

  // Category State
  const [categories, setCategories] = useState<LicenseCategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryManagerModal, setShowCategoryManagerModal] = useState(false);
  const [showCategoryEditModal, setShowCategoryEditModal] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<LicenseCategoryItem | null>(null);
  const [categoryFormSubmitting, setCategoryFormSubmitting] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    code: "",
    title: "",
    description: "",
    icon: "GraduationCap",
    color: "teal",
    sortOrder: 0,
    isActive: true,
  });

  // License Modal State
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licenseModalMode, setLicenseModalMode] = useState<"create" | "edit">("create");
  const [selectedLicense, setSelectedLicense] = useState<LicenseConfigItem | null>(null);
  const [licenseFormSubmitting, setLicenseFormSubmitting] = useState(false);
  const [licenseModalChipInput, setLicenseModalChipInput] = useState("");
  const [licenseFormData, setLicenseFormData] = useState({
    code: "",
    title: "",
    description: "",
    category: "vocational",
    categoryLabel: "คุณวุฒิวิชาชีพ / มาตรฐานฝีมือ (TPQI/DSD/กว.)",
    defaultYears: 5,
    issuer: "",
    color: "emerald",
    icon: "FileBadge",
    requiresProvisionalRound: false,
    requiresTitle: true,
    titleLabel: "ระบุสาขาวิชาชีพ / ระดับมาตรฐาน",
    titlePlaceholder: "เช่น สาขาเทคโนโลยีสารสนเทศและการสื่อสาร ระดับ 4",
    presetChips: [] as string[],
    sortOrder: 0,
    isActive: true,
  });

  // Feedback Snackbar & Confirm Dialog
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => Promise<void>;
  }>({ open: false, title: "", content: "", onConfirm: async () => {} });

  // Fetch License Configs
  const fetchLicenseConfigs = async () => {
    try {
      setLoadingConfigs(true);
      const res = await fetch("/api/admin/license-configs");
      if (res.ok) {
        const data = await res.json();
        setLicenseConfigs(data.configs || []);
      }
    } catch (err) {
      console.error("Failed to fetch license configs", err);
    } finally {
      setLoadingConfigs(false);
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch("/api/admin/license-categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchLicenseConfigs();
    fetchCategories();
  }, []);

  // Reset to System Defaults
  const handleResetLicenseDefaults = async () => {
    setConfirmDialog({
      open: true,
      title: "คืนค่าเริ่มต้นมาตรฐานหรือไม่?",
      content:
        "ระบบจะทำการกู้คืนประเภทใบอนุญาตมาตรฐานคุรุสภา (A/B/P-License), หนังสือผ่อนผัน, คุณวุฒิ TPQI, กว. และหมวดหมู่หลักกลับคืนมา",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/license-configs/reset", { method: "POST" });
          if (res.ok) {
            setSnackbar({
              open: true,
              message: "คืนค่าเริ่มต้นมาตรฐานใบอนุญาตเรียบร้อยแล้ว",
              severity: "success",
            });
            await fetchLicenseConfigs();
            await fetchCategories();
          } else {
            throw new Error("ไม่สามารถรีเซ็ตได้");
          }
        } catch (err: any) {
          setSnackbar({
            open: true,
            message: err.message || "เกิดข้อผิดพลาดในการคืนค่าเริ่มต้น",
            severity: "error",
          });
        }
      },
    });
  };

  // Toggle Active License
  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const res = await fetch(`/api/admin/license-configs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentState }),
      });
      if (res.ok) {
        setLicenseConfigs((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: !currentState } : c))
        );
        setSnackbar({
          open: true,
          message: !currentState ? "เปิดใช้งานใบอนุญาตแล้ว" : "ปิดการใช้งานใบอนุญาตแล้ว",
          severity: "info",
        });
      }
    } catch {
      setSnackbar({ open: true, message: "เกิดข้อผิดพลาดในการสลับสถานะ", severity: "error" });
    }
  };

  // Delete License Config
  const handleDeleteConfig = (config: LicenseConfigItem) => {
    setConfirmDialog({
      open: true,
      title: `ลบประเภทใบอนุญาต "${config.title}"?`,
      content: "หากลบแล้ว รายการนี้จะไม่ปรากฏให้เลือกในหน้าโปรไฟล์ครูอีกต่อไป",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/license-configs/${config.id}`, { method: "DELETE" });
          if (res.ok) {
            setLicenseConfigs((prev) => prev.filter((c) => c.id !== config.id));
            setSnackbar({ open: true, message: "ลบประเภทใบอนุญาตสำเร็จ", severity: "success" });
          } else {
            const data = await res.json();
            throw new Error(data.error || "ลบไม่สำเร็จ");
          }
        } catch (err: any) {
          setSnackbar({ open: true, message: err.message, severity: "error" });
        }
      },
    });
  };

  // Open Create/Edit License Modal
  const openCreateLicenseModal = () => {
    setLicenseModalMode("create");
    setSelectedLicense(null);
    setLicenseModalChipInput("");
    setLicenseFormData({
      code: "",
      title: "",
      description: "",
      category: categories[0]?.code || "ksp",
      categoryLabel: categories[0]?.title || "ใบอนุญาตคุรุสภา / ผ่อนผัน (KSP)",
      defaultYears: 5,
      issuer: "",
      color: "teal",
      icon: "FileBadge",
      requiresProvisionalRound: false,
      requiresTitle: false,
      titleLabel: "ระบุสาขาวิชาชีพ / ระดับมาตรฐาน",
      titlePlaceholder: "เช่น สาขาเทคโนโลยีสารสนเทศและการสื่อสาร ระดับ 4",
      presetChips: [],
      sortOrder: licenseConfigs.length + 1,
      isActive: true,
    });
    setShowLicenseModal(true);
  };

  const openEditLicenseModal = (item: LicenseConfigItem) => {
    setLicenseModalMode("edit");
    setSelectedLicense(item);
    setLicenseModalChipInput("");
    setLicenseFormData({
      code: item.code,
      title: item.title,
      description: item.description || "",
      category: item.category,
      categoryLabel: item.categoryLabel || "",
      defaultYears: item.defaultYears,
      issuer: item.issuer || "",
      color: item.color,
      icon: item.icon,
      requiresProvisionalRound: item.requiresProvisionalRound,
      requiresTitle: item.requiresTitle,
      titleLabel: item.titleLabel || "ระบุสาขาวิชาชีพ / ระดับมาตรฐาน",
      titlePlaceholder: item.titlePlaceholder || "",
      presetChips: item.presetChips || [],
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setShowLicenseModal(true);
  };

  // Submit License Form
  const handleLicenseFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLicenseFormSubmitting(true);
    try {
      const url =
        licenseModalMode === "create"
          ? "/api/admin/license-configs"
          : `/api/admin/license-configs/${selectedLicense?.id}`;
      const method = licenseModalMode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(licenseFormData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึก");

      setSnackbar({
        open: true,
        message: licenseModalMode === "create" ? "เพิ่มประเภทใบอนุญาตสำเร็จ" : "แก้ไขสำเร็จ",
        severity: "success",
      });
      setShowLicenseModal(false);
      await fetchLicenseConfigs();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setLicenseFormSubmitting(false);
    }
  };

  // Submit Category Form
  const handleCategoryFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryFormSubmitting(true);
    try {
      const url =
        categoryModalMode === "create"
          ? "/api/admin/license-categories"
          : `/api/admin/license-categories/${selectedCategory?.id}`;
      const method = categoryModalMode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryFormData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึก");

      setSnackbar({
        open: true,
        message: categoryModalMode === "create" ? "เพิ่มหมวดหมู่สำเร็จ" : "แก้ไขหมวดหมู่สำเร็จ",
        severity: "success",
      });
      setShowCategoryEditModal(false);
      await fetchCategories();
      await fetchLicenseConfigs();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setCategoryFormSubmitting(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = (cat: LicenseCategoryItem) => {
    setConfirmDialog({
      open: true,
      title: `ลบหมวดหมู่ "${cat.title}"?`,
      content: "หากลบแล้ว ประเภทใบอนุญาตที่อยู่ในหมวดหมู่นี้อาจไม่แสดงผลตามหมวดหมู่ได้",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/license-categories/${cat.id}`, { method: "DELETE" });
          if (res.ok) {
            setCategories((prev) => prev.filter((c) => c.id !== cat.id));
            setSnackbar({ open: true, message: "ลบหมวดหมู่สำเร็จ", severity: "success" });
          } else {
            const data = await res.json();
            throw new Error(data.error || "ลบไม่สำเร็จ");
          }
        } catch (err: any) {
          setSnackbar({ open: true, message: err.message, severity: "error" });
        }
      },
    });
  };

  // Filtered Licenses
  const filteredLicenses = licenseConfigs.filter((c) => {
    if (licenseCategoryFilter === "ALL") return true;
    return c.category === licenseCategoryFilter;
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: { xs: 1.5, sm: 2.5 } }}>
      {/* Breadcrumbs Navigation */}
      <PageBreadcrumbs
        items={[
          { label: "ผู้ดูแลระบบ", href: "/admin" },
          { label: "ตั้งค่าระบบ & มาสเตอร์ข้อมูล", href: "/admin/settings" },
          { label: "ตั้งค่าประเภทใบอนุญาตวิชาชีพ (Licenses Master)" },
        ]}
      />

      {/* Universal Ultra-Compact Header */}
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
        {/* LEFT: Universal Back Button + Page Title + Tooltip + SAR Standard Tag */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Tooltip title="กลับหน้าหลักการตั้งค่า">
            <IconButton
              component={Link}
              href="/admin/settings"
              size="small"
              sx={{ color: "text.secondary", p: 0.4 }}
              aria-label="ย้อนกลับ"
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Typography variant="h2" sx={{ fontWeight: 700, fontSize: "1.125rem", color: "text.primary" }}>
            จัดการประเภทใบอนุญาตประกอบวิชาชีพครูและวิชาชีพเฉพาะ
          </Typography>

          <Tooltip title="กำหนดรายการตัวเลือกประเภทใบอนุญาต คุรุสภา (A/B/P-License), TPQI, กรมพัฒนาฝีมือแรงงาน และใบ กว. เพื่อให้ครูและบุคลากรเลือกกรอกได้อย่างถูกต้อง">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Chip
            size="small"
            label="มาตรฐานที่ 1 ครู & สารสนเทศ SAR"
            color="primary"
            variant="outlined"
            sx={{ height: 20, fontSize: "0.6875rem" }}
          />
        </Box>

        {/* RIGHT: Academic Term Indicator + Primary Action Button */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
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
            startIcon={<AddIcon sx={{ fontSize: 15 }} />}
            onClick={openCreateLicenseModal}
            sx={{ px: 1.25, py: 0.35, fontSize: "0.75rem", fontWeight: 600 }}
          >
            เพิ่มใบอนุญาตใหม่
          </Button>
        </Box>
      </Box>

      {/* 2. Summary KPI Stat Cards */}
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block" }}>
              ประเภททั้งหมด
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, fontFamily: "monospace" }}>
              {licenseConfigs.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(15, 118, 110, 0.04)" }}>
            <Typography variant="caption" sx={{ color: "#0f766e", fontWeight: 700, display: "block" }}>
              คุรุสภา / ผ่อนผัน
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, fontFamily: "monospace", color: "#0f766e" }}>
              {licenseConfigs.filter((c) => c.category === "ksp").length}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(4, 120, 87, 0.04)" }}>
            <Typography variant="caption" sx={{ color: "#047857", fontWeight: 700, display: "block" }}>
              คุณวุฒิสายอาชีพ (TPQI/DSD)
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, fontFamily: "monospace", color: "#047857" }}>
              {licenseConfigs.filter((c) => c.category === "vocational").length}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(29, 78, 216, 0.04)" }}>
            <Typography variant="caption" sx={{ color: "#1d4ed8", fontWeight: 700, display: "block" }}>
              ตัวเลือกแนะนำ (Preset Chips)
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, fontFamily: "monospace", color: "#1d4ed8" }}>
              {licenseConfigs.reduce((acc, c) => acc + (c.presetChips?.length || 0), 0)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 3. Filter Bar & Reset Defaults */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.25,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
          <Chip
            label="ทั้งหมด"
            size="small"
            clickable
            color={licenseCategoryFilter === "ALL" ? "primary" : "default"}
            variant={licenseCategoryFilter === "ALL" ? "filled" : "outlined"}
            onClick={() => setLicenseCategoryFilter("ALL")}
            sx={{ fontWeight: 600, height: 26 }}
          />
          {categories.map((c) => (
            <Chip
              key={c.code}
              label={c.title}
              size="small"
              clickable
              color={licenseCategoryFilter === c.code ? "primary" : "default"}
              variant={licenseCategoryFilter === c.code ? "filled" : "outlined"}
              onClick={() => setLicenseCategoryFilter(c.code)}
              sx={{ fontWeight: 600, height: 26 }}
            />
          ))}
        </Box>

        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<RefreshIcon sx={{ fontSize: 15 }} />}
          onClick={handleResetLicenseDefaults}
          sx={{ fontSize: "0.75rem", fontWeight: 600, py: 0.35 }}
        >
          คืนค่าเริ่มต้นมาตรฐาน (Reset Defaults)
        </Button>
      </Paper>

      {/* 4. License Configurations List / Grid */}
      {loadingConfigs ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 12, md: 6 }} key={i}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Skeleton variant="text" width="60%" height={28} />
                <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1.5 }} />
                <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 1.5, mb: 1.5 }} />
                <Skeleton variant="text" width="30%" height={24} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : filteredLicenses.length === 0 ? (
        <EmptyState
          icon={<BadgeIcon sx={{ fontSize: 44 }} />}
          title="ไม่พบรายการประเภทใบอนุญาต"
          description="ยังไม่มีการกำหนดประเภทใบอนุญาตในหมวดหมู่นี้ คุณสามารถคลิกปุ่มด้านล่างเพื่อเพิ่มใหม่ หรือคืนค่าเริ่มต้นมาตรฐานของระบบ"
          actionLabel="คืนค่าเริ่มต้นมาตรฐาน (Reset Defaults)"
          onAction={handleResetLicenseDefaults}
          actionIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
        />
      ) : (
        <Grid container spacing={2}>
          {filteredLicenses.map((config) => (
            <Grid size={{ xs: 12, md: 6 }} key={config.id}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2.5,
                  opacity: config.isActive ? 1 : 0.65,
                  bgcolor: config.isActive ? "background.paper" : "action.hover",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  transition: "box-shadow 0.2s ease",
                  "&:hover": { boxShadow: 2 },
                }}
              >
                <CardContent sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column", gap: 1.25 }}>
                  {/* Card Header */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: 2,
                          bgcolor: "action.hover",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "primary.main",
                        }}
                      >
                        {renderLicenseIcon(config.icon, 20)}
                      </Box>
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                            {config.title}
                          </Typography>
                          <Chip
                            label={config.code}
                            size="small"
                            sx={{ height: 18, fontSize: "0.625rem", fontFamily: "monospace", fontWeight: 700 }}
                          />
                        </Box>
                        {config.issuer && (
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                            ออกโดย: {config.issuer}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={config.isActive}
                          onChange={() => handleToggleActive(config.id, config.isActive)}
                        />
                      }
                      label={config.isActive ? "เปิดใช้" : "ปิด"}
                      sx={{ mr: 0, "& .MuiTypography-root": { fontSize: "0.75rem", fontWeight: 600 } }}
                    />
                  </Box>

                  {/* Description */}
                  {config.description && (
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem", lineHeight: 1.5 }}>
                      {config.description}
                    </Typography>
                  )}

                  {/* Meta Chips */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`อายุการใช้งาน ${config.defaultYears} ปี`}
                      sx={{ height: 22, fontSize: "0.7rem" }}
                    />
                    {config.requiresProvisionalRound && (
                      <Chip
                        size="small"
                        color="warning"
                        variant="outlined"
                        label="รองรับบันทึกรอบผ่อนผัน"
                        sx={{ height: 22, fontSize: "0.7rem" }}
                      />
                    )}
                    {config.requiresTitle && (
                      <Chip
                        size="small"
                        color="info"
                        variant="outlined"
                        label="ต้องระบุสาขา/ระดับ"
                        sx={{ height: 22, fontSize: "0.7rem" }}
                      />
                    )}
                  </Box>

                  {/* Preset Chips */}
                  {config.presetChips && config.presetChips.length > 0 && (
                    <Box sx={{ pt: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 0.5 }}>
                        ตัวเลือกแนะนำ ({config.presetChips.length} รายการ):
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {config.presetChips.map((chip, idx) => (
                          <Chip
                            key={idx}
                            size="small"
                            label={chip}
                            variant="outlined"
                            sx={{ height: 20, fontSize: "0.6875rem", bgcolor: "rgba(15, 118, 110, 0.04)" }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>

                <Divider />

                {/* Card Actions */}
                <CardActions sx={{ px: 2, py: 1, justifyContent: "space-between" }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                    หมวดหมู่: {config.categoryLabel || config.category}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Tooltip title="แก้ไข">
                      <IconButton size="small" onClick={() => openEditLicenseModal(config)}>
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    {!config.isSystem && (
                      <Tooltip title="ลบ">
                        <IconButton size="small" color="error" onClick={() => handleDeleteConfig(config)}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ================= MODAL 1: CATEGORY MANAGER ================= */}
      <Dialog
        open={showCategoryManagerModal}
        onClose={() => setShowCategoryManagerModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>จัดการหมวดหมู่มาตรฐานวิชาชีพ ({categories.length} หมวดหมู่)</span>
          <IconButton size="small" onClick={() => setShowCategoryManagerModal(false)}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {categories.map((cat) => (
              <Paper
                key={cat.id}
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                    {cat.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    รหัส: {cat.code} {cat.description ? `• ${cat.description}` : ""}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setCategoryModalMode("edit");
                      setSelectedCategory(cat);
                      setCategoryFormData({
                        code: cat.code,
                        title: cat.title,
                        description: cat.description || "",
                        icon: cat.icon || "GraduationCap",
                        color: cat.color || "teal",
                        sortOrder: cat.sortOrder,
                        isActive: cat.isActive,
                      });
                      setShowCategoryEditModal(true);
                    }}
                  >
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  {!cat.isSystem && (
                    <IconButton size="small" color="error" onClick={() => handleDeleteCategory(cat)}>
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => {
              setCategoryModalMode("create");
              setSelectedCategory(null);
              setCategoryFormData({
                code: "",
                title: "",
                description: "",
                icon: "GraduationCap",
                color: "teal",
                sortOrder: categories.length + 1,
                isActive: true,
              });
              setShowCategoryEditModal(true);
            }}
          >
            เพิ่มหมวดหมู่ใหม่
          </Button>
          <Button onClick={() => setShowCategoryManagerModal(false)} color="inherit" size="small">
            ปิด
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= MODAL 2: CATEGORY EDIT / CREATE ================= */}
      <Dialog
        open={showCategoryEditModal}
        onClose={() => setShowCategoryEditModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <form onSubmit={handleCategoryFormSubmit}>
          <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>
            {categoryModalMode === "create" ? "เพิ่มหมวดหมู่ใหม่" : "แก้ไขหมวดหมู่"}
          </DialogTitle>
          <DialogContent dividers sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              size="small"
              label="รหัสหมวดหมู่ (Code) *"
              required
              disabled={categoryModalMode === "edit" && selectedCategory?.isSystem}
              value={categoryFormData.code}
              onChange={(e) =>
                setCategoryFormData((prev) => ({
                  ...prev,
                  code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                }))
              }
              helperText="ภาษาอังกฤษตัวพิมพ์เล็ก เช่น ksp, vocational, custom"
            />
            <TextField
              size="small"
              label="ชื่อหมวดหมู่ *"
              required
              value={categoryFormData.title}
              onChange={(e) => setCategoryFormData((prev) => ({ ...prev, title: e.target.value }))}
            />
            <TextField
              size="small"
              label="คำอธิบาย"
              multiline
              rows={2}
              value={categoryFormData.description}
              onChange={(e) => setCategoryFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </DialogContent>
          <DialogActions sx={{ p: 1.5 }}>
            <Button onClick={() => setShowCategoryEditModal(false)} color="inherit" size="small">
              ยกเลิก
            </Button>
            <Button type="submit" variant="contained" size="small" disabled={categoryFormSubmitting}>
              {categoryFormSubmitting ? "กำลังบันทึก..." : "บันทึกหมวดหมู่"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ================= MODAL 3: LICENSE CONFIG CREATE / EDIT ================= */}
      <Dialog
        open={showLicenseModal}
        onClose={() => setShowLicenseModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleLicenseFormSubmit}>
          <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>
            {licenseModalMode === "create" ? "เพิ่มประเภทใบอนุญาตใหม่" : "แก้ไขประเภทใบอนุญาต"}
          </DialogTitle>
          <DialogContent dividers sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.75 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
              <TextField
                size="small"
                label="รหัสประเภท (Code) *"
                required
                value={licenseFormData.code}
                onChange={(e) =>
                  setLicenseFormData((prev) => ({
                    ...prev,
                    code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"),
                  }))
                }
                placeholder="เช่น KSP_B_LICENSE, TPQI_IT"
              />
              <FormControl size="small" fullWidth>
                <InputLabel>หมวดหมู่ *</InputLabel>
                <Select
                  value={licenseFormData.category}
                  label="หมวดหมู่ *"
                  onChange={(e) => {
                    const selCat = categories.find((c) => c.code === e.target.value);
                    setLicenseFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                      categoryLabel: selCat ? selCat.title : prev.categoryLabel,
                    }));
                  }}
                >
                  {categories.map((c) => (
                    <MenuItem key={c.code} value={c.code}>
                      {c.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              size="small"
              label="ชื่อประเภทใบอนุญาต (Title) *"
              required
              value={licenseFormData.title}
              onChange={(e) => setLicenseFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="เช่น B-License (ชั้นต้น) หรือ คุณวุฒิวิชาชีพ TPQI"
            />

            <TextField
              size="small"
              label="คำอธิบาย"
              multiline
              rows={2}
              value={licenseFormData.description}
              onChange={(e) => setLicenseFormData((prev) => ({ ...prev, description: e.target.value }))}
            />

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
              <TextField
                size="small"
                label="อายุการใช้งาน (ปี)"
                type="number"
                slotProps={{ htmlInput: { min: 1, max: 20 } }}
                value={licenseFormData.defaultYears}
                onChange={(e) =>
                  setLicenseFormData((prev) => ({
                    ...prev,
                    defaultYears: parseInt(e.target.value) || 5,
                  }))
                }
              />
              <TextField
                size="small"
                label="หน่วยงานผู้ออก (Issuer)"
                value={licenseFormData.issuer}
                onChange={(e) => setLicenseFormData((prev) => ({ ...prev, issuer: e.target.value }))}
                placeholder="เช่น สำนักงานเลขาธิการคุรุสภา"
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>ไอคอน</InputLabel>
                <Select
                  value={licenseFormData.icon}
                  label="ไอคอน"
                  onChange={(e) => setLicenseFormData((prev) => ({ ...prev, icon: e.target.value }))}
                >
                  {ICON_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {opt.icon}
                        <span>{opt.label}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>โทนสี</InputLabel>
                <Select
                  value={licenseFormData.color}
                  label="โทนสี"
                  onChange={(e) => setLicenseFormData((prev) => ({ ...prev, color: e.target.value }))}
                >
                  {COLOR_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: opt.colorCode }} />
                        <span>{opt.label}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Checkbox Options */}
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={licenseFormData.requiresProvisionalRound}
                    onChange={(e) =>
                      setLicenseFormData((prev) => ({
                        ...prev,
                        requiresProvisionalRound: e.target.checked,
                      }))
                    }
                  />
                }
                label="เปิดระบบบันทึกรอบผ่อนผันคุรุสภา (ครั้งที่ 1, 2, 3)"
                sx={{ "& .MuiTypography-root": { fontSize: "0.8125rem", fontWeight: 600 } }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={licenseFormData.requiresTitle}
                    onChange={(e) =>
                      setLicenseFormData((prev) => ({
                        ...prev,
                        requiresTitle: e.target.checked,
                      }))
                    }
                  />
                }
                label="ให้ผู้ใช้ระบุสาขาวิชาชีพ / ระดับมาตรฐาน (Requires Title/Branch)"
                sx={{ "& .MuiTypography-root": { fontSize: "0.8125rem", fontWeight: 600 } }}
              />
            </Paper>

            {/* Preset Chips Input */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                ตัวเลือกแนะนำล่วงหน้า (Preset Chips สำหรับคลิกเลือกง่าย)
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="พิมพ์ตัวเลือกแล้วกด Enter หรือ เพิ่ม"
                  value={licenseModalChipInput}
                  onChange={(e) => setLicenseModalChipInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (licenseModalChipInput.trim()) {
                        setLicenseFormData((prev) => ({
                          ...prev,
                          presetChips: [...prev.presetChips, licenseModalChipInput.trim()],
                        }));
                        setLicenseModalChipInput("");
                      }
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (licenseModalChipInput.trim()) {
                      setLicenseFormData((prev) => ({
                        ...prev,
                        presetChips: [...prev.presetChips, licenseModalChipInput.trim()],
                      }));
                      setLicenseModalChipInput("");
                    }
                  }}
                >
                  เพิ่ม
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, pt: 0.5 }}>
                {licenseFormData.presetChips.map((chip, idx) => (
                  <Chip
                    key={idx}
                    size="small"
                    label={chip}
                    onDelete={() =>
                      setLicenseFormData((prev) => ({
                        ...prev,
                        presetChips: prev.presetChips.filter((_, i) => i !== idx),
                      }))
                    }
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 1.5 }}>
            <Button onClick={() => setShowLicenseModal(false)} color="inherit" size="small">
              ยกเลิก
            </Button>
            <Button type="submit" variant="contained" size="small" disabled={licenseFormSubmitting}>
              {licenseFormSubmitting ? "กำลังบันทึก..." : "บันทึกประเภทใบอนุญาต"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {confirmDialog.content}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))} color="inherit" size="small">
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              setConfirmDialog((prev) => ({ ...prev, open: false }));
              await confirmDialog.onConfirm();
            }}
          >
            ยืนยัน
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
