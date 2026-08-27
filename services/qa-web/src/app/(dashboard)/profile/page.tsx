"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
} from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ContributionGraph } from "@/components/profile/ContributionGraph";
import { clsx } from "clsx";

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
  skills?: string[];
  isActive: boolean;
  createdAt: string;
}

type ModalType = "none" | "basic" | "education" | "workHistory" | "skills" | "password";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [contributionMap, setContributionMap] = useState<Record<string, number>>({});
  const [totalContributions, setTotalContributions] = useState(0);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setContributionMap(data.contributionMap || {});
        setTotalContributions(data.totalContributions || 0);
        setRecentActivities(data.recentActivities || []);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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

  const openPasswordModal = () => {
    setPasswordForm({ password: "", confirmPassword: "" });
    setActiveModal("password");
  };

  // Submit Handler for Modular Modals
  const handleSaveSection = async (section: ModalType, payload: any) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/profile", {
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
      if (updateSession) updateSession();
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

  const currentEducation: EducationItem[] = (user?.education as EducationItem[]) || [
    { degree: "ปริญญาตรี", major: "ครุศาสตร์อุตสาหกรรม / คอมพิวเตอร์ธุรกิจ", institution: "มหาวิทยาลัยเทคโนโลยี", year: "2562" },
  ];

  const currentWorkHistory: WorkHistoryItem[] = (user?.workHistory as WorkHistoryItem[]) || [
    { role: user?.position || "บุคลากรประจำสถานศึกษา", organization: "วิทยาลัยเทคนิค", period: "2564 - ปัจจุบัน" },
  ];

  const currentSkills: string[] = user?.skills && user.skills.length > 0 ? user.skills : [
    "การประกันคุณภาพการศึกษา (SAR)",
    "การจัดการเรียนการสอนอาชีวศึกษา",
    "เทคโนโลยีสารสนเทศ",
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-3.5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
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
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-28 w-28 sm:h-36 sm:w-36 rounded-3xl object-cover border-4 border-white shadow-xl shadow-slate-900/10 bg-white"
                />
              ) : (
                <div className="flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-3xl sm:text-4xl border-4 border-white shadow-xl shadow-slate-900/10">
                  {user?.name ? user.name.charAt(0) : "U"}
                </div>
              )}
              <button
                type="button"
                onClick={openBasicModal}
                className="absolute bottom-1 right-1 p-2 rounded-xl bg-slate-900 text-white shadow-md hover:bg-slate-800 transition active:scale-95"
                title="เปลี่ยนรูปประจำตัว"
              >
                <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
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
                  ยังไม่มีคำแนะนำตัว... คลิกเพื่อเพิ่มคติประจำใจหรือประวัติโดยย่อ
                </span>
                <button
                  onClick={openBasicModal}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  + เพิ่มคำแนะนำตัว
                </button>
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
              <span className="font-semibold">สถานะบัญชีปกติ</span>
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

      {/* ================= 3. TWO-COLUMN DETAILS (EDUCATION & WORK HISTORY) ================= */}
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

            <button
              onClick={openEducationModal}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition active:scale-95"
            >
              <Edit3 className="h-3.5 w-3.5" />
              แก้ไขวุฒิ
            </button>
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

            <button
              onClick={openWorkHistoryModal}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition active:scale-95"
            >
              <Edit3 className="h-3.5 w-3.5" />
              แก้ไขประวัติ
            </button>
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

      {/* ================= 4. SKILLS & EXPERTISE ================= */}
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

          <button
            onClick={openSkillsModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition active:scale-95"
          >
            <Edit3 className="h-3.5 w-3.5" />
            แก้ไขทักษะ
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {currentSkills.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200/80 shadow-2xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
            >
              <Sparkles className="h-3 w-3 text-amber-500" />
              {skill}
            </span>
          ))}
        </div>
      </div>

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

      {/* ================= MODAL 5: CHANGE PASSWORD ================= */}
      {activeModal === "password" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300 ease-out max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-100 flex-shrink-0 bg-white">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                เปลี่ยนรหัสผ่านเข้าสู่ระบบ
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
    </div>
  );
}
