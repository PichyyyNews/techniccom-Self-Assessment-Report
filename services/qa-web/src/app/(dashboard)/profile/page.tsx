"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  Edit3,
  Plus,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  Shield,
  Key,
  Quote,
  Clock,
  Camera,
  Share2,
  Check,
  ArrowLeft,
  Eye,
  Lock,
  FileBadge,
  Building2,
  ExternalLink,
  FileText,
  AlertTriangle,
  Scroll,
} from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { DocumentUpload } from "@/components/ui/DocumentUpload";
import { ContributionGraph } from "@/components/profile/ContributionGraph";
import { clsx } from "clsx";

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

export type LicenseStatusEnum =
  | "ACTIVE"
  | "EXPIRING_SOON"
  | "EXPIRED"
  | "IN_RENEWAL";

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

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  roleCode: string;
  roleDefinition?: {
    id: string;
    code: string;
    title: string;
    color: string;
    permissions: string[];
  } | null;
  position?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  bio?: string | null;
  education?: EducationItem[] | null;
  workHistory?: WorkHistoryItem[] | null;
  licenses?: LicenseItem[] | null;
  teacherLicenses?: TeacherLicenseData[] | null;
  skills?: string[];
  isActive: boolean;
  createdAt: string;
}

type ModalType = "none" | "basic" | "education" | "workHistory" | "skills" | "licenses" | "teacherLicense" | "password";

