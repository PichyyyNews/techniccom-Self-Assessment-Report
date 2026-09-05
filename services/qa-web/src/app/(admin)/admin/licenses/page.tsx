"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BadgeIcon from "@mui/icons-material/Badge";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SecurityIcon from "@mui/icons-material/Security";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import DescriptionIcon from "@mui/icons-material/Description";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CheckIcon from "@mui/icons-material/Check";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import FolderIcon from "@mui/icons-material/Folder";
import TuneIcon from "@mui/icons-material/Tune";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningIcon from "@mui/icons-material/Warning";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";

const FileBadge = BadgeIcon;
const Plus = AddIcon;
const ArrowLeft = ArrowBackIcon;
const Filter = FilterListIcon;
const RefreshCw = RefreshIcon;
const Loader2 = ({ className }: { className?: string }) => (
  <CircularProgress size={16} sx={{ display: "inline-flex" }} />
);
const Edit2 = EditIcon;
const Trash2 = DeleteIcon;
const X = CloseIcon;
const Sparkles = AutoAwesomeIcon;
const Shield = SecurityIcon;
const Clock = AccessTimeIcon;
const Briefcase = WorkIcon;
const GraduationCap = SchoolIcon;
const Award = EmojiEventsIcon;
const FileText = DescriptionIcon;
const Tag = LocalOfferIcon;
const Check = CheckIcon;
const FolderPlus = CreateNewFolderIcon;
const Folder = FolderIcon;
const Settings2 = TuneIcon;
const CheckCircle2 = CheckCircleIcon;
const XCircle = CancelIcon;
const AlertTriangle = WarningIcon;
import { clsx } from "clsx";

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
  { value: "teal", label: "สีเขียวหัวเป็ด (Teal)", badge: "bg-teal-50 text-teal-700 border-teal-200" },
  { value: "blue", label: "สีน้ำเงิน (Blue)", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "purple", label: "สีม่วง (Purple)", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "emerald", label: "สีเขียว (Emerald)", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "amber", label: "สีส้ม/ทอง (Amber)", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "indigo", label: "สีคราม (Indigo)", badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { value: "rose", label: "สีแดง (Rose)", badge: "bg-rose-50 text-rose-700 border-rose-200" },
  { value: "slate", label: "สีเทา (Slate)", badge: "bg-slate-50 text-slate-700 border-slate-200" },
];

const ICON_OPTIONS = [
  { value: "GraduationCap", label: "หมวกบัณฑิต (GraduationCap)", icon: GraduationCap },
  { value: "Award", label: "เหรียญรางวัล (Award)", icon: Award },
  { value: "Shield", label: "โล่ป้องกัน (Shield)", icon: Shield },
  { value: "Clock", label: "นาฬิกาผ่อนผัน (Clock)", icon: Clock },
  { value: "FileBadge", label: "บัตรรับรอง (FileBadge)", icon: FileBadge },
  { value: "Briefcase", label: "กระเป๋าช่าง/งาน (Briefcase)", icon: Briefcase },
  { value: "Sparkles", label: "ประกายดาว/สากล (Sparkles)", icon: Sparkles },
  { value: "FileText", label: "เอกสารทั่วไป (FileText)", icon: FileText },
];

function getLicenseIcon(iconName: string) {
  switch (iconName) {
    case "GraduationCap":
      return GraduationCap;
    case "Award":
      return Award;
    case "Shield":
      return Shield;
    case "Clock":
      return Clock;
    case "FileBadge":
      return FileBadge;
    case "Briefcase":
      return Briefcase;
    case "Sparkles":
      return Sparkles;
    case "FileText":
    default:
      return FileText;
  }
}

