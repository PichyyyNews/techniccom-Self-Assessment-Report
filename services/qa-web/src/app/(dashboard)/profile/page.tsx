"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
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
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

// MUI Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import MailIcon from "@mui/icons-material/Mail";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SecurityIcon from "@mui/icons-material/Security";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ShareIcon from "@mui/icons-material/Share";
import CheckIcon from "@mui/icons-material/Check";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockIcon from "@mui/icons-material/Lock";
import BadgeIcon from "@mui/icons-material/Badge";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DescriptionIcon from "@mui/icons-material/Description";
import WarningIcon from "@mui/icons-material/Warning";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArticleIcon from "@mui/icons-material/Article";

import { ImageUpload } from "@/components/ui/ImageUpload";
import { DocumentUpload } from "@/components/ui/DocumentUpload";
import { ContributionGraph } from "@/components/profile/ContributionGraph";
import { LiveEvidenceSection } from "@/components/evidence/LiveEvidenceSection";
import { PageBreadcrumbs } from "@/components/ui/PageBreadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";

export type LicenseTypeEnum =
  | "KSP_A_LICENSE"
  | "KSP_B_LICENSE"
  | "KSP_P_LICENSE"
  | "KSP_PROVISIONAL"
  | "TPQI_CERTIFICATE"
  | "DSD_STANDARD"
  | "COE_ENGINEER"
  | "OTHER_PROFESSIONAL"
  | string;

export type LicenseStatusEnum = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "IN_RENEWAL";

export interface TeacherLicenseData {
  id?: string;
  userId?: string;
  licenseType: LicenseTypeEnum;
  licenseNumber: string;
  title?: string | null;
  provisionalRound?: number | null;
  nameTh?: string | null;
  nameEn?: string | null;
  issuedDate: string;
  expiredDate: string;
  status: LicenseStatusEnum;
  attachmentKey?: string | null;
  attachmentName?: string | null;
}

export interface LicenseItem {
  name: string;
  licenseNumber: string;
  issuer: string;
  issueDate?: string;
  expireDate?: string;
  isLifetime?: boolean;
  fileUrl?: string;
}

interface EducationItem {
  degree: string;
  major: string;
  institution: string;
  year?: string;
}

interface WorkHistoryItem {
  role: string;
  organization: string;
  period: string;
}

interface RecentActivity {
  id: string;
  action: string;
  title: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();

  const userId = (params?.id as string) || undefined;

  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [isSelf, setIsSelf] = useState(false);
  const [copied, setCopied] = useState(false);

  // Contributions & Timeline
  const [contributionMap, setContributionMap] = useState<Record<string, number>>({});
  const [totalContributions, setTotalContributions] = useState(0);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Modal active
  const [activeModal, setActiveModal] = useState<
    | "none"
    | "basic"
    | "education"
    | "workHistory"
    | "skills"
    | "licenses"
    | "teacherLicense"
    | "password"
  >("none");