export default function ProfilePage({ targetId }: { targetId?: string }) {
  const params = useParams();
  const userId = targetId || (params?.id as string) || undefined;
  const { data: session, update: updateSession } = useSession();

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [contributionMap, setContributionMap] = useState<Record<string, number>>({});
  const [totalContributions, setTotalContributions] = useState(0);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [canEdit, setCanEdit] = useState(true);
  const [isSelf, setIsSelf] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Active Modal Type
  const [activeModal, setActiveModal] = useState<ModalType>("none");
  const [submitting, setSubmitting] = useState(false);

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
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });

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
      setAvatarError(false);
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
  const roleColor = user?.roleDefinition?.color || (isRoot ? "rose" : "blue");
  const age = calculateAge(user?.birthDate);

  const getBadgeStyle = (color?: string | null) => {
    if (isRoot || color === "rose") return "bg-rose-50 text-rose-700 border-rose-200";
    if (color === "purple") return "bg-purple-50 text-purple-700 border-purple-200";
    if (color === "emerald") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (color === "amber") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  // Open Handlers for Modular Modals
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

  const openLicensesModal = () => {
    if (!user) return;
    setLicensesList((user.licenses as LicenseItem[]) || [
      {
        name: "ใบอนุญาตประกอบวิชาชีพครู",
        licenseNumber: "",
        issuer: "สำนักงานเลขาธิการคุรุสภา",
        issueDate: "",
        expireDate: "",
        isLifetime: false,
        fileUrl: "",
      },
    ]);
    setActiveModal("licenses");
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
      const chosenType = defaultType || "KSP_B_LICENSE";
      const isKspType = ["KSP_A_LICENSE", "KSP_B_LICENSE", "KSP_P_LICENSE", "KSP_PROVISIONAL"].includes(chosenType);
      setTeacherLicenseCategory(isKspType ? "ksp" : "vocational");
      setTeacherLicenseForm({
        licenseType: chosenType,
        licenseNumber: "",
        title: "",
        provisionalRound: 1,
        nameTh: user?.name || "",
        nameEn: "",
        issuedDate: "",
        expiredDate: "",
        status: "ACTIVE",
        attachmentKey: "",
        attachmentName: "",
      });
      setIsRenewalPending(false);
    }
    setActiveModal("teacherLicense");
  };

  const handleDeleteTeacherLicense = async (licenseId: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการใบอนุญาต/คุณวุฒินี้?")) return;
    try {
      setSubmitting(true);
      const targetEndpoint = isSelf ? "/api/profile" : `/api/profile/${userId}`;
      const res = await fetch(targetEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "teacherLicense",
          action: "delete",
          licenseId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการลบรายการ");
      if (data.user) setUser(data.user);
      await fetchProfile();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการลบรายการ");
    } finally {
      setSubmitting(false);
    }
  };

  const getLicenseIcon = (name?: string) => {
    switch (name) {
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
      case "Scroll":
        return Scroll;
      default:
        return FileText;
    }
  };

  const getTeacherLicenseTypeInfo = (type?: LicenseTypeEnum) => {
    const config = licenseConfigs.find((c) => c.code === type);
    if (config) {
      return {
        title: config.title,
        enTitle: config.description || config.title,
        category: config.category as "ksp" | "vocational",
        defaultYears: config.defaultYears || 5,
        issuer: config.issuer || "หน่วยงานมาตรฐาน",
        badgeColor: getBadgeStyle(config.color),
        icon: getLicenseIcon(config.icon),
      };
    }

    switch (type) {
      case "KSP_A_LICENSE":
        return {
          title: "ใบอนุญาตประกอบวิชาชีพครูชั้นสูง (A-License)",
          enTitle: "Advanced Teaching License (Khurusapha - 7 Years)",
          category: "ksp" as const,
          defaultYears: 7,
          issuer: "สำนักงานเลขาธิการคุรุสภา",
          badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
          icon: Award,
        };
      case "KSP_B_LICENSE":
        return {
          title: "ใบอนุญาตประกอบวิชาชีพครูชั้นต้น (B-License)",
          enTitle: "Basic Teaching License (Khurusapha - 5 Years)",
          category: "ksp" as const,
          defaultYears: 5,
          issuer: "สำนักงานเลขาธิการคุรุสภา",
          badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
          icon: GraduationCap,
        };
      case "KSP_P_LICENSE":
        return {
          title: "ใบอนุญาตปฏิบัติหน้าที่ครู (P-License)",
          enTitle: "Provisional Teaching License (Khurusapha - 2 Years)",
          category: "ksp" as const,
          defaultYears: 2,
          issuer: "สำนักงานเลขาธิการคุรุสภา",
          badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
          icon: Shield,
        };
      case "KSP_PROVISIONAL":
        return {
          title: "หนังสืออนุญาตปฏิบัติการสอนโดยไม่มีใบประกอบฯ (ผ่อนผันคุรุสภา)",
          enTitle: "Provisional Teaching Permission (Vocational Special Teacher)",
          category: "ksp" as const,
          defaultYears: 2,
          issuer: "สำนักงานเลขาธิการคุรุสภา / สอศ.",
          badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock,
        };
      case "TPQI_CERTIFICATE":
        return {
          title: "หนังสือรับรองคุณวุฒิวิชาชีพ (TPQI)",
          enTitle: "Thailand Professional Qualification Certificate",
          category: "vocational" as const,
          defaultYears: 3,
          issuer: "สถาบันคุณวุฒิวิชาชีพ (องค์การมหาชน)",
          badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: FileBadge,
        };
      case "DSD_STANDARD":
        return {
          title: "หนังสือรับรองมาตรฐานฝีมือแรงงานแห่งชาติ (DSD)",
          enTitle: "National Skill Standard Certificate (Department of Skill Development)",
          category: "vocational" as const,
          defaultYears: 5,
          issuer: "กรมพัฒนาฝีมือแรงงาน กระทรวงแรงงาน",
          badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: Award,
        };
      case "COE_ENGINEER":
        return {
          title: "ใบประกอบวิชาชีพวิศวกรรมควบคุม (กว.)",
          enTitle: "Council of Engineers Professional License",
          category: "vocational" as const,
          defaultYears: 5,
          issuer: "สภาวิศวกร (Council of Engineers)",
          badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
          icon: Briefcase,
        };
      case "OTHER_PROFESSIONAL":
      default:
        return {
          title: "ใบรับรองมาตรฐานวิชาชีพสากล/อื่นๆ (Cisco, CompTIA, etc.)",
          enTitle: "International / Professional Certification",
          category: "vocational" as const,
          defaultYears: 3,
          issuer: "สถาบัน/องค์กรมาตรฐานวิชาชีพ",
          badgeColor: "bg-slate-50 text-slate-700 border-slate-200",
          icon: Sparkles,
        };
    }
  };

  const getTeacherLicenseStatusInfo = (lic?: TeacherLicenseData | null) => {
    if (!lic || !lic.expiredDate) return null;
    if (lic.status === "IN_RENEWAL") {
      return {
        label: "อยู่ระหว่างยื่นคำขอต่ออายุ (In Renewal)",
        sublabel: "รอผลการพิจารณาอนุมัติ",
        style: "bg-blue-50 text-blue-700 border-blue-200",
        alertType: "info" as const,
        daysLeft: null,
      };
    }
    const expire = new Date(lic.expiredDate);
    if (isNaN(expire.getTime())) return null;

    const today = new Date();
    const diffTime = expire.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: "หมดอายุแล้ว (Expired)",
        sublabel: `หมดอายุเมื่อ ${Math.abs(diffDays)} วันที่แล้ว กรุณาดำเนินการต่ออายุโดยด่วน`,
        style: "bg-rose-50 text-rose-700 border-rose-200",
        alertType: "danger" as const,
        daysLeft: diffDays,
      };
    }
    if (diffDays <= 90) {
      return {
        label: `ใกล้หมดอายุเร่งด่วน (เหลือ ${diffDays} วัน)`,
        sublabel: "ควรดำเนินการยื่นคำขอต่ออายุทันที",
        style: "bg-rose-50 text-rose-700 border-rose-200 animate-pulse",
        alertType: "warning" as const,
        daysLeft: diffDays,
      };
    }
    if (diffDays <= 180) {
      return {
        label: `ใกล้หมดอายุ (เหลือ ${diffDays} วัน)`,
        sublabel: "สามารถยื่นคำขอต่ออายุล่วงหน้าได้แล้ว (ยื่นล่วงหน้าได้ 180 วัน)",
        style: "bg-amber-50 text-amber-700 border-amber-200",
        alertType: "warning" as const,
        daysLeft: diffDays,
      };
    }
    return {
      label: "ใช้งานได้ปกติ (Active)",
      sublabel: `เหลืออายุการใช้งานอีก ${diffDays} วัน`,
      style: "bg-emerald-50 text-emerald-700 border-emerald-200",
      alertType: "success" as const,
      daysLeft: diffDays,
    };
  };

  const getLicenseStatus = (item: LicenseItem) => {
    if (item.isLifetime) {
      return { status: "lifetime", label: "ตลอดชีพ (Lifetime)", style: "bg-purple-50 text-purple-700 border-purple-200" };
    }
    if (!item.expireDate) {
      return { status: "active", label: "ใช้งานได้ปกติ", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    const expire = new Date(item.expireDate);
    if (isNaN(expire.getTime())) {
      return { status: "active", label: "ใช้งานได้ปกติ", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    const today = new Date();
    const diffTime = expire.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: "expired", label: "หมดอายุแล้ว", style: "bg-rose-50 text-rose-700 border-rose-200" };
    }
    if (diffDays <= 90) {
      return { status: "expiring", label: `ใกล้หมดอายุ (เหลือ ${diffDays} วัน)`, style: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    return { status: "active", label: "ใช้งานได้ปกติ", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  };

  const openPasswordModal = () => {
    setPasswordForm({ password: "", confirmPassword: "" });
    setActiveModal("password");
  };

  // Submit Handler for Modular Modals
  const handleSaveSection = async (section: ModalType, payload: any) => {
    if (!canEdit) return;
    setSubmitting(true);
    try {
      const url = userId ? `/api/profile/${userId}` : "/api/profile";
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, ...payload }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        return;
      }

      setActiveModal("none");
      fetchProfile();
      if (isSelf && updateSession) updateSession();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-14 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
        <span className="text-sm font-medium">กำลังโหลดข้อมูลโปรไฟล์...</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 sm:p-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center space-y-4 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto border border-rose-200">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">ไม่สามารถเข้าถึงโปรไฟล์ได้</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {error || "ไม่พบข้อมูลโปรไฟล์ของบุคลากรท่านนี้ หรือคุณไม่ได้รับสิทธิ์ในการดูข้อมูล"}
          </p>
          <div className="pt-2">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              กลับหน้ารายชื่อผู้ใช้งาน
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentEducation: EducationItem[] = (user?.education as EducationItem[]) || [
    { degree: "ปริญญาตรี", major: "ครุศาสตร์อุตสาหกรรม / คอมพิวเตอร์ธุรกิจ", institution: "มหาวิทยาลัยเทคโนโลยี", year: "2562" },
  ];

  const currentWorkHistory: WorkHistoryItem[] = (user?.workHistory as WorkHistoryItem[]) || [
    { role: user?.position || "บุคลากรประจำสถานศึกษา", organization: "วิทยาลัยเทคนิค", period: "2564 - ปัจจุบัน" },
  ];

  const currentLicenses: LicenseItem[] = (user?.licenses as LicenseItem[]) || [];

  const currentSkills: string[] = user?.skills && user.skills.length > 0 ? user.skills : [
    "การประกันคุณภาพการศึกษา (SAR)",
    "การจัดการเรียนการสอนอาชีวศึกษา",
    "เทคโนโลยีสารสนเทศ",
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-3.5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Top Breadcrumb navigation (If viewing someone else or from admin) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!isSelf ? (
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              กลับหน้ารายชื่อผู้ใช้งาน
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              กลับหน้าหลัก
            </Link>
          )}

          {!isSelf && (
            <span className="text-xs font-semibold text-slate-400">
              / ดูโปรไฟล์ของ <span className="text-slate-700 font-bold">{user.name}</span>
            </span>
          )}
        </div>

        {/* Permission Status Pill */}
        <div>
          {canEdit ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-2xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              {isSelf ? "โปรไฟล์ของคุณ (แก้ไขได้)" : "สิทธิ์แก้ไขโปรไฟล์ (Can Edit)"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 shadow-2xs">
              <Eye className="h-3.5 w-3.5 text-slate-500" />
              โหมดดูข้อมูลอย่างเดียว (Read-Only)
            </span>
          )}
        </div>
      </div>

      {/* ================= 1. SOCIAL PROFILE HEADER BANNER ================= */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        {/* Cover Graphic Banner */}
        <div className="h-36 sm:h-52 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
        </div>

        {/* Profile Identity Layout */}
        <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-0">
          {/* Top Floating Row: Avatar (Left) + Action Buttons (Right) */}
          <div className="flex items-end justify-between -mt-14 sm:-mt-20 mb-4 sm:mb-5">
            {/* Avatar with Camera Trigger */}
            <div className="relative group">
              {user?.avatarUrl && !avatarError ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  onError={() => setAvatarError(true)}
                  className="h-28 w-28 sm:h-36 sm:w-36 rounded-3xl object-cover border-4 border-white shadow-xl shadow-slate-900/10 bg-white"
                />
              ) : (
                <div className="flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-3xl sm:text-4xl border-4 border-white shadow-xl shadow-slate-900/10">
                  {user?.name ? user.name.charAt(0) : "U"}
                </div>
              )}

              {/* Camera Trigger only if canEdit */}
              {canEdit && (
                <button
                  type="button"
                  onClick={openBasicModal}
                  className="absolute bottom-1 right-1 p-2 rounded-xl bg-slate-900 text-white shadow-md hover:bg-slate-800 transition active:scale-95"
                  title="เปลี่ยนรูปประจำตัว"
                >
                  <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>

            {/* Quick Action Buttons (Share Profile + Edit if canEdit) */}
            <div className="flex items-center gap-2">
              {/* Share / Copy Profile Link Button */}
              <button
                type="button"
                onClick={handleCopyLink}
                className={clsx(
                  "inline-flex items-center justify-center gap-1.5 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition active:scale-95 shadow-2xs border",
                  copied
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/25"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                )}
                title="คัดลอกลิงก์โปรไฟล์เพื่อแชร์"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-white" />
                    <span>คัดลอกลิงก์แล้ว!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 text-slate-500" />
                    <span>แชร์โปรไฟล์</span>
                  </>
                )}
              </button>

              {/* Edit Buttons if authorized */}
              {canEdit ? (
                <>
                  <button
                    onClick={openBasicModal}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 active:scale-95"
                  >
                    <Edit3 className="h-4 w-4" />
                    แก้ไขข้อมูลส่วนตัว
                  </button>

                  <button
                    onClick={openPasswordModal}
                    className="p-2.5 sm:p-3 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition active:scale-95 shadow-2xs"
                    title="เปลี่ยนรหัสผ่าน"
                  >
                    <Key className="h-4 w-4 text-slate-500" />
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {/* User Name & Details Section (100% Inside White Card) */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {user?.name}
              </h1>
              <span
                className={clsx(
                  "inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black border",
                  getBadgeStyle(roleColor)
                )}
              >
                {isRoot && <Shield className="h-3.5 w-3.5" />}
                {roleTitle}
              </span>
            </div>

            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-600" />
              {user?.position || "บุคลากรวิทยาลัย"}
            </p>

            <p className="text-xs text-slate-400 flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              {user?.email}
            </p>
          </div>

          {/* Social Bio / Philosophy */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
            {user?.bio ? (
              <div className="flex items-start gap-2.5 bg-slate-50/90 p-3.5 sm:p-4 rounded-2xl border border-slate-100">
                <Quote className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5 rotate-180" />
                <p className="whitespace-pre-line text-slate-800 font-medium">{user.bio}</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
                <span className="text-slate-400 text-xs italic">
                  ยังไม่มีคำแนะนำตัวหรือคติประจำใจ
                </span>
                {canEdit && (
                  <button
                    onClick={openBasicModal}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    + เพิ่มคำแนะนำตัว
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Contact Facts */}
          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <span>{user?.phone ? user.phone : "ไม่ได้ระบุเบอร์โทร"}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>
                {user?.birthDate
                  ? new Date(user.birthDate).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "ไม่ได้ระบุวันเกิด"}
              </span>
              {age !== null && (
                <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                  (อายุ {age} ปี)
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-50/70 px-3 py-1.5 rounded-xl border border-emerald-200/70 text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-semibold">{user?.isActive ? "สถานะบัญชีปกติ" : "ระงับการใช้งาน"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. GITHUB-STYLE CONTRIBUTION ACTIVITY GRAPH (REAL DATA) ================= */}
      <ContributionGraph
        totalContributions={totalContributions}
        contributionMap={contributionMap}
        recentActivities={recentActivities}
      />

      {/* ================= 3. VOCATIONAL & KHURUSAPHA TEACHER CREDENTIALS (ใบอนุญาตประกอบวิชาชีพและคุณวุฒิวิชาชีพ) ================= */}
      {(() => {
        const allLicenses = user?.teacherLicenses || [];
        const kspLicenses = allLicenses.filter((l) =>
          ["KSP_A_LICENSE", "KSP_B_LICENSE", "KSP_P_LICENSE", "KSP_PROVISIONAL"].includes(l.licenseType)
        );
        const vocationalLicenses = allLicenses.filter((l) =>
          ["TPQI_CERTIFICATE", "DSD_STANDARD", "COE_ENGINEER", "OTHER_PROFESSIONAL"].includes(l.licenseType)
        );

        return (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20 flex-shrink-0">
                  <Scroll className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                      ใบอนุญาตประกอบวิชาชีพและคุณวุฒิวิชาชีพครู (สอศ.)
                    </h3>
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-black bg-teal-50 text-teal-700 border border-teal-200">
                      SAR มาตรฐานวิชาชีพครูและสาขาช่าง
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    คุรุสภา (A/B/P-License / ผ่อนผัน) • คุณวุฒิวิชาชีพ (TPQI) • มาตรฐานฝีมือแรงงาน (DSD) • สภาวิศวกร (กว.)
                  </p>
                </div>
              </div>

              {canEdit && (
                <div className="flex items-center gap-2 flex-wrap flex-shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => openTeacherLicenseModal(undefined, "KSP_B_LICENSE")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition shadow-sm shadow-teal-500/20 active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    + ใบอนุญาตคุรุสภา / ผ่อนผัน
                  </button>
                  <button
                    type="button"
                    onClick={() => openTeacherLicenseModal(undefined, "TPQI_CERTIFICATE")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition shadow-sm active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    + คุณวุฒิ TPQI / DSD / กว.
                  </button>
                </div>
              )}
            </div>

            {/* Subsection 1: Khurusapha Teaching Licenses */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-teal-600" />
                    1. ใบอนุญาตประกอบวิชาชีพทางการศึกษา (คุรุสภา / หนังสือผ่อนผัน)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    {kspLicenses.length} รายการ
                  </span>
                </div>
              </div>

              {kspLicenses.length === 0 ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-teal-50/50 via-slate-50 to-white border border-teal-100 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <FileBadge className="h-4 w-4 text-teal-600 flex-shrink-0" />
                    <span>ยังไม่มีข้อมูลใบอนุญาตคุรุสภา (A-License / B-License / P-License หรือหนังสือผ่อนผันสำหรับครูพิเศษสอน)</span>
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => openTeacherLicenseModal(undefined, "KSP_B_LICENSE")}
                      className="text-teal-700 font-bold hover:underline flex-shrink-0"
                    >
                      + กรอกข้อมูลคุรุสภา
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {kspLicenses.map((lic) => {
                    const typeInfo = getTeacherLicenseTypeInfo(lic.licenseType);
                    const statusInfo = getTeacherLicenseStatusInfo(lic);
                    const TypeIcon = typeInfo.icon;
                    const isProvisional = lic.licenseType === "KSP_PROVISIONAL";
                    const isLastRound = isProvisional && lic.provisionalRound === 3;

                    return (
                      <div
                        key={lic.id}
                        className={clsx(
                          "rounded-2xl p-4 sm:p-5 border transition hover:shadow-sm space-y-3",
                          isLastRound
                            ? "bg-gradient-to-br from-rose-50/80 via-amber-50/40 to-white border-rose-300 ring-1 ring-rose-200"
                            : "bg-gradient-to-br from-slate-50 via-teal-50/15 to-white border-slate-200/90"
                        )}
                      >
                        {/* Critical Alert if 3rd round of provisional */}
                        {isLastRound && (
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-100/90 border border-rose-300 text-xs text-rose-900 font-bold">
                            <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                            <span>
                              ผ่อนผันคุรุสภาครั้งที่ 3 (ครั้งสุดท้ายตามระเบียบ สอศ.) — กรุณาเร่งสำเร็จคุณวุฒิครู / ป.บัณฑิต หรือสอบผ่านเกณฑ์คุรุสภาเพื่อขอ B-License ก่อนหมดอายุ
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-teal-700 border border-slate-200 shadow-2xs flex-shrink-0">
                              <TypeIcon className="h-5 w-5 text-teal-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-black text-slate-900 truncate">
                                  {typeInfo.title}
                                </h4>
                                {isProvisional && (
                                  <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                                    ผ่อนผันครั้งที่ {lic.provisionalRound || 1} (จำกัดไม่เกิน 3 ครั้ง)
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 font-medium">
                                {typeInfo.enTitle}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={clsx("px-2.5 py-1 text-xs font-bold rounded-xl border shadow-2xs", typeInfo.badgeColor)}>
                              {lic.licenseType}
                            </span>
                            {statusInfo && (
                              <span className={clsx("px-2.5 py-1 text-xs font-black rounded-xl border shadow-2xs", statusInfo.style)}>
                                {statusInfo.label}
                              </span>
                            )}
                            {canEdit && (
                              <div className="flex items-center gap-1 ml-1">
                                <button
                                  type="button"
                                  onClick={() => openTeacherLicenseModal(lic)}
                                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                                  title="แก้ไข"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => lic.id && handleDeleteTeacherLicense(lic.id)}
                                  className="p-1.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition shadow-2xs"
                                  title="ลบ"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                            <span className="text-[10px] font-semibold text-slate-400 block">เลขที่เอกสาร</span>
                            <span className="text-xs font-mono font-bold text-slate-900 truncate block">{lic.licenseNumber}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                            <span className="text-[10px] font-semibold text-slate-400 block">ชื่อ-นามสกุลบนบัตร</span>
                            <span className="text-xs font-bold text-slate-800 truncate block">{lic.nameTh || user?.name}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                            <span className="text-[10px] font-semibold text-slate-400 block">วันที่ออก</span>
                            <span className="text-xs font-bold text-slate-800 block">
                              {lic.issuedDate ? new Date(lic.issuedDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                            <span className="text-[10px] font-semibold text-slate-400 block">วันหมดอายุ</span>
                            <span className="text-xs font-bold text-slate-900 block">
                              {lic.expiredDate ? new Date(lic.expiredDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                            </span>
                            {statusInfo && statusInfo.daysLeft !== null && (
                              <span className="text-[10px] text-slate-400 block">
                                {statusInfo.daysLeft >= 0 ? `(เหลือ ${statusInfo.daysLeft} วัน)` : `(หมดอายุ ${Math.abs(statusInfo.daysLeft)} วัน)`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* File Attachment & Actions footer */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                          <span className="text-[11px] text-slate-400">
                            หน่วยงานกำกับดูแล: {typeInfo.issuer}
                          </span>
                          <div className="flex items-center gap-2">
                            {lic.attachmentKey && (
                              <a
                                href={lic.attachmentKey}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition shadow-2xs"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>เปิดดูเอกสาร / สแกนบัตร</span>
                              </a>
                            )}
                            <a
                              href="https://ksp-selfservice.ksp.or.th"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-2xs"
                            >
                              <span>KSP Self-Service</span>
                              <ExternalLink className="h-3 w-3 text-slate-400" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Subsection 2: Vocational & Technical Skill Standards (TPQI / DSD / COE / International) */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-emerald-600" />
                    2. คุณวุฒิวิชาชีพและมาตรฐานฝีมือแรงงานเฉพาะทาง (TPQI / DSD / กว. / สากล)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {vocationalLicenses.length} รายการ
                  </span>
                </div>
              </div>

              {vocationalLicenses.length === 0 ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/50 via-slate-50 to-white border border-emerald-100 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Sparkles className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      ยังไม่มีข้อมูลคุณวุฒิวิชาชีพ (TPQI), มาตรฐานฝีมือแรงงาน (DSD), หรือใบประกอบวิชาชีพวิศวกรรม (กว.) สำหรับแผนกเทคโนโลยีคอมพิวเตอร์/ช่าง
                    </span>
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => openTeacherLicenseModal(undefined, "TPQI_CERTIFICATE")}
                      className="text-emerald-700 font-bold hover:underline flex-shrink-0"
                    >
                      + เพิ่มคุณวุฒิสายอาชีพ
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {vocationalLicenses.map((lic) => {
                    const typeInfo = getTeacherLicenseTypeInfo(lic.licenseType);
                    const TypeIcon = typeInfo.icon;

                    return (
                      <div
                        key={lic.id}
                        className="rounded-2xl p-4 sm:p-5 border border-slate-200/80 bg-gradient-to-br from-slate-50 via-emerald-50/15 to-white shadow-2xs space-y-3 transition hover:shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 border border-slate-200 shadow-2xs flex-shrink-0">
                              <TypeIcon className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                              <span className={clsx("px-2 py-0.5 text-[10px] font-bold rounded-md border", typeInfo.badgeColor)}>
                                {typeInfo.title}
                              </span>
                              <h4 className="text-xs sm:text-sm font-black text-slate-900 mt-1 truncate">
                                {lic.title || lic.licenseNumber}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-medium">
                                เลขที่เอกสาร: {lic.licenseNumber}
                              </p>
                            </div>
                          </div>

                          {canEdit && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => openTeacherLicenseModal(lic)}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                                title="แก้ไข"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => lic.id && handleDeleteTeacherLicense(lic.id)}
                                className="p-1.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition shadow-2xs"
                                title="ลบ"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                          <div>
                            <span className="text-slate-400">วันหมดอายุ: </span>
                            <span className="font-bold">
                              {lic.expiredDate ? new Date(lic.expiredDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                            </span>
                          </div>

                          {lic.attachmentKey && (
                            <a
                              href={lic.attachmentKey}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              ดูเอกสาร
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ================= 4. TWO-COLUMN DETAILS (EDUCATION & WORK HISTORY) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Left Column: Educational Qualifications (วุฒิการศึกษา) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  วุฒิการศึกษา (Educational Qualifications)
                </h3>
                <p className="text-xs text-slate-400">ประวัติการศึกษาและคุณวุฒิ</p>
              </div>
            </div>

            {canEdit && (
              <button
                onClick={openEducationModal}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition active:scale-95"
              >
                <Edit3 className="h-3.5 w-3.5" />
                แก้ไขวุฒิ
              </button>
            )}
          </div>

          <div className="space-y-3">
            {currentEducation.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">ยังไม่มีข้อมูลวุฒิการศึกษา</p>
            ) : (
              currentEducation.map((edu, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 transition hover:bg-slate-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-700 border border-slate-200 shadow-2xs flex-shrink-0 mt-0.5">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {edu.degree} {edu.major && `• ${edu.major}`}
                      </h4>
                      {edu.year && (
                        <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 flex-shrink-0">
                          พ.ศ. {edu.year}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {edu.institution || "สถานศึกษา"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Work History & Experience (ประวัติการทำงาน) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  ประวัติการทำงาน & ผลงาน (Experience)
                </h3>
                <p className="text-xs text-slate-400">หน้าที่ความรับผิดชอบและผลงาน</p>
              </div>
            </div>

            {canEdit && (
              <button
                onClick={openWorkHistoryModal}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition active:scale-95"
              >
                <Edit3 className="h-3.5 w-3.5" />
                แก้ไขประวัติ
              </button>
            )}
          </div>

          <div className="space-y-3">
            {currentWorkHistory.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">ยังไม่มีข้อมูลประวัติการทำงาน</p>
            ) : (
              currentWorkHistory.map((work, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 transition hover:bg-slate-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-700 border border-slate-200 shadow-2xs flex-shrink-0 mt-0.5">
                    <Briefcase className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {work.role}
                      </h4>
                      {work.period && (
                        <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 flex-shrink-0">
                          {work.period}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {work.organization || "หน่วยงาน"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ================= 4. DETAILED PROFESSIONAL LICENSES (ข้อมูลใบอนุญาตประกอบวิชาชีพ) ================= */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-200/60">
              <FileBadge className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                ข้อมูลใบอนุญาตประกอบวิชาชีพ (Professional Licenses)
              </h3>
              <p className="text-xs text-slate-400">
                ใบอนุญาตประกอบวิชาชีพครู, ผู้บริหารสถานศึกษา, ใบ กว. และใบรับรองวิชาชีพเฉพาะทาง
              </p>
            </div>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={openLicensesModal}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-50 text-teal-700 text-xs font-bold hover:bg-teal-100 transition active:scale-95"
            >
              <Edit3 className="h-3.5 w-3.5" />
              จัดการใบประกอบวิชาชีพ
            </button>
          )}
        </div>

        {currentLicenses.length === 0 ? (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
            <span className="text-slate-400 text-xs italic">
              ยังไม่มีข้อมูลใบอนุญาตประกอบวิชาชีพ
            </span>
            {canEdit && (
              <button
                type="button"
                onClick={openLicensesModal}
                className="text-xs font-bold text-teal-600 hover:underline"
              >
                + เพิ่มใบอนุญาตประกอบวิชาชีพ
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {currentLicenses.map((lic, idx) => {
              const statusInfo = getLicenseStatus(lic);
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3 transition hover:bg-slate-50 hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-teal-700 border border-slate-200 shadow-2xs flex-shrink-0 mt-0.5">
                        <FileBadge className="h-4 w-4 text-teal-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {lic.name}
                        </h4>
                        <div className="text-[11px] font-mono font-bold text-slate-600 mt-0.5">
                          เลขที่: <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">{lic.licenseNumber || "-"}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={clsx(
                        "inline-flex items-center px-2 py-0.5 text-[10px] font-black rounded-lg border flex-shrink-0",
                        statusInfo.style
                      )}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">ผู้ออก: {lic.issuer || "ไม่ระบุหน่วยงาน"}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                      {lic.issueDate && (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>ออกเมื่อ: {new Date(lic.issueDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>
                          หมดอายุ: {lic.isLifetime ? "ตลอดชีพ" : lic.expireDate ? new Date(lic.expireDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "ไม่ระบุ"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {lic.fileUrl && (
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-end">
                      <a
                        href={lic.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-teal-700 hover:bg-teal-50 transition shadow-2xs"
                      >
                        <ExternalLink className="h-3 w-3 text-teal-600" />
                        ดูไฟล์เอกสารหลักฐาน
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= 5. SKILLS & EXPERTISE ================= */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                ทักษะและความเชี่ยวชาญ (Skills & Expertise)
              </h3>
              <p className="text-xs text-slate-400">องค์ความรู้และทักษะเฉพาะทาง</p>
            </div>
          </div>

          {canEdit && (
            <button
              onClick={openSkillsModal}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition active:scale-95"
            >
              <Edit3 className="h-3.5 w-3.5" />
              แก้ไขทักษะ
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {currentSkills.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-1">ยังไม่มีข้อมูลทักษะความเชี่ยวชาญ</p>
          ) : (
            currentSkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200/80 shadow-2xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
              >
                <Sparkles className="h-3 w-3 text-amber-500" />
                {skill}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ================= MODALS (Rendered only if canEdit) ================= */}
      {canEdit && (
        <>
          {/* ================= MODAL 1: BASIC PROFILE & BIO ================= */}
          {activeModal === "basic" && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="w-full max-w-xl rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300 ease-out max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-100 flex-shrink-0 bg-white">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-blue-600" />
                    แก้ไขข้อมูลส่วนตัวและรูปประจำตัว
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveModal("none")}
                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSection("basic", basicForm);
              }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-4">
                {/* Avatar Upload */}
                <ImageUpload
                  value={basicForm.avatarUrl}
                  onChange={(url) => setBasicForm({ ...basicForm, avatarUrl: url || "" })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ชื่อ - นามสกุล <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={basicForm.name}
                      onChange={(e) => setBasicForm({ ...basicForm, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ตำแหน่งงาน
                    </label>
                    <input
                      type="text"
                      value={basicForm.position}
                      onChange={(e) => setBasicForm({ ...basicForm, position: e.target.value })}
                      placeholder="เช่น ครู คศ.2, หัวหน้างานประกันคุณภาพ"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      value={basicForm.phone}
                      onChange={(e) => setBasicForm({ ...basicForm, phone: e.target.value })}
                      placeholder="081-234-5678"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      วันเดือนปีเกิด (วดป. เกิด)
                    </label>
                    <input
                      type="date"
                      value={basicForm.birthDate}
                      onChange={(e) => setBasicForm({ ...basicForm, birthDate: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    คำแนะนำตัว / ปรัชญาการทำงาน (Bio)
                  </label>
                  <textarea
                    rows={3}
                    value={basicForm.bio}
                    onChange={(e) => setBasicForm({ ...basicForm, bio: e.target.value })}
                    placeholder="เขียนแนะนำตัวเอง สรุปความเชี่ยวชาญ หรือคติประจำใจในการทำงาน..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur px-5 sm:px-7 py-3.5 sm:py-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModal("none")}
                  className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-70"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  บันทึกข้อมูลส่วนตัว
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: EDUCATION ================= */}
      {activeModal === "education" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300 ease-out max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-100 flex-shrink-0 bg-white">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                จัดการวุฒิการศึกษา (Education)
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal("none")}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSection("education", { education: educationList });
              }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    เพิ่มวุฒิการศึกษาตามลำดับที่คุณสำเร็จการศึกษา
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setEducationList([
                        ...educationList,
                        { degree: "", major: "", institution: "", year: "" },
                      ])
                    }
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    เพิ่มวุฒิการศึกษา
                  </button>
                </div>

                <div className="space-y-3">
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          วุฒิการศึกษาที่ {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEducationList(educationList.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                            ระดับวุฒิ เช่น ปริญญาตรี / ปวส.
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="ระดับวุฒิ"
                            value={edu.degree}
                            onChange={(e) => {
                              const updated = [...educationList];
                              updated[idx].degree = e.target.value;
                              setEducationList(updated);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                            สาขาวิชา
                          </label>
                          <input
                            type="text"
                            placeholder="สาขาวิชา"
                            value={edu.major}
                            onChange={(e) => {
                              const updated = [...educationList];
                              updated[idx].major = e.target.value;
                              setEducationList(updated);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                            สถาบันการศึกษา / มหาวิทยาลัย
                          </label>
                          <input
                            type="text"
                            placeholder="สถาบันการศึกษา"
                            value={edu.institution}
                            onChange={(e) => {
                              const updated = [...educationList];
                              updated[idx].institution = e.target.value;
                              setEducationList(updated);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                            ปี พ.ศ. ที่สำเร็จ
                          </label>
                          <input
                            type="text"
                            placeholder="เช่น 2562"
                            value={edu.year || ""}
                            onChange={(e) => {
                              const updated = [...educationList];
                              updated[idx].year = e.target.value;
                              setEducationList(updated);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur px-5 sm:px-7 py-3.5 sm:py-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModal("none")}
                  className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-70"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  บันทึกวุฒิการศึกษา
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: WORK HISTORY ================= */}
      {activeModal === "workHistory" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300 ease-out max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-100 flex-shrink-0 bg-white">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-600" />
                จัดการประวัติการทำงาน & ผลงาน
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal("none")}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSection("workHistory", { workHistory: workHistoryList });
              }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    เพิ่มประวัติการทำงานหรือตำแหน่งหน้าที่
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setWorkHistoryList([
                        ...workHistoryList,
                        { role: "", organization: "", period: "" },
                      ])
                    }
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    เพิ่มประวัติการทำงาน
                  </button>
                </div>

                <div className="space-y-3">
                  {workHistoryList.map((work, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          ประวัติที่ {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setWorkHistoryList(workHistoryList.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-1">
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                            ตำแหน่งงาน / หน้าที่
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="ตำแหน่ง"
                            value={work.role}
                            onChange={(e) => {
                              const updated = [...workHistoryList];
                              updated[idx].role = e.target.value;
                              setWorkHistoryList(updated);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-1">
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                            หน่วยงาน / สถานศึกษา
                          </label>
                          <input
                            type="text"
                            placeholder="หน่วยงาน"
                            value={work.organization}
                            onChange={(e) => {
                              const updated = [...workHistoryList];
                              updated[idx].organization = e.target.value;
                              setWorkHistoryList(updated);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-1">
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                            ช่วงเวลา (พ.ศ.)
                          </label>
                          <input
                            type="text"
                            placeholder="เช่น 2564 - ปัจจุบัน"
                            value={work.period}
                            onChange={(e) => {
                              const updated = [...workHistoryList];
                              updated[idx].period = e.target.value;
                              setWorkHistoryList(updated);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur px-5 sm:px-7 py-3.5 sm:py-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModal("none")}
                  className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-95 disabled:opacity-70"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  บันทึกประวัติการทำงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: SKILLS ================= */}
      {activeModal === "skills" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300 ease-out max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-100 flex-shrink-0 bg-white">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                จัดการทักษะและความเชี่ยวชาญ (Skills)
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal("none")}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSection("skills", { skills: skillsList });
              }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    พิมพ์ทักษะที่ต้องการเพิ่ม
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (skillInput.trim() && !skillsList.includes(skillInput.trim())) {
                            setSkillsList([...skillsList, skillInput.trim()]);
                            setSkillInput("");
                          }
                        }
                      }}
                      placeholder="เช่น การประเมิน SAR, การจัดการเรียนรู้เชิงรุก"
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (skillInput.trim() && !skillsList.includes(skillInput.trim())) {
                          setSkillsList([...skillsList, skillInput.trim()]);
                          setSkillInput("");
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                    >
                      เพิ่มทักษะ
                    </button>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-bold text-slate-700 mb-2">
                    ทักษะปัจจุบัน ({skillsList.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {skillsList.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shadow-2xs"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => setSkillsList(skillsList.filter((s) => s !== skill))}
                          className="hover:text-rose-600 transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur px-5 sm:px-7 py-3.5 sm:py-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModal("none")}
                  className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition hover:bg-amber-700 active:scale-95 disabled:opacity-70"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  บันทึกทักษะ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LICENSES & CERTIFICATIONS ================= */}
      {activeModal === "licenses" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300 ease-out max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-100 flex-shrink-0 bg-white">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileBadge className="h-5 w-5 text-teal-600" />
                จัดการข้อมูลใบอนุญาตประกอบวิชาชีพ
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal("none")}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSection("licenses", { licenses: licensesList });
              }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    ระบุข้อมูลใบประกอบวิชาชีพครู, ผู้บริหาร หรือใบรับรองเฉพาะทาง
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setLicensesList([
                        ...licensesList,
                        {
                          name: "ใบอนุญาตประกอบวิชาชีพครู",
                          licenseNumber: "",
                          issuer: "สำนักงานเลขาธิการคุรุสภา",
                          issueDate: "",
                          expireDate: "",
                          isLifetime: false,
                          fileUrl: "",
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 transition active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    เพิ่มใบอนุญาตใหม่
                  </button>
                </div>

                {licensesList.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400">ยังไม่มีรายการใบอนุญาตประกอบวิชาชีพ คลิกปุ่มด้านบนเพื่อเพิ่ม</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {licensesList.map((lic, idx) => (
                      <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <FileBadge className="h-4 w-4 text-teal-600" />
                            ใบอนุญาตประกอบวิชาชีพที่ {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setLicensesList(licensesList.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition"
                            title="ลบรายการนี้"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="text-slate-400 text-[10px]">ตัวเลือกด่วน:</span>
                          {[
                            "ใบอนุญาตประกอบวิชาชีพครู",
                            "ใบอนุญาตประกอบวิชาชีพผู้บริหารสถานศึกษา",
                            "ใบอนุญาตประกอบวิชาชีพช่างไฟฟ้า",
                            "ใบอนุญาตประกอบวิชาชีพวิศวกรรมควบคุม (กว.)",
                          ].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                const updated = [...licensesList];
                                updated[idx].name = preset;
                                if (preset.includes("คุรุสภา") || preset.includes("ครู") || preset.includes("ผู้บริหาร")) {
                                  updated[idx].issuer = "สำนักงานเลขาธิการคุรุสภา";
                                } else if (preset.includes("วิศวกรรม") || preset.includes("กว.")) {
                                  updated[idx].issuer = "สภาวิศวกร";
                                }
                                setLicensesList(updated);
                              }}
                              className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-700 transition text-[10px]"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              ชื่อใบอนุญาต / ใบรับรอง <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="เช่น ใบอนุญาตประกอบวิชาชีพครู"
                              value={lic.name}
                              onChange={(e) => {
                                const updated = [...licensesList];
                                updated[idx].name = e.target.value;
                                setLicensesList(updated);
                              }}
                              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              เลขที่ใบอนุญาต <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="เช่น 6410900012345"
                              value={lic.licenseNumber}
                              onChange={(e) => {
                                const updated = [...licensesList];
                                updated[idx].licenseNumber = e.target.value;
                                setLicensesList(updated);
                              }}
                              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 font-mono focus:border-teal-500 focus:outline-none"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              หน่วยงาน / องค์กรผู้ออกใบอนุญาต
                            </label>
                            <input
                              type="text"
                              placeholder="เช่น สำนักงานเลขาธิการคุรุสภา, สภาวิศวกร"
                              value={lic.issuer}
                              onChange={(e) => {
                                const updated = [...licensesList];
                                updated[idx].issuer = e.target.value;
                                setLicensesList(updated);
                              }}
                              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              วันที่ออกใบอนุญาต (วดป.)
                            </label>
                            <input
                              type="date"
                              value={lic.issueDate ? lic.issueDate.split("T")[0] : ""}
                              onChange={(e) => {
                                const updated = [...licensesList];
                                updated[idx].issueDate = e.target.value;
                                setLicensesList(updated);
                              }}
                              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-semibold text-slate-600">
                                วันหมดอายุ (วดป.)
                              </label>
                              <label className="flex items-center gap-1.5 text-[11px] text-indigo-700 font-bold cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={Boolean(lic.isLifetime)}
                                  onChange={(e) => {
                                    const updated = [...licensesList];
                                    updated[idx].isLifetime = e.target.checked;
                                    if (e.target.checked) updated[idx].expireDate = "";
                                    setLicensesList(updated);
                                  }}
                                  className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                ตลอดชีพ
                              </label>
                            </div>
                            <input
                              type="date"
                              disabled={Boolean(lic.isLifetime)}
                              value={lic.expireDate ? lic.expireDate.split("T")[0] : ""}
                              onChange={(e) => {
                                const updated = [...licensesList];
                                updated[idx].expireDate = e.target.value;
                                setLicensesList(updated);
                              }}
                              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                            />
                          </div>

                          <div className="sm:col-span-2 pt-2 border-t border-slate-200/60">
                            <span className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                              แนบไฟล์ภาพถ่ายหรือเอกสารใบประกอบวิชาชีพ
                            </span>
                            <ImageUpload
                              value={lic.fileUrl}
                              onChange={(url) => {
                                const updated = [...licensesList];
                                updated[idx].fileUrl = url || "";
                                setLicensesList(updated);
                              }}
                              folder="license-documents"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur px-5 sm:px-7 py-3.5 sm:py-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModal("none")}
                  className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-500/20 transition hover:bg-teal-700 active:scale-95 disabled:opacity-70"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  บันทึกใบอนุญาตประกอบวิชาชีพ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VOCATIONAL & TEACHER LICENSE (ใบอนุญาตคุรุสภา & คุณวุฒิวิชาชีพ) ================= */}
      {activeModal === "teacherLicense" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300 ease-out max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-100 flex-shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                  <Scroll className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    {editingLicenseId ? "แก้ไขข้อมูลใบอนุญาต / คุณวุฒิวิชาชีพ" : "เพิ่มข้อมูลใบอนุญาต / คุณวุฒิวิชาชีพ"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    มาตรฐานวิชาชีพครูและคุณวุฒิเฉพาะทางสายอาชีพ (สอศ. / คุรุสภา / TPQI / DSD)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal("none")}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSection("teacherLicense", {
                  ...teacherLicenseForm,
                  licenseId: editingLicenseId,
                });
              }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-5">
                {/* Category Switcher Tabs (Dynamic from licenseConfigs) */}
                <div className="flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 gap-1 overflow-x-auto">
                  {(() => {
                    const categories = Array.from(new Set(licenseConfigs.map((c) => c.category)));
                    const displayCats = categories.length > 0 ? categories : ["ksp", "vocational"];
                    return displayCats.map((catKey) => {
                      const firstInCat = licenseConfigs.find((c) => c.category === catKey);
                      const label =
                        firstInCat?.categoryLabel ||
                        (catKey === "ksp"
                          ? "ใบอนุญาตคุรุสภา / ผ่อนผัน (KSP)"
                          : catKey === "vocational"
                          ? "คุณวุฒิวิชาชีพ / มาตรฐานฝีมือ (TPQI/DSD/กว.)"
                          : "หมวดหมู่อื่นๆ");
                      const isSelected = teacherLicenseCategory === catKey;

                      return (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => {
                            setTeacherLicenseCategory(catKey);
                            const firstConfig = licenseConfigs.find((c) => c.category === catKey);
                            if (firstConfig) {
                              setTeacherLicenseForm((prev) => ({
                                ...prev,
                                licenseType: firstConfig.code,
                              }));
                            }
                          }}
                          className={clsx(
                            "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap",
                            isSelected
                              ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                              : "text-slate-500 hover:text-slate-800"
                          )}
                        >
                          {catKey === "ksp" ? (
                            <GraduationCap className="h-4 w-4 text-teal-600 flex-shrink-0" />
                          ) : (
                            <Award className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          )}
                          <span>{label}</span>
                        </button>
                      );
                    });
                  })()}
                </div>

                {/* 1. ประเภทใบอนุญาต (Dynamic License Type Cards) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    1. เลือกประเภทเอกสาร / ใบอนุญาต <span className="text-rose-500">*</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {licenseConfigs
                      .filter((c) => c.category === teacherLicenseCategory)
                      .map((opt) => {
                        const isSelected = teacherLicenseForm.licenseType === opt.code;
                        const Icon = getLicenseIcon(opt.icon);
                        return (
                          <button
                            key={opt.code}
                            type="button"
                            onClick={() => {
                              const issue = teacherLicenseForm.issuedDate ? new Date(teacherLicenseForm.issuedDate) : null;
                              let exp = teacherLicenseForm.expiredDate;
                              if (issue && !isNaN(issue.getTime())) {
                                const nextExp = new Date(issue);
                                nextExp.setFullYear(nextExp.getFullYear() + (opt.defaultYears || 5));
                                exp = nextExp.toISOString().split("T")[0];
                              }
                              setTeacherLicenseForm({
                                ...teacherLicenseForm,
                                licenseType: opt.code,
                                expiredDate: exp,
                              });
                            }}
                            className={clsx(
                              "flex items-start gap-3 p-3 rounded-2xl border text-left transition select-none",
                              isSelected
                                ? "bg-teal-50/80 border-teal-500 shadow-xs ring-1 ring-teal-500"
                                : "bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                            )}
                          >
                            <div
                              className={clsx(
                                "flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0 mt-0.5 border",
                                isSelected ? getBadgeStyle(opt.color) : "bg-white text-slate-500 border-slate-200"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={clsx("text-xs font-bold leading-tight", isSelected ? "text-teal-950" : "text-slate-800")}>
                                {opt.title}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {opt.description || `อายุใช้งานเริ่มต้น ${opt.defaultYears} ปี`}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Dynamic Sub-block for Provisional Round */}
                {(() => {
                  const currentConf = licenseConfigs.find((c) => c.code === teacherLicenseForm.licenseType);
                  const isProvisional = currentConf?.requiresProvisionalRound || teacherLicenseForm.licenseType === "KSP_PROVISIONAL";
                  if (!isProvisional) return null;

                  return (
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-amber-700" />
                          ครั้งที่ขอรับการผ่อนผันจากคุรุสภา (Provisional Round) <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] text-amber-700 font-semibold bg-white px-2 py-0.5 rounded border border-amber-200">
                          จำกัดไม่เกิน 3 ครั้ง (ครั้งละ 2 ปี)
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { round: 1, label: "ครั้งที่ 1 (ปีที่ 1-2)", sub: "เริ่มปฏิบัติหน้าที่สอน" },
                          { round: 2, label: "ครั้งที่ 2 (ปีที่ 3-4)", sub: "อยู่ระหว่างพัฒนาวุฒิครู" },
                          { round: 3, label: "ครั้งที่ 3 (ปีที่ 5-6)", sub: "ครั้งสุดท้ายตามระเบียบ" },
                        ].map((r) => {
                          const isSelected = (teacherLicenseForm.provisionalRound || 1) === r.round;
                          return (
                            <button
                              key={r.round}
                              type="button"
                              onClick={() =>
                                setTeacherLicenseForm({
                                  ...teacherLicenseForm,
                                  provisionalRound: r.round,
                                })
                              }
                              className={clsx(
                                "p-2.5 rounded-xl border text-center transition select-none",
                                isSelected
                                  ? r.round === 3
                                    ? "bg-rose-100 border-rose-500 text-rose-900 font-bold ring-1 ring-rose-500"
                                    : "bg-amber-600 text-white font-bold shadow-xs border-amber-600"
                                  : "bg-white border-amber-200 text-slate-700 hover:bg-amber-50/60"
                              )}
                            >
                              <div className="text-xs font-bold">{r.label}</div>
                              <div className={clsx("text-[10px] mt-0.5", isSelected ? (r.round === 3 ? "text-rose-800" : "text-amber-100") : "text-slate-400")}>
                                {r.sub}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {teacherLicenseForm.provisionalRound === 3 && (
                        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-[11px]">
                          <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                          <span>
                            <strong>แจ้งเตือนสำคัญ:</strong> การผ่อนผันครั้งที่ 3 เป็นครั้งสุดท้ายตามข้อบังคับคุรุสภา ครูผู้สอนต้องสำเร็จการศึกษา ป.บัณฑิต หรือผ่านการทดสอบรับรองความรู้เพื่อขอรับใบอนุญาต B-License ก่อนหนังสือผ่อนผันนี้หมดอายุ
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Dynamic Sub-block for Title / Presets */}
                {(() => {
                  const currentConf = licenseConfigs.find((c) => c.code === teacherLicenseForm.licenseType);
                  const showTitleInput =
                    currentConf?.requiresTitle ||
                    ["TPQI_CERTIFICATE", "DSD_STANDARD", "COE_ENGINEER", "OTHER_PROFESSIONAL"].includes(
                      teacherLicenseForm.licenseType
                    );
                  if (!showTitleInput) return null;

                  const titleLabel = currentConf?.titleLabel || "ระบุสาขาวิชาชีพ / ระดับมาตรฐาน / สาขาวิศวกรรม";
                  const titlePlaceholder =
                    currentConf?.titlePlaceholder ||
                    "เช่น สาขาเทคโนโลยีสารสนเทศและการสื่อสาร ระดับ 4 หรือ ช่างซ่อมไมโครคอมพิวเตอร์ ระดับ 2";
                  const presetChips = currentConf?.presetChips || [];

                  return (
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
                      <label className="block text-xs font-bold text-emerald-950">
                        {titleLabel} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder={titlePlaceholder}
                        value={teacherLicenseForm.title || ""}
                        onChange={(e) =>
                          setTeacherLicenseForm({
                            ...teacherLicenseForm,
                            title: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-emerald-300 bg-white p-2.5 text-xs text-slate-900 font-semibold focus:border-emerald-600 focus:outline-none"
                      />

                      {presetChips.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold text-slate-500 block">
                            ตัวเลือกแนะนำสำหรับแผนกวิชา / ช่าง:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {presetChips.map((preset: string) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() =>
                                  setTeacherLicenseForm({
                                    ...teacherLicenseForm,
                                    title: preset,
                                  })
                                }
                                className="px-2.5 py-1 rounded-xl bg-white border border-emerald-200 text-slate-700 text-[11px] font-medium hover:bg-emerald-100/70 hover:border-emerald-300 transition"
                              >
                                + {preset}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 2. ข้อมูลระบุตัวตนและเลขที่เอกสาร */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      2. เลขที่เอกสารและชื่อผู้ถือเอกสาร
                    </label>

                    <label className="flex items-center gap-1.5 text-xs text-blue-700 font-bold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isRenewalPending}
                        onChange={(e) => {
                          setIsRenewalPending(e.target.checked);
                          setTeacherLicenseForm({
                            ...teacherLicenseForm,
                            status: e.target.checked ? "IN_RENEWAL" : "ACTIVE",
                          });
                        }}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>อยู่ระหว่างยื่นคำขอต่ออายุ</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        เลขที่ใบอนุญาต / เลขที่หนังสือรับรอง <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="เช่น 6610900001234 หรือ TPQI-67-1234"
                        value={teacherLicenseForm.licenseNumber}
                        onChange={(e) =>
                          setTeacherLicenseForm({
                            ...teacherLicenseForm,
                            licenseNumber: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        ชื่อ-นามสกุลภาษาไทย (ตามหน้าบัตร)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น นายสมชาย ใจดี"
                        value={teacherLicenseForm.nameTh || ""}
                        onChange={(e) =>
                          setTeacherLicenseForm({
                            ...teacherLicenseForm,
                            nameTh: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        ชื่อ-นามสกุลภาษาอังกฤษ (ถ้ามี)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น MR. SOMCHAI JAIDEE"
                        value={teacherLicenseForm.nameEn || ""}
                        onChange={(e) =>
                          setTeacherLicenseForm({
                            ...teacherLicenseForm,
                            nameEn: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs uppercase font-mono text-slate-900 focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. ช่วงเวลาความถูกต้องและการหมดอายุ */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800">
                    3. ช่วงเวลาความถูกต้องและการหมดอายุ (Validity & Expiration)
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        วันที่ออกบัตร / วันที่ได้รับหนังสือรับรอง (Issue Date) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={teacherLicenseForm.issuedDate}
                        onChange={(e) => {
                          const newIssue = e.target.value;
                          let newExp = teacherLicenseForm.expiredDate;
                          if (newIssue) {
                            const issueDt = new Date(newIssue);
                            if (!isNaN(issueDt.getTime())) {
                              const type = teacherLicenseForm.licenseType;
                              const years =
                                type === "KSP_A_LICENSE"
                                  ? 7
                                  : type === "KSP_B_LICENSE" || type === "DSD_STANDARD" || type === "COE_ENGINEER"
                                  ? 5
                                  : type === "TPQI_CERTIFICATE" || type === "OTHER_PROFESSIONAL"
                                  ? 3
                                  : 2;
                              const expDt = new Date(issueDt);
                              expDt.setFullYear(expDt.getFullYear() + years);
                              newExp = expDt.toISOString().split("T")[0];
                            }
                          }
                          setTeacherLicenseForm({
                            ...teacherLicenseForm,
                            issuedDate: newIssue,
                            expiredDate: newExp,
                          });
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        วันหมดอายุ (Expiry Date) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={teacherLicenseForm.expiredDate}
                        onChange={(e) =>
                          setTeacherLicenseForm({
                            ...teacherLicenseForm,
                            expiredDate: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. เอกสารหลักฐานเชิงประจักษ์ (Evidence Attachments) */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      4. เอกสารหลักฐานเชิงประจักษ์ (PDF หรือสแกนหน้าบัตร)
                    </label>
                    <a
                      href="https://ksp-selfservice.ksp.or.th"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-teal-700 hover:underline flex items-center gap-1 font-medium"
                    >
                      ระบบ KSP Self-Service
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <DocumentUpload
                    value={teacherLicenseForm.attachmentKey}
                    fileName={teacherLicenseForm.attachmentName}
                    onChange={(url, origName) => {
                      setTeacherLicenseForm({
                        ...teacherLicenseForm,
                        attachmentKey: url || "",
                        attachmentName: origName || "",
                      });
                    }}
                    folder="teacher-licenses"
                    label="สแกนหน้า-หลัง บัตรใบอนุญาต หรือไฟล์ PDF หนังสือรับรองจากคุรุสภา / TPQI / กรมพัฒนาฝีมือแรงงาน"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur px-5 sm:px-7 py-3.5 sm:py-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModal("none")}
                  className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-500/20 transition hover:bg-teal-700 active:scale-95 disabled:opacity-70"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingLicenseId ? "บันทึกการแก้ไข" : "บันทึกข้อมูลใบอนุญาต/คุณวุฒิ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: CHANGE PASSWORD ================= */}
      {activeModal === "password" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300 ease-out max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-100 flex-shrink-0 bg-white">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                {isSelf ? "เปลี่ยนรหัสผ่านเข้าสู่ระบบ" : `ตั้งรหัสผ่านใหม่ให้ ${user.name}`}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal("none")}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (passwordForm.password !== passwordForm.confirmPassword) {
                  alert("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
                  return;
                }
                handleSaveSection("password", { password: passwordForm.password });
              }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    รหัสผ่านใหม่ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                    placeholder="ความยาวอย่างน้อย 6 ตัวอักษร"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ยืนยันรหัสผ่านใหม่ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur px-5 sm:px-7 py-3.5 sm:py-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModal("none")}
                  className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-70"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  เปลี่ยนรหัสผ่าน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )}
</div>
);
}