export default function AdminLicensesPage() {
  const { data: session } = useSession();

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

  // Category Actions
  const openCreateCategoryModal = () => {
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
  };

  const openEditCategoryModal = (cat: LicenseCategoryItem) => {
    setCategoryModalMode("edit");
    setSelectedCategory(cat);
    setCategoryFormData({
      code: cat.code,
      title: cat.title,
      description: cat.description || "",
      icon: cat.icon || "GraduationCap",
      color: cat.color || "teal",
      sortOrder: cat.sortOrder || 0,
      isActive: cat.isActive,
    });
    setShowCategoryEditModal(true);
  };

  const handleCategoryFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.title || !categoryFormData.code) {
      setSnackbar({ open: true, message: "กรุณากรอกรหัสและชื่อหมวดหมู่", severity: "warning" });
      return;
    }

    try {
      setCategoryFormSubmitting(true);
      const url = "/api/admin/license-categories";
      const method = categoryModalMode === "create" ? "POST" : "PUT";
      const payload =
        categoryModalMode === "create"
          ? categoryFormData
          : { id: selectedCategory?.id, ...categoryFormData };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setSnackbar({ open: true, message: data.error || "เกิดข้อผิดพลาดในการบันทึกหมวดหมู่", severity: "error" });
        return;
      }

      setShowCategoryEditModal(false);
      setSnackbar({ open: true, message: "บันทึกหมวดหมู่สำเร็จ", severity: "success" });
      fetchCategories();
      fetchLicenseConfigs();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", severity: "error" });
    } finally {
      setCategoryFormSubmitting(false);
    }
  };

  const handleToggleCategoryActive = async (cat: LicenseCategoryItem) => {
    try {
      const res = await fetch("/api/admin/license-categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle-active", id: cat.id }),
      });
      if (res.ok) {
        fetchCategories();
        fetchLicenseConfigs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = (cat: LicenseCategoryItem) => {
    setConfirmDialog({
      open: true,
      title: "ยืนยันการลบหมวดหมู่",
      content: `ต้องการลบหมวดหมู่ "${cat.title}" หรือไม่`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/license-categories?id=${cat.id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) {
            setSnackbar({ open: true, message: data.error || "เกิดข้อผิดพลาดในการลบหมวดหมู่", severity: "error" });
            return;
          }
          setSnackbar({ open: true, message: "ลบหมวดหมู่เรียบร้อยแล้ว", severity: "success" });
          fetchCategories();
          fetchLicenseConfigs();
        } catch (err) {
          console.error(err);
          setSnackbar({ open: true, message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", severity: "error" });
        }
      },
    });
  };

  // License Config Actions
  const openCreateLicenseModal = () => {
    setLicenseModalMode("create");
    setSelectedLicense(null);
    setLicenseModalChipInput("");
    setLicenseFormData({
      code: "",
      title: "",
      description: "",
      category: categories[0]?.code || "vocational",
      categoryLabel: categories[0]?.title || "คุณวุฒิวิชาชีพ / มาตรฐานฝีมือ",
      defaultYears: 5,
      issuer: "",
      color: "emerald",
      icon: "FileBadge",
      requiresProvisionalRound: false,
      requiresTitle: true,
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
      color: item.color || "emerald",
      icon: item.icon || "FileBadge",
      requiresProvisionalRound: item.requiresProvisionalRound,
      requiresTitle: item.requiresTitle,
      titleLabel: item.titleLabel || "ระบุสาขาวิชาชีพ / ระดับมาตรฐาน",
      titlePlaceholder: item.titlePlaceholder || "เช่น สาขาเทคโนโลยีสารสนเทศ",
      presetChips: item.presetChips || [],
      sortOrder: item.sortOrder || 0,
      isActive: item.isActive,
    });
    setShowLicenseModal(true);
  };

  const handleLicenseFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseFormData.title || !licenseFormData.code) {
      setSnackbar({ open: true, message: "กรุณากรอกรหัสและชื่อประเภทใบอนุญาต", severity: "warning" });
      return;
    }

    try {
      setLicenseFormSubmitting(true);
      const url = "/api/admin/license-configs";
      const method = licenseModalMode === "create" ? "POST" : "PUT";
      const payload =
        licenseModalMode === "create"
          ? licenseFormData
          : { id: selectedLicense?.id, ...licenseFormData };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setSnackbar({ open: true, message: data.error || "เกิดข้อผิดพลาดในการบันทึกประเภทใบอนุญาต", severity: "error" });
        return;
      }

      setShowLicenseModal(false);
      setSnackbar({ open: true, message: "บันทึกประเภทใบอนุญาตสำเร็จ", severity: "success" });
      fetchLicenseConfigs();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", severity: "error" });
    } finally {
      setLicenseFormSubmitting(false);
    }
  };

  const handleToggleLicenseActive = async (item: LicenseConfigItem) => {
    try {
      const res = await fetch("/api/admin/license-configs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle-active", id: item.id }),
      });
      if (res.ok) {
        fetchLicenseConfigs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLicense = (item: LicenseConfigItem) => {
    setConfirmDialog({
      open: true,
      title: "ยืนยันการลบประเภทใบอนุญาต",
      content: `ต้องการลบประเภทใบอนุญาต "${item.title}" หรือไม่`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/license-configs?id=${item.id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) {
            setSnackbar({ open: true, message: data.error || "เกิดข้อผิดพลาดในการลบประเภทใบอนุญาต", severity: "error" });
            return;
          }
          setSnackbar({ open: true, message: "ลบประเภทใบอนุญาตเรียบร้อยแล้ว", severity: "success" });
          fetchLicenseConfigs();
        } catch (err) {
          console.error(err);
          setSnackbar({ open: true, message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", severity: "error" });
        }
      },
    });
  };

  const handleResetLicenseDefaults = () => {
    setConfirmDialog({
      open: true,
      title: "ยืนยันการคืนค่าเริ่มต้น",
      content: "ต้องการคืนค่าเริ่มต้นมาตรฐานของประเภทใบอนุญาตทั้งหมดหรือไม่ ประเภทที่มีอยู่แล้วจะได้รับการอัปเดตและรายการที่ขาดจะถูกสร้างใหม่",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/license-configs", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "reset-defaults" }),
          });
          const data = await res.json();
          if (res.ok) {
            setSnackbar({ open: true, message: "คืนค่าเริ่มต้นประเภทใบอนุญาตมาตรฐานเรียบร้อยแล้ว", severity: "success" });
            fetchLicenseConfigs();
            fetchCategories();
          } else {
            setSnackbar({ open: true, message: data.error || "เกิดข้อผิดพลาดในการคืนค่าเริ่มต้น", severity: "error" });
          }
        } catch (err) {
          console.error(err);
          setSnackbar({ open: true, message: "เกิดข้อผิดพลาดในการเชื่อมต่อ", severity: "error" });
        }
      },
    });
  };

  // Inline Preset Chip Management
  const handleAddInlineChip = async (configId: string) => {
    const chipText = inlineNewChip[configId]?.trim();
    if (!chipText) return;

    try {
      const res = await fetch("/api/admin/license-configs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add-chip",
          id: configId,
          chip: chipText,
        }),
      });

      if (res.ok) {
        setInlineNewChip((prev) => ({ ...prev, [configId]: "" }));
        fetchLicenseConfigs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveInlineChip = async (configId: string, chipText: string) => {
    try {
      const res = await fetch("/api/admin/license-configs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove-chip",
          id: configId,
          chip: chipText,
        }),
      });

      if (res.ok) {
        fetchLicenseConfigs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLicenses = licenseConfigs.filter((c) => {
    if (licenseCategoryFilter === "ALL") return true;
    return c.category === licenseCategoryFilter;
  });

  const getBadgeStyle = (color?: string | null) => {
    const opt = COLOR_OPTIONS.find((c) => c.value === color);
    return opt ? opt.badge : "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
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
            ตั้งค่าประเภทใบอนุญาตและมาตรฐานวิชาชีพ
          </Typography>
          <Chip
            size="small"
            label={`${categories.length} หมวดหมู่`}
            color="primary"
            variant="outlined"
            sx={{ height: 20, fontSize: "0.6875rem", display: { xs: "none", sm: "inline-flex" } }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<FolderIcon sx={{ fontSize: 16 }} />}
            onClick={() => setShowCategoryManagerModal(true)}
            sx={{ px: 1.25, py: 0.35, fontSize: "0.75rem", fontWeight: 600 }}
          >
            จัดการหมวดหมู่
          </Button>

          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            onClick={openCreateLicenseModal}
            sx={{ px: 1.25, py: 0.35, fontSize: "0.75rem", fontWeight: 600 }}
          >
            เพิ่มใบอนุญาตใหม่
          </Button>
        </Box>
      </Box>

      {/* ================= SUMMARY STAT CARDS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block">ประเภททั้งหมด</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
            {licenseConfigs.length}
          </span>
        </div>
        <div className="rounded-3xl border border-teal-200/80 bg-teal-50/40 p-4 sm:p-5 shadow-sm">
          <span className="text-xs font-bold text-teal-700 block">คุรุสภา / ผ่อนผัน</span>
          <span className="text-2xl font-black text-teal-900 mt-1 block font-mono">
            {licenseConfigs.filter((c) => c.category === "ksp").length}
          </span>
        </div>
        <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/40 p-4 sm:p-5 shadow-sm">
          <span className="text-xs font-bold text-emerald-700 block">คุณวุฒิสายอาชีพ (TPQI/DSD/กว.)</span>
          <span className="text-2xl font-black text-emerald-900 mt-1 block font-mono">
            {licenseConfigs.filter((c) => c.category === "vocational").length}
          </span>
        </div>
        <div className="rounded-3xl border border-blue-200/80 bg-blue-50/40 p-4 sm:p-5 shadow-sm">
          <span className="text-xs font-bold text-blue-700 block">ตัวเลือกแนะนำ (Presets)</span>
          <span className="text-2xl font-black text-blue-900 mt-1 block font-mono">
            {licenseConfigs.reduce((acc, c) => acc + (c.presetChips?.length || 0), 0)}
          </span>
        </div>
      </div>

      {/* ================= CATEGORY FILTER & RESET DEFAULTS BAR ================= */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1 flex-shrink-0">
            <Filter className="h-3.5 w-3.5" /> หมวดหมู่:
          </span>
          {[
            { key: "ALL", label: "ทั้งหมด" },
            ...categories.map((c) => ({ key: c.code, label: c.title })),
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setLicenseCategoryFilter(item.key)}
              className={clsx(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex-shrink-0",
                licenseCategoryFilter === item.key
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleResetLicenseDefaults}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
          คืนค่าเริ่มต้นมาตรฐาน (Reset Defaults)
        </button>
      </div>

      {/* ================= LICENSE CONFIGURATION CARDS GRID ================= */}
      {loadingConfigs ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-14 flex flex-col items-center justify-center text-slate-400 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
          <span className="text-sm font-medium">กำลังโหลดข้อมูลการตั้งค่าใบอนุญาต...</span>
        </div>
      ) : filteredLicenses.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-14 flex flex-col items-center justify-center text-center text-slate-500 shadow-sm">
          <FileBadge className="h-10 w-10 text-slate-300 mb-2" />
          <p className="font-bold text-slate-700">ไม่พบรายการประเภทใบอนุญาต</p>
          <p className="text-xs text-slate-400 mt-1">คลิกปุ่ม "เพิ่มประเภทใบอนุญาตใหม่" เพื่อสร้างรายการแรก</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {filteredLicenses.map((config) => {
            const IconComponent = getLicenseIcon(config.icon);

            return (
              <div
                key={config.id}
                className={clsx(
                  "rounded-3xl border bg-white p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between transition",
                  config.isActive ? "border-slate-200/80" : "border-slate-200/50 opacity-60 bg-slate-50/50"
                )}
              >
                <div className="space-y-3.5">
                  {/* Card Header: Icon + Title + Code + Active Switch */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={clsx(
                          "flex h-11 w-11 items-center justify-center rounded-2xl border flex-shrink-0",
                          getBadgeStyle(config.color)
                        )}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-slate-900 text-sm sm:text-base leading-snug">
                            {config.title}
                          </h3>
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                            {config.code}
                          </span>
                        </div>
                        {config.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {config.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Active/Inactive Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleLicenseActive(config)}
                      className={clsx(
                        "px-2.5 py-1 rounded-full text-[11px] font-bold border transition flex-shrink-0",
                        config.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      )}
                    >
                      {config.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </button>
                  </div>

                  {/* Attributes Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      <Folder className="h-3 w-3 text-slate-400" />
                      {config.categoryLabel || config.category}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-semibold text-[11px]">
                      <Clock className="h-3 w-3 text-blue-500" />
                      อายุเริ่มต้น {config.defaultYears} ปี
                    </span>

                    {config.requiresProvisionalRound && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 font-semibold text-[11px] border border-amber-200">
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                        ผ่อนผัน 1-3 รอบ
                      </span>
                    )}

                    {config.issuer && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 text-[11px]">
                        {config.issuer}
                      </span>
                    )}
                  </div>

                  {/* Dynamic Preset Chips Manager */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <Tag className="h-3 w-3 text-teal-600" />
                        ตัวเลือกแนะนำเมื่อกรอกข้อมูล (Presets) ({config.presetChips?.length || 0})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {(config.presetChips || []).map((chip, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-200 group"
                        >
                          <span>{chip}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveInlineChip(config.id, chip)}
                            className="text-teal-400 hover:text-rose-600 transition"
                            title="ลบตัวเลือกนี้"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}

                      {/* Add Inline Chip Input */}
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          placeholder="+ เพิ่มตัวเลือก"
                          value={inlineNewChip[config.id] || ""}
                          onChange={(e) =>
                            setInlineNewChip((prev) => ({
                              ...prev,
                              [config.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddInlineChip(config.id);
                            }
                          }}
                          className="w-28 px-2 py-0.5 rounded-lg border border-dashed border-slate-300 text-[11px] bg-slate-50 focus:bg-white focus:outline-none focus:border-teal-500"
                        />
                        {inlineNewChip[config.id] && (
                          <button
                            type="button"
                            onClick={() => handleAddInlineChip(config.id)}
                            className="p-1 rounded-md bg-teal-600 text-white hover:bg-teal-700"
                          >
                            <Check className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Usage Count & Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 font-medium">
                    ใช้งานอยู่ในระบบ: <strong className="text-slate-700">{config.usageCount || 0}</strong> รายการ
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditLicenseModal(config)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95 shadow-2xs"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-teal-600" />
                      แก้ไข
                    </button>

                    {!config.isSystem && (
                      <button
                        type="button"
                        onClick={() => handleDeleteLicense(config)}
                        className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition active:scale-95 shadow-2xs"
                        title="ลบประเภทใบอนุญาตนี้"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL 1: LICENSE CATEGORY MANAGER MODAL ================= */}
      {showCategoryManagerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 border border-teal-200">
                  <Folder className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">จัดการหมวดหมู่ใบอนุญาต (License Categories)</h3>
                  <p className="text-xs text-slate-400">เพิ่ม แก้ไข หรือจัดเรียงหมวดหมู่ประเภทใบอนุญาตในระบบ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryManagerModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={openCreateCategoryModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-md shadow-teal-500/20 hover:bg-teal-700"
              >
                <Plus className="h-4 w-4" />
                เพิ่มหมวดหมู่ใหม่
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const IconComponent = getLicenseIcon(cat.icon);
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={clsx(
                          "flex h-9 w-9 items-center justify-center rounded-xl border flex-shrink-0",
                          getBadgeStyle(cat.color)
                        )}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{cat.title}</span>
                          <span className="font-mono text-[10px] bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-600 font-semibold">
                            {cat.code}
                          </span>
                        </div>
                        {cat.description && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{cat.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleCategoryActive(cat)}
                        className={clsx(
                          "px-2 py-0.5 rounded-md text-[10px] font-bold border",
                          cat.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        )}
                      >
                        {cat.isActive ? "เปิด" : "ปิด"}
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditCategoryModal(cat)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600"
                        title="แก้ไข"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      {!cat.isSystem && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600"
                          title="ลบ"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCategoryManagerModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CREATE / EDIT CATEGORY MODAL ================= */}
      {showCategoryEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {categoryModalMode === "create" ? "เพิ่มหมวดหมู่ใหม่" : "แก้ไขหมวดหมู่"}
              </h3>
              <button
                type="button"
                onClick={() => setShowCategoryEditModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCategoryFormSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">รหัสหมวดหมู่ (Code) *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น vocational, international"
                  value={categoryFormData.code}
                  onChange={(e) =>
                    setCategoryFormData((prev) => ({
                      ...prev,
                      code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">ชื่อหมวดหมู่ (Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น คุณวุฒิสายอาชีพ (TPQI/DSD/กว.)"
                  value={categoryFormData.title}
                  onChange={(e) =>
                    setCategoryFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">คำอธิบาย</label>
                <textarea
                  rows={2}
                  placeholder="คำอธิบายหมวดหมู่นี้..."
                  value={categoryFormData.description}
                  onChange={(e) =>
                    setCategoryFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ไอคอน</label>
                  <select
                    value={categoryFormData.icon}
                    onChange={(e) =>
                      setCategoryFormData((prev) => ({ ...prev, icon: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">โทนสี</label>
                  <select
                    value={categoryFormData.color}
                    onChange={(e) =>
                      setCategoryFormData((prev) => ({ ...prev, color: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
                  >
                    {COLOR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={categoryFormSubmitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-500/20 disabled:opacity-50"
                >
                  {categoryFormSubmitting ? "กำลังบันทึก..." : "บันทึกหมวดหมู่"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: CREATE / EDIT LICENSE CONFIG MODAL ================= */}
      {showLicenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 border border-teal-200">
                  <FileBadge className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {licenseModalMode === "create" ? "เพิ่มประเภทใบอนุญาตใหม่" : "แก้ไขประเภทใบอนุญาต"}
                  </h3>
                  <p className="text-xs text-slate-400">กำหนดชื่อ รหัส อายุใช้งาน และตัวเลือกแนะนำ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLicenseModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleLicenseFormSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">รหัสประเภท (Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น KSP_B_LICENSE, TPQI_IT"
                    value={licenseFormData.code}
                    onChange={(e) =>
                      setLicenseFormData((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">หมวดหมู่ *</label>
                  <select
                    value={licenseFormData.category}
                    onChange={(e) => {
                      const selCat = categories.find((c) => c.code === e.target.value);
                      setLicenseFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                        categoryLabel: selCat ? selCat.title : prev.categoryLabel,
                      }));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">ชื่อประเภทใบอนุญาต (Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น B-License (ชั้นต้น) หรือ คุณวุฒิวิชาชีพ TPQI"
                  value={licenseFormData.title}
                  onChange={(e) =>
                    setLicenseFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">คำอธิบาย</label>
                <textarea
                  rows={2}
                  placeholder="คำอธิบายรายละเอียดใบอนุญาตนี้..."
                  value={licenseFormData.description}
                  onChange={(e) =>
                    setLicenseFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">อายุการใช้งานเริ่มต้น (ปี)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={licenseFormData.defaultYears}
                    onChange={(e) =>
                      setLicenseFormData((prev) => ({
                        ...prev,
                        defaultYears: parseInt(e.target.value) || 5,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">หน่วยงานผู้ออก (Issuer)</label>
                  <input
                    type="text"
                    placeholder="เช่น สำนักงานเลขาธิการคุรุสภา, สถาบันคุณวุฒิวิชาชีพ"
                    value={licenseFormData.issuer}
                    onChange={(e) =>
                      setLicenseFormData((prev) => ({ ...prev, issuer: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ไอคอน</label>
                  <select
                    value={licenseFormData.icon}
                    onChange={(e) =>
                      setLicenseFormData((prev) => ({ ...prev, icon: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">โทนสี Badge</label>
                  <select
                    value={licenseFormData.color}
                    onChange={(e) =>
                      setLicenseFormData((prev) => ({ ...prev, color: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
                  >
                    {COLOR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checkbox Options */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={licenseFormData.requiresProvisionalRound}
                    onChange={(e) =>
                      setLicenseFormData((prev) => ({
                        ...prev,
                        requiresProvisionalRound: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="font-bold text-slate-800">
                    เปิดระบบบันทึกรอบผ่อนผันคุรุสภา (ครั้งที่ 1, 2, 3)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={licenseFormData.requiresTitle}
                    onChange={(e) =>
                      setLicenseFormData((prev) => ({
                        ...prev,
                        requiresTitle: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="font-bold text-slate-800">
                    ให้ผู้ใช้ระบุสาขาวิชาชีพ / ระดับมาตรฐาน (Requires Title/Branch)
                  </span>
                </label>
              </div>

              {/* Preset Chips Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  ตัวเลือกแนะนำล่วงหน้า (Preset Chips สำหรับคลิกเลือกง่าย)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="พิมพ์ตัวเลือกแล้วกดเพิ่ม เช่น ช่างซ่อมไมโครคอมพิวเตอร์ ระดับ 2"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (licenseModalChipInput.trim()) {
                        setLicenseFormData((prev) => ({
                          ...prev,
                          presetChips: [...prev.presetChips, licenseModalChipInput.trim()],
                        }));
                        setLicenseModalChipInput("");
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex-shrink-0"
                  >
                    เพิ่ม
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {licenseFormData.presetChips.map((chip, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200"
                    >
                      {chip}
                      <button
                        type="button"
                        onClick={() =>
                          setLicenseFormData((prev) => ({
                            ...prev,
                            presetChips: prev.presetChips.filter((_, i) => i !== idx),
                          }))
                        }
                        className="text-teal-400 hover:text-rose-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLicenseModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={licenseFormSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-500/20 disabled:opacity-50"
                >
                  {licenseFormSubmitting ? "กำลังบันทึก..." : "บันทึกประเภทใบอนุญาต"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{confirmDialog.content}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))} color="inherit">
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            color="error"
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
    </div>
  );
}