  // Modular Form States
  const [basicForm, setBasicForm] = useState({
    name: "",
    position: "",
    phone: "",
    birthDate: "",
    avatarUrl: "",
    bio: "",
  });

  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [workHistoryList, setWorkHistoryList] = useState<WorkHistoryItem[]>([]);
  const [licensesList, setLicensesList] = useState<LicenseItem[]>([]);
  const [editingLicenseId, setEditingLicenseId] = useState<string | null>(null);
  const [licenseConfigs, setLicenseConfigs] = useState<any[]>([]);
  const [teacherLicenseCategory, setTeacherLicenseCategory] = useState<string>("ksp");
  const [teacherLicenseForm, setTeacherLicenseForm] = useState<TeacherLicenseData>({
    licenseType: "KSP_B_LICENSE",
    licenseNumber: "",
    title: "",
    provisionalRound: 1,
    nameTh: "",
    nameEn: "",
    issuedDate: "",
    expiredDate: "",
    status: "ACTIVE",
    attachmentKey: "",
    attachmentName: "",
  });
  const [isRenewalPending, setIsRenewalPending] = useState(false);
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });

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

  const fetchLicenseConfigs = async () => {
    try {
      const res = await fetch("/api/license-configs");
      if (res.ok) {
        const data = await res.json();
        setLicenseConfigs(data.configs || []);
      }
    } catch (err) {
      console.error("Failed to fetch license configs:", err);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = userId ? `/api/profile/${userId}` : "/api/profile";
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
        return;
      }

      setUser(data.user);
      setContributionMap(data.contributionMap || {});
      setTotalContributions(data.totalContributions || 0);
      setRecentActivities(data.recentActivities || []);
      setCanEdit(Boolean(data.canEdit ?? true));
      setIsSelf(Boolean(data.isSelf ?? (!userId || session?.user?.id === userId)));
    } catch (err) {
      console.error("Failed to fetch profile", err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchLicenseConfigs();
  }, [userId]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const shareUrl = user ? `${window.location.origin}/profile/${user.id}` : window.location.href;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const calculateAge = (birthDateString?: string | null) => {
    if (!birthDateString) return null;
    const birthDate = new Date(birthDateString);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  const isRoot = user?.roleCode === "ROOT" || session?.user?.role === "ROOT";
  const roleTitle = user?.roleDefinition?.title || session?.user?.roleTitle || (isRoot ? "ผู้ดูแลระบบสูงสุด (ROOT)" : "บุคลากรทั่วไป (STAFF)");
  const age = calculateAge(user?.birthDate);

  // Open Handlers for Modals
  const openBasicModal = () => {
    if (!user) return;
    setBasicForm({
      name: user.name || "",
      position: user.position || "",
      phone: user.phone || "",
      birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split("T")[0] : "",
      avatarUrl: user.avatarUrl || "",
      bio: user.bio || "",
    });
    setActiveModal("basic");
  };

  const openEducationModal = () => {
    if (!user) return;
    setEducationList((user.education as EducationItem[]) || [
      { degree: "ปริญญาตรี", major: "ครุศาสตร์อุตสาหกรรม", institution: "มหาวิทยาลัยเทคโนโลยี", year: "2562" },
    ]);
    setActiveModal("education");
  };

  const openWorkHistoryModal = () => {
    if (!user) return;
    setWorkHistoryList((user.workHistory as WorkHistoryItem[]) || [
      { role: user.position || "บุคลากรประจำสถานศึกษา", organization: "วิทยาลัยเทคนิค", period: "2564 - ปัจจุบัน" },
    ]);
    setActiveModal("workHistory");
  };

  const openSkillsModal = () => {
    if (!user) return;
    setSkillsList(user.skills && user.skills.length > 0 ? user.skills : [
      "การประกันคุณภาพการศึกษา (SAR)",
      "เทคโนโลยีสารสนเทศ",
    ]);
    setSkillInput("");
    setActiveModal("skills");
  };

  const openTeacherLicenseModal = (existing?: TeacherLicenseData, defaultType?: LicenseTypeEnum) => {
    if (existing) {
      setEditingLicenseId(existing.id || null);
      const isKspType = ["KSP_A_LICENSE", "KSP_B_LICENSE", "KSP_P_LICENSE", "KSP_PROVISIONAL"].includes(existing.licenseType);
      setTeacherLicenseCategory(isKspType ? "ksp" : "vocational");
      setTeacherLicenseForm({
        id: existing.id,
        licenseType: existing.licenseType || "KSP_B_LICENSE",
        licenseNumber: existing.licenseNumber || "",
        title: existing.title || "",
        provisionalRound: existing.provisionalRound || 1,
        nameTh: existing.nameTh || user?.name || "",
        nameEn: existing.nameEn || "",
        issuedDate: existing.issuedDate ? existing.issuedDate.split("T")[0] : "",
        expiredDate: existing.expiredDate ? existing.expiredDate.split("T")[0] : "",
        status: existing.status || "ACTIVE",
        attachmentKey: existing.attachmentKey || "",
        attachmentName: existing.attachmentName || "",
      });
      setIsRenewalPending(existing.status === "IN_RENEWAL");
    } else {
      setEditingLicenseId(null);
      const type = defaultType || "KSP_B_LICENSE";
      const isKsp = ["KSP_A_LICENSE", "KSP_B_LICENSE", "KSP_P_LICENSE", "KSP_PROVISIONAL"].includes(type);
      setTeacherLicenseCategory(isKsp ? "ksp" : "vocational");

      const today = new Date();
      const next5Years = new Date(today);
      next5Years.setFullYear(today.getFullYear() + 5);

      setTeacherLicenseForm({
        licenseType: type,
        licenseNumber: "",
        title: "",
        provisionalRound: 1,
        nameTh: user?.name || "",
        nameEn: "",
        issuedDate: today.toISOString().split("T")[0],
        expiredDate: next5Years.toISOString().split("T")[0],
        status: "ACTIVE",
        attachmentKey: "",
        attachmentName: "",
      });
      setIsRenewalPending(false);
    }
    setActiveModal("teacherLicense");
  };

  // Submit Handlers
  const handleSaveBasic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = userId ? `/api/profile/${userId}` : "/api/profile";
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basicForm),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "อัปเดตข้อมูลส่วนตัวสำเร็จ", severity: "success" });
        setActiveModal("none");
        await fetchProfile();
      } else {
        const data = await res.json();
        throw new Error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  const handleSaveEducation = async () => {
    try {
      const url = userId ? `/api/profile/${userId}` : "/api/profile";
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ education: educationList }),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "บันทึกประวัติการศึกษาสำเร็จ", severity: "success" });
        setActiveModal("none");
        await fetchProfile();
      }
    } catch {
      setSnackbar({ open: true, message: "เกิดข้อผิดพลาดในการบันทึก", severity: "error" });
    }
  };

  const handleSaveWorkHistory = async () => {
    try {
      const url = userId ? `/api/profile/${userId}` : "/api/profile";
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workHistory: workHistoryList }),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "บันทึกประวัติการทำงานสำเร็จ", severity: "success" });
        setActiveModal("none");
        await fetchProfile();
      }
    } catch {
      setSnackbar({ open: true, message: "เกิดข้อผิดพลาดในการบันทึก", severity: "error" });
    }
  };

  const handleSaveSkills = async () => {
    try {
      const url = userId ? `/api/profile/${userId}` : "/api/profile";
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: skillsList }),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "บันทึกทักษะความเชี่ยวชาญสำเร็จ", severity: "success" });
        setActiveModal("none");
        await fetchProfile();
      }
    } catch {
      setSnackbar({ open: true, message: "เกิดข้อผิดพลาดในการบันทึก", severity: "error" });
    }
  };

  const handleSaveTeacherLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...teacherLicenseForm,
        status: isRenewalPending ? "IN_RENEWAL" : teacherLicenseForm.status,
      };

      const url = editingLicenseId
        ? `/api/profile/teacher-licenses/${editingLicenseId}`
        : "/api/profile/teacher-licenses";
      const method = editingLicenseId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSnackbar({
          open: true,
          message: editingLicenseId ? "แก้ไขใบอนุญาตสำเร็จ" : "เพิ่มใบอนุญาตสำเร็จ",
          severity: "success",
        });
        setActiveModal("none");
        await fetchProfile();
      } else {
        const data = await res.json();
        throw new Error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  const handleDeleteTeacherLicense = (license: TeacherLicenseData) => {
    setConfirmDialog({
      open: true,
      title: "ยืนยันการลบใบอนุญาต?",
      content: `ต้องการลบรายการ ${license.licenseNumber} ออกจากระบบใช่หรือไม่`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/profile/teacher-licenses/${license.id}`, { method: "DELETE" });
          if (res.ok) {
            setSnackbar({ open: true, message: "ลบใบอนุญาตสำเร็จ", severity: "success" });
            await fetchProfile();
          }
        } catch {
          setSnackbar({ open: true, message: "เกิดข้อผิดพลาดในการลบ", severity: "error" });
        }
      },
    });
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setSnackbar({ open: true, message: "รหัสผ่านทั้งสองช่องไม่ตรงกัน", severity: "error" });
      return;
    }
    try {
      const url = userId ? `/api/profile/${userId}/password` : "/api/profile/password";
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordForm.password }),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "เปลี่ยนรหัสผ่านสำเร็จ", severity: "success" });
        setPasswordForm({ password: "", confirmPassword: "" });
        setActiveModal("none");
      } else {
        const data = await res.json();
        throw new Error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: { xs: 1.5, sm: 2.5 } }}>
        <Skeleton variant="text" width={240} height={32} />
        <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 700, mx: "auto", textAlign: "center" }}>
        <EmptyState
          icon={<LockIcon sx={{ fontSize: 44, color: "error.main" }} />}
          title="ไม่สามารถเข้าถึงโปรไฟล์ได้"
          description={error || "ไม่พบข้อมูลโปรไฟล์ของบุคลากรท่านนี้"}
          actionLabel="กลับหน้าหลัก"
          onAction={() => router.push("/dashboard")}
          actionIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
        />
      </Box>
    );
  }

  const currentEducation: EducationItem[] = (user?.education as EducationItem[]) || [];
  const currentWorkHistory: WorkHistoryItem[] = (user?.workHistory as WorkHistoryItem[]) || [];
  const currentSkills: string[] = user?.skills || [];
  const teacherLicenses: TeacherLicenseData[] = user?.teacherLicenses || [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: { xs: 1.5, sm: 2.5 } }}>
      {/* Breadcrumbs */}
      <PageBreadcrumbs
        items={[
          ...(!isSelf ? [{ label: "รายชื่อผู้ใช้งาน", href: "/admin/users" }] : []),
          { label: !isSelf ? `โปรไฟล์: ${user.name}` : "โปรไฟล์และประวัติการทำงาน" },
        ]}
      />

      {/* 1. Compact Page Header */}
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
          <Tooltip title={!isSelf ? "กลับหน้ารายชื่อผู้ใช้งาน" : "กลับหน้าหลัก"}>
            <IconButton
              component={Link}
              href={!isSelf ? "/admin/users" : "/dashboard"}
              size="small"
              sx={{ color: "text.secondary", p: 0.4 }}
              aria-label="ย้อนกลับ"
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Typography variant="h2" sx={{ fontWeight: 700, fontSize: { xs: "0.95rem", sm: "1.125rem" }, color: "text.primary" }}>
            {!isSelf ? `โปรไฟล์บุคลากร: ${user.name}` : "โปรไฟล์และประวัติการทำงาน"}
          </Typography>
          <Chip
            size="small"
            label={user?.position || "บุคลากร"}
            color="primary"
            variant="outlined"
            sx={{ height: 20, fontSize: "0.6875rem", display: { xs: "none", sm: "inline-flex" } }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={copied ? <CheckIcon sx={{ fontSize: 15 }} /> : <ShareIcon sx={{ fontSize: 15 }} />}
            onClick={handleCopyLink}
            sx={{ px: 1.25, py: 0.35, fontSize: "0.75rem", fontWeight: 600 }}
          >
            {copied ? "คัดลอกลิงก์แล้ว" : "แชร์โปรไฟล์"}
          </Button>
          {canEdit && (
            <Button
              size="small"
              variant="contained"
              startIcon={<EditIcon sx={{ fontSize: 15 }} />}
              onClick={openBasicModal}
              sx={{ px: 1.25, py: 0.35, fontSize: "0.75rem", fontWeight: 600 }}
            >
              แก้ไขโปรไฟล์
            </Button>
          )}
        </Box>
      </Box>

      {/* 2. Profile Identity Banner */}
      <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: "hidden" }}>
        {/* Cover Gradient */}
        <Box sx={{ height: { xs: 64, sm: 80 }, background: "linear-gradient(90deg, #1d4ed8 0%, #4338ca 50%, #0284c7 100%)" }} />

        <Box sx={{ px: { xs: 2, sm: 3 }, pb: 2.5, pt: 0 }}>
          {/* Avatar and Top Controls */}
          <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mt: { xs: -4, sm: -5 }, mb: 1.5 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                canEdit ? (
                  <IconButton
                    size="small"
                    onClick={openBasicModal}
                    sx={{
                      width: 26,
                      height: 26,
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" },
                      boxShadow: 2,
                    }}
                  >
                    <PhotoCameraIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                ) : null
              }
            >
              <Avatar
                src={user?.avatarUrl || undefined}
                alt={user?.name}
                sx={{
                  width: { xs: 72, sm: 88 },
                  height: { xs: 72, sm: 88 },
                  border: "3px solid white",
                  boxShadow: 2,
                  bgcolor: "primary.main",
                  fontSize: "1.75rem",
                  fontWeight: 700,
                }}
              >
                {user?.name ? user.name.charAt(0) : "U"}
              </Avatar>
            </Badge>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              {canEdit && (
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<VpnKeyIcon sx={{ fontSize: 14 }} />}
                  onClick={() => setActiveModal("password")}
                  sx={{ fontSize: "0.725rem", py: 0.3 }}
                >
                  เปลี่ยนรหัสผ่าน
                </Button>
              )}
            </Box>
          </Box>

          {/* Name & Details */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                {user?.name}
              </Typography>
              <Chip
                size="small"
                label={roleTitle}
                color={isRoot ? "error" : "primary"}
                sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700 }}
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", color: "text.secondary", fontSize: "0.8125rem", mt: 0.25 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <WorkIcon sx={{ fontSize: 15, color: "primary.main" }} />
                <span>{user?.position || "บุคลากรประจำสถานศึกษา"}</span>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <MailIcon sx={{ fontSize: 15 }} />
                <span>{user?.email}</span>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PhoneIcon sx={{ fontSize: 15 }} />
                <span>{user?.phone || "ไม่ได้ระบุเบอร์โทร"}</span>
              </Box>
              {age !== null && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <CalendarTodayIcon sx={{ fontSize: 15 }} />
                  <span>อายุ {age} ปี</span>
                </Box>
              )}
            </Box>

            {/* Bio */}
            {user?.bio && (
              <Box sx={{ mt: 1.25, p: 1.5, bgcolor: "action.hover", borderRadius: 2, display: "flex", alignItems: "flex-start", gap: 1 }}>
                <FormatQuoteIcon sx={{ fontSize: 18, color: "primary.main", transform: "rotate(180deg)", mt: 0.2 }} />
                <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "text.primary", lineHeight: 1.6 }}>
                  {user.bio}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      {/* 3. Contribution Graph Activity */}
      <ContributionGraph
        contributionMap={contributionMap}
        totalContributions={totalContributions}
        recentActivities={recentActivities}
      />

      {/* 4. Teacher Licenses (ใบอนุญาตประกอบวิชาชีพและคุณวุฒิวิชาชีพ) */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: "rgba(15, 118, 110, 0.1)", color: "#0f766e" }}>
              <ArticleIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                ใบอนุญาตประกอบวิชาชีพและคุณวุฒิวิชาชีพครู ({teacherLicenses.length})
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                คุรุสภา (A/B/P-License / ผ่อนผัน) • TPQI • มาตรฐานฝีมือแรงงาน (DSD) • กว.
              </Typography>
            </Box>
          </Box>

          {canEdit && (
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 15 }} />}
              onClick={() => openTeacherLicenseModal()}
              sx={{ fontSize: "0.75rem", fontWeight: 600, py: 0.35 }}
            >
              เพิ่มใบอนุญาต
            </Button>
          )}
        </Box>

        {teacherLicenses.length === 0 ? (
          <EmptyState
            compact
            icon={<BadgeIcon sx={{ fontSize: 32 }} />}
            title="ยังไม่มีการบันทึกใบอนุญาตประกอบวิชาชีพ"
            description="บันทึกข้อมูลใบอนุญาตคุรุสภา หรือหนังสือรับรองคุณวุฒิวิชาชีพ TPQI / DSD เพื่อใช้ในเอกสาร SAR มาตรฐานที่ 2"
            actionLabel={canEdit ? "+ เพิ่มใบอนุญาตใหม่" : undefined}
            onAction={canEdit ? () => openTeacherLicenseModal() : undefined}
          />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ประเภทใบอนุญาต</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>เลขที่ใบอนุญาต</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>สาขา / ระดับ</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>วันหมดอายุ</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">สถานะ</TableCell>
                  {canEdit && <TableCell sx={{ fontWeight: 700 }} align="center">จัดการ</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {teacherLicenses.map((lic) => (
                  <TableRow key={lic.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {lic.licenseType}
                      </Typography>
                      {lic.provisionalRound && (
                        <Typography variant="caption" sx={{ color: "warning.main" }}>
                          ผ่อนผันครั้งที่ {lic.provisionalRound}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>
                      {lic.licenseNumber}
                    </TableCell>
                    <TableCell>{lic.title || "-"}</TableCell>
                    <TableCell>
                      {lic.expiredDate ? new Date(lic.expiredDate).toLocaleDateString("th-TH") : "-"}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={lic.status === "ACTIVE" ? "มีผลใช้บังคับ" : lic.status}
                        color={lic.status === "ACTIVE" ? "success" : "default"}
                        sx={{ height: 20, fontSize: "0.6875rem" }}
                      />
                    </TableCell>
                    {canEdit && (
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => openTeacherLicenseModal(lic)}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteTeacherLicense(lic)}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* 5. Education & Work History (Accordion Panels) */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {/* Accordion 1: Education */}
        <Accordion defaultExpanded variant="outlined" sx={{ borderRadius: "10px !important", overflow: "hidden" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SchoolIcon sx={{ fontSize: 18, color: "primary.main" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                ประวัติการศึกษา ({currentEducation.length})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            {currentEducation.length === 0 ? (
              <Typography variant="body2" sx={{ color: "text.secondary", py: 1 }}>
                ยังไม่ได้ระบุประวัติการศึกษา
              </Typography>
            ) : (
              <Grid container spacing={1.5}>
                {currentEducation.map((edu, idx) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {edu.degree} - {edu.major}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        {edu.institution} {edu.year ? `• พ.ศ. ${edu.year}` : ""}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
            {canEdit && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                onClick={openEducationModal}
                sx={{ mt: 1.5, fontSize: "0.75rem" }}
              >
                แก้ไขประวัติการศึกษา
              </Button>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Accordion 2: Work History */}
        <Accordion defaultExpanded variant="outlined" sx={{ borderRadius: "10px !important", overflow: "hidden" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WorkIcon sx={{ fontSize: 18, color: "primary.main" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                ประวัติการทำงาน ({currentWorkHistory.length})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            {currentWorkHistory.length === 0 ? (
              <Typography variant="body2" sx={{ color: "text.secondary", py: 1 }}>
                ยังไม่ได้ระบุประวัติการทำงาน
              </Typography>
            ) : (
              <Grid container spacing={1.5}>
                {currentWorkHistory.map((work, idx) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {work.role}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        {work.organization} • {work.period}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
            {canEdit && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                onClick={openWorkHistoryModal}
                sx={{ mt: 1.5, fontSize: "0.75rem" }}
              >
                แก้ไขประวัติการทำงาน
              </Button>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Accordion 3: Skills & Expertise */}
        <Accordion variant="outlined" sx={{ borderRadius: "10px !important", overflow: "hidden" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AutoAwesomeIcon sx={{ fontSize: 18, color: "primary.main" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                ทักษะและความเชี่ยวชาญ ({currentSkills.length})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {currentSkills.map((skill, idx) => (
                <Chip key={idx} label={skill} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
              ))}
            </Box>
            {canEdit && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                onClick={openSkillsModal}
                sx={{ mt: 1.5, fontSize: "0.75rem" }}
              >
                แก้ไขทักษะ
              </Button>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* 6. Live Evidence Section (หลักฐานร่องรอยผลงาน) */}
      <LiveEvidenceSection
        category={["PROFILE", "TEACHER_PROFILE", "CERTIFICATE"]}
        sectionTitle="เอกสารและหลักฐานประกอบประวัติ"
        scope="my"
        hideUploadButton={false}
      />

      {/* ================= MODAL: BASIC INFO EDIT ================= */}
      <Dialog open={activeModal === "basic"} onClose={() => setActiveModal("none")} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveBasic}>
          <DialogTitle sx={{ fontWeight: 700 }}>แก้ไขข้อมูลส่วนตัวและโปรไฟล์</DialogTitle>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <ImageUpload
              value={basicForm.avatarUrl}
              onChange={(url) => setBasicForm((prev) => ({ ...prev, avatarUrl: url || "" }))}
            />
            <TextField
              size="small"
              label="ชื่อ-นามสกุล *"
              required
              value={basicForm.name}
              onChange={(e) => setBasicForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              size="small"
              label="ตำแหน่ง"
              value={basicForm.position}
              onChange={(e) => setBasicForm((prev) => ({ ...prev, position: e.target.value }))}
            />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <TextField
                size="small"
                label="เบอร์โทรศัพท์"
                value={basicForm.phone}
                onChange={(e) => setBasicForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
              <TextField
                size="small"
                label="วันเดือนปีเกิด"
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={basicForm.birthDate}
                onChange={(e) => setBasicForm((prev) => ({ ...prev, birthDate: e.target.value }))}
              />
            </Box>
            <TextField
              size="small"
              label="คำแนะนำตัว / คติประจำใจ"
              multiline
              rows={3}
              value={basicForm.bio}
              onChange={(e) => setBasicForm((prev) => ({ ...prev, bio: e.target.value }))}
            />
          </DialogContent>
          <DialogActions sx={{ p: 1.5 }}>
            <Button onClick={() => setActiveModal("none")} color="inherit" size="small">
              ยกเลิก
            </Button>
            <Button type="submit" variant="contained" size="small">
              บันทึกข้อมูล
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ================= MODAL: TEACHER LICENSE ================= */}
      <Dialog open={activeModal === "teacherLicense"} onClose={() => setActiveModal("none")} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveTeacherLicense}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingLicenseId ? "แก้ไขใบอนุญาตวิชาชีพ" : "เพิ่มใบอนุญาตวิชาชีพใหม่"}
          </DialogTitle>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>ประเภทใบอนุญาต *</InputLabel>
                <Select
                  value={teacherLicenseForm.licenseType}
                  label="ประเภทใบอนุญาต *"
                  onChange={(e) =>
                    setTeacherLicenseForm((prev) => ({ ...prev, licenseType: e.target.value as LicenseTypeEnum }))
                  }
                >
                  <MenuItem value="KSP_B_LICENSE">B-License (ชั้นต้น คุรุสภา)</MenuItem>
                  <MenuItem value="KSP_A_LICENSE">A-License (ชั้นสูง คุรุสภา)</MenuItem>
                  <MenuItem value="KSP_P_LICENSE">P-License (ปฏิบัติหน้าที่ครู)</MenuItem>
                  <MenuItem value="KSP_PROVISIONAL">หนังสือผ่อนผันคุรุสภา</MenuItem>
                  <MenuItem value="TPQI_CERTIFICATE">คุณวุฒิวิชาชีพ (TPQI)</MenuItem>
                  <MenuItem value="DSD_STANDARD">มาตรฐานฝีมือแรงงาน (DSD)</MenuItem>
                  <MenuItem value="COE_ENGINEER">ใบ กว. (วิศวกรรมควบคุม)</MenuItem>
                  <MenuItem value="OTHER_PROFESSIONAL">มาตรฐานวิชาชีพอื่น ๆ</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="เลขที่ใบอนุญาต *"
                required
                value={teacherLicenseForm.licenseNumber}
                onChange={(e) => setTeacherLicenseForm((prev) => ({ ...prev, licenseNumber: e.target.value }))}
              />
            </Box>

            <TextField
              size="small"
              label="สาขา / ระดับมาตรฐาน"
              placeholder="เช่น สาขาเทคนิคคอมพิวเตอร์ ระดับ 4"
              value={teacherLicenseForm.title || ""}
              onChange={(e) => setTeacherLicenseForm((prev) => ({ ...prev, title: e.target.value }))}
            />

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <TextField
                size="small"
                label="วันที่ออกเอกสาร"
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={teacherLicenseForm.issuedDate}
                onChange={(e) => setTeacherLicenseForm((prev) => ({ ...prev, issuedDate: e.target.value }))}
              />
              <TextField
                size="small"
                label="วันที่หมดอายุ"
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={teacherLicenseForm.expiredDate}
                onChange={(e) => setTeacherLicenseForm((prev) => ({ ...prev, expiredDate: e.target.value }))}
              />
            </Box>

            <DocumentUpload
              value={teacherLicenseForm.attachmentKey}
              fileName={teacherLicenseForm.attachmentName}
              onChange={(key, name) =>
                setTeacherLicenseForm((prev) => ({
                  ...prev,
                  attachmentKey: key || "",
                  attachmentName: name || "",
                }))
              }
            />
          </DialogContent>
          <DialogActions sx={{ p: 1.5 }}>
            <Button onClick={() => setActiveModal("none")} color="inherit" size="small">
              ยกเลิก
            </Button>
            <Button type="submit" variant="contained" size="small">
              บันทึกใบอนุญาต
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ================= MODAL: EDUCATION ================= */}
      <Dialog open={activeModal === "education"} onClose={() => setActiveModal("none")} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>แก้ไขประวัติการศึกษา</DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {educationList.map((edu, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 1.5, borderRadius: 2, display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  ระดับที่ {idx + 1}
                </Typography>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setEducationList((prev) => prev.filter((_, i) => i !== idx))}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                <TextField
                  size="small"
                  label="ระดับวุฒิ (Degree)"
                  value={edu.degree}
                  onChange={(e) =>
                    setEducationList((prev) =>
                      prev.map((item, i) => (i === idx ? { ...item, degree: e.target.value } : item))
                    )
                  }
                />
                <TextField
                  size="small"
                  label="สาขาวิชา (Major)"
                  value={edu.major}
                  onChange={(e) =>
                    setEducationList((prev) =>
                      prev.map((item, i) => (i === idx ? { ...item, major: e.target.value } : item))
                    )
                  }
                />
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 1 }}>
                <TextField
                  size="small"
                  label="สถาบันการศึกษา (Institution)"
                  value={edu.institution}
                  onChange={(e) =>
                    setEducationList((prev) =>
                      prev.map((item, i) => (i === idx ? { ...item, institution: e.target.value } : item))
                    )
                  }
                />
                <TextField
                  size="small"
                  label="ปีที่สำเร็จ (พ.ศ.)"
                  value={edu.year || ""}
                  onChange={(e) =>
                    setEducationList((prev) =>
                      prev.map((item, i) => (i === idx ? { ...item, year: e.target.value } : item))
                    )
                  }
                />
              </Box>
            </Paper>
          ))}
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() =>
              setEducationList((prev) => [
                ...prev,
                { degree: "ปริญญาตรี", major: "", institution: "", year: "" },
              ])
            }
          >
            เพิ่มประวัติการศึกษา
          </Button>
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button onClick={() => setActiveModal("none")} color="inherit" size="small">
            ยกเลิก
          </Button>
          <Button onClick={handleSaveEducation} variant="contained" size="small">
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= MODAL: WORK HISTORY ================= */}
      <Dialog open={activeModal === "workHistory"} onClose={() => setActiveModal("none")} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>แก้ไขประวัติการทำงาน</DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {workHistoryList.map((work, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 1.5, borderRadius: 2, display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  ตำแหน่งที่ {idx + 1}
                </Typography>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setWorkHistoryList((prev) => prev.filter((_, i) => i !== idx))}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
              <TextField
                size="small"
                label="ตำแหน่ง / หน้าที่"
                value={work.role}
                onChange={(e) =>
                  setWorkHistoryList((prev) =>
                    prev.map((item, i) => (i === idx ? { ...item, role: e.target.value } : item))
                  )
                }
              />
              <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 1 }}>
                <TextField
                  size="small"
                  label="หน่วยงาน / องค์กร"
                  value={work.organization}
                  onChange={(e) =>
                    setWorkHistoryList((prev) =>
                      prev.map((item, i) => (i === idx ? { ...item, organization: e.target.value } : item))
                    )
                  }
                />
                <TextField
                  size="small"
                  label="ช่วงเวลา (เช่น 2564 - ปัจจุบัน)"
                  value={work.period}
                  onChange={(e) =>
                    setWorkHistoryList((prev) =>
                      prev.map((item, i) => (i === idx ? { ...item, period: e.target.value } : item))
                    )
                  }
                />
              </Box>
            </Paper>
          ))}
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() =>
              setWorkHistoryList((prev) => [
                ...prev,
                { role: "", organization: "", period: "" },
              ])
            }
          >
            เพิ่มประวัติการทำงาน
          </Button>
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button onClick={() => setActiveModal("none")} color="inherit" size="small">
            ยกเลิก
          </Button>
          <Button onClick={handleSaveWorkHistory} variant="contained" size="small">
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= MODAL: SKILLS ================= */}
      <Dialog open={activeModal === "skills"} onClose={() => setActiveModal("none")} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>แก้ไขทักษะและความเชี่ยวชาญ</DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="พิมพ์ทักษะแล้วกด Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && skillInput.trim()) {
                  e.preventDefault();
                  if (!skillsList.includes(skillInput.trim())) {
                    setSkillsList((prev) => [...prev, skillInput.trim()]);
                  }
                  setSkillInput("");
                }
              }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                if (skillInput.trim() && !skillsList.includes(skillInput.trim())) {
                  setSkillsList((prev) => [...prev, skillInput.trim()]);
                  setSkillInput("");
                }
              }}
            >
              เพิ่ม
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, pt: 0.5 }}>
            {skillsList.map((skill, idx) => (
              <Chip
                key={idx}
                label={skill}
                size="small"
                onDelete={() => setSkillsList((prev) => prev.filter((_, i) => i !== idx))}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button onClick={() => setActiveModal("none")} color="inherit" size="small">
            ยกเลิก
          </Button>
          <Button onClick={handleSaveSkills} variant="contained" size="small">
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= MODAL: PASSWORD ================= */}
      <Dialog open={activeModal === "password"} onClose={() => setActiveModal("none")} maxWidth="xs" fullWidth>
        <form onSubmit={handleSavePassword}>
          <DialogTitle sx={{ fontWeight: 700 }}>เปลี่ยนรหัสผ่าน</DialogTitle>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              size="small"
              label="รหัสผ่านใหม่ *"
              type="password"
              required
              value={passwordForm.password}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, password: e.target.value }))}
            />
            <TextField
              size="small"
              label="ยืนยันรหัสผ่านใหม่ *"
              type="password"
              required
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </DialogContent>
          <DialogActions sx={{ p: 1.5 }}>
            <Button onClick={() => setActiveModal("none")} color="inherit" size="small">
              ยกเลิก
            </Button>
            <Button type="submit" variant="contained" size="small">
              เปลี่ยนรหัสผ่าน
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
        <DialogTitle sx={{ fontWeight: 700 }}>{confirmDialog.title}</DialogTitle>
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
