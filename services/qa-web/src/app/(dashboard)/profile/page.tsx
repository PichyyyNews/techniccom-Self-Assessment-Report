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
  Layers,
  MapPin,
  FileText,
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

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    position: string;
    phone: string;
    birthDate: string;
    avatarUrl: string;
    bio: string;
    skills: string[];
    skillInput: string;
    education: EducationItem[];
    workHistory: WorkHistoryItem[];
    password: string;
  }>({
    name: "",
    position: "",
    phone: "",
    birthDate: "",
    avatarUrl: "",
    bio: "",
    skills: [],
    skillInput: "",
    education: [],
    workHistory: [],
    password: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
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

  const openEditModal = () => {
    if (!user) return;
    setFormData({
      name: user.name || "",
      position: user.position || "",
      phone: user.phone || "",
      birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split("T")[0] : "",
      avatarUrl: user.avatarUrl || "",
      bio: user.bio || "",
      skills: user.skills || [],
      skillInput: "",
      education: (user.education as EducationItem[]) || [
        { degree: "ปริญญาตรี", major: "ครุศาสตร์อุตสาหกรรม", institution: "มหาวิทยาลัยเทคโนโลยี", year: "2562" },
      ],
      workHistory: (user.workHistory as WorkHistoryItem[]) || [
        { role: "หัวหน้างานประกันคุณภาพ", organization: "วิทยาลัยเทคนิค", period: "2564 - ปัจจุบัน" },
      ],
      password: "",
    });
    setShowEditModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          position: formData.position,
          phone: formData.phone,
          birthDate: formData.birthDate,
          avatarUrl: formData.avatarUrl,
          bio: formData.bio,
          skills: formData.skills,
          education: formData.education,
          workHistory: formData.workHistory,
          password: formData.password || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "เกิดข้อผิดพลาดในการบันทึกโปรไฟล์");
        return;
      }

      setShowEditModal(false);
      fetchProfile();
      if (updateSession) updateSession();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  };

  // Skill Tags Management
  const addSkill = () => {
    if (!formData.skillInput.trim()) return;
    if (formData.skills.includes(formData.skillInput.trim())) return;
    setFormData({
      ...formData,
      skills: [...formData.skills, formData.skillInput.trim()],
      skillInput: "",
    });
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  // Education item helpers
  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        { degree: "", major: "", institution: "", year: "" },
      ],
    });
  };

  const updateEducation = (index: number, field: keyof EducationItem, val: string) => {
    const updated = [...formData.education];
    updated[index] = { ...updated[index], [field]: val };
    setFormData({ ...formData, education: updated });
  };

  const removeEducation = (index: number) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index),
    });
  };

  // Work history helpers
  const addWorkHistory = () => {
    setFormData({
      ...formData,
      workHistory: [
        ...formData.workHistory,
        { role: "", organization: "", period: "" },
      ],
    });
  };

  const updateWorkHistory = (index: number, field: keyof WorkHistoryItem, val: string) => {
    const updated = [...formData.workHistory];
    updated[index] = { ...updated[index], [field]: val };
    setFormData({ ...formData, workHistory: updated });
  };

  const removeWorkHistory = (index: number) => {
    setFormData({
      ...formData,
      workHistory: formData.workHistory.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-14 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
        <span className="text-sm font-medium">กำลังโหลดข้อมูลโปรไฟล์...</span>
      </div>
    );
  }

  const educationList: EducationItem[] = (user?.education as EducationItem[]) || [
    { degree: "ปริญญาตรี", major: "ครุศาสตร์อุตสาหการ / คอมพิวเตอร์ธุรกิจ", institution: "มหาวิทยาลัยเทคโนโลยี", year: "2562" },
  ];

  const workHistoryList: WorkHistoryItem[] = (user?.workHistory as WorkHistoryItem[]) || [
    { role: user?.position || "บุคลากรประจำสถานศึกษา", organization: "วิทยาลัยเทคนิค", period: "2564 - ปัจจุบัน" },
  ];

  const skillsList: string[] = user?.skills && user.skills.length > 0 ? user.skills : [
    "การประกันคุณภาพการศึกษา (SAR)",
    "การจัดการเรียนการสอนอาชีวศึกษา",
    "เทคโนโลยีสารสนเทศ",
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* ================= 1. SOCIAL PROFILE HEADER BANNER ================= */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        {/* Cover Graphic Banner */}
        <div className="h-36 sm:h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 relative" />

        {/* Profile Identity Bar */}
        <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            {/* Avatar & Main Titles */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              <div className="relative group">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-28 w-28 sm:h-36 sm:w-36 rounded-3xl object-cover border-4 border-white shadow-xl shadow-slate-900/10 bg-white"
                  />
                ) : (
                  <div className="flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-4xl border-4 border-white shadow-xl shadow-slate-900/10">
                    {user?.name ? user.name.charAt(0) : "U"}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {user?.name}
                  </h1>
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black border",
                      getBadgeStyle(roleColor)
                    )}
                  >
                    {isRoot && <Shield className="h-3 w-3" />}
                    {roleTitle}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  {user?.position || "บุคลากรวิทยาลัย"}
                </p>

                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button
              onClick={openEditModal}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 active:scale-95 flex-shrink-0"
            >
              <Edit3 className="h-4 w-4" />
              แก้ไขโปรไฟล์ของฉัน
            </button>
          </div>

          {/* Social Bio / About */}
          <div className="mt-6 pt-5 border-t border-slate-100/90 text-sm text-slate-600 leading-relaxed">
            {user?.bio ? (
              <p className="whitespace-pre-line">{user.bio}</p>
            ) : (
              <p className="text-slate-400 italic text-xs">
                ยังไม่มีคำแนะนำตัว... คลิก "แก้ไขโปรไฟล์ของฉัน" เพื่อเพิ่มปรัชญาการทำงานและประวัติโดยย่อ
              </p>
            )}
          </div>

          {/* Key Facts Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
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

            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">สถานะบัญชีปกติ</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. GITHUB-STYLE CONTRIBUTION ACTIVITY GRAPH ================= */}
      <ContributionGraph />

      {/* ================= 3. TWO-COLUMN DETAILS (EDUCATION & WORK HISTORY) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Educational Qualifications (วุฒิการศึกษา) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  วุฒิการศึกษา (Education)
                </h3>
                <p className="text-xs text-slate-400">ประวัติการศึกษาและคุณวุฒิ</p>
              </div>
            </div>

            <button
              onClick={openEditModal}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Edit3 className="h-3.5 w-3.5" />
              แก้ไข
            </button>
          </div>

          <div className="space-y-3.5">
            {educationList.map((edu, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 transition hover:bg-slate-50"
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
                      <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        พ.ศ. {edu.year}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {edu.institution || "สถานศึกษา"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Work History & Experience (ประวัติการทำงาน) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ประวัติการทำงาน & ผลงาน (Experience)
                </h3>
                <p className="text-xs text-slate-400">หน้าที่ความรับผิดชอบและผลงาน</p>
              </div>
            </div>

            <button
              onClick={openEditModal}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Edit3 className="h-3.5 w-3.5" />
              แก้ไข
            </button>
          </div>

          <div className="space-y-3.5">
            {workHistoryList.map((work, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 transition hover:bg-slate-50"
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
                      <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {work.period}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {work.organization || "หน่วยงาน"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= 4. SKILLS & EXPERTISE ================= */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ทักษะและความเชี่ยวชาญ (Skills & Expertise)
              </h3>
              <p className="text-xs text-slate-400">องค์ความรู้และทักษะเฉพาะทาง</p>
            </div>
          </div>

          <button
            onClick={openEditModal}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Edit3 className="h-3.5 w-3.5" />
            จัดการทักษะ
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {skillsList.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200/80 shadow-2xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
            >
              <Sparkles className="h-3 w-3 text-amber-500" />
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* ================= MODAL: EDIT COMPLETE PROFILE ================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300 ease-out max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            {/* Sticky Header */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-100 flex-shrink-0 bg-white">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-blue-600" />
                แก้ไขข้อมูลโปรไฟล์ของฉัน
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-5">
                {/* 1. Profile Photo Upload */}
                <div>
                  <ImageUpload
                    value={formData.avatarUrl}
                    onChange={(url) => setFormData({ ...formData, avatarUrl: url || "" })}
                  />
                </div>

                {/* 2. Personal Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ชื่อ - นามสกุล <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ตำแหน่งงาน
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="เช่น ครู คศ.3, หัวหน้างานประกันคุณภาพ"
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
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                    />
                  </div>
                </div>

                {/* 3. Social Bio */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    คำแนะนำตัว / ปรัชญาการทำงาน (Bio)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="เขียนแนะนำตัวเอง สรุปความเชี่ยวชาญ หรือคติประจำใจ..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                  />
                </div>

                {/* 4. Education Manager */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                      วุฒิการศึกษา (Education)
                    </label>
                    <button
                      type="button"
                      onClick={addEducation}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      เพิ่มวุฒิการศึกษา
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {formData.education.map((edu, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-500">
                            วุฒิการศึกษาที่ {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeEducation(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="ระดับวุฒิ เช่น ปริญญาตรี"
                            value={edu.degree}
                            onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="สาขาวิชา"
                            value={edu.major}
                            onChange={(e) => updateEducation(idx, "major", e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="สถานศึกษา / มหาวิทยาลัย"
                            value={edu.institution}
                            onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="ปีที่สำเร็จ (พ.ศ.)"
                            value={edu.year || ""}
                            onChange={(e) => updateEducation(idx, "year", e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Work Experience Manager */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-indigo-600" />
                      ประวัติการทำงาน / ผลงาน (Work Experience)
                    </label>
                    <button
                      type="button"
                      onClick={addWorkHistory}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      เพิ่มประวัติการทำงาน
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {formData.workHistory.map((work, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-500">
                            ประวัติที่ {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeWorkHistory(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="ตำแหน่งงาน / หน้าที่"
                            value={work.role}
                            onChange={(e) => updateWorkHistory(idx, "role", e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="หน่วยงาน / สถานศึกษา"
                            value={work.organization}
                            onChange={(e) => updateWorkHistory(idx, "organization", e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="ช่วงเวลา เช่น 2564 - ปัจจุบัน"
                            value={work.period}
                            onChange={(e) => updateWorkHistory(idx, "period", e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Skills Management */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700">
                    ทักษะและความเชี่ยวชาญ (Skills)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.skillInput}
                      onChange={(e) => setFormData({ ...formData, skillInput: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="พิมพ์ทักษะแล้วกดเพิ่ม เช่น การประเมิน SAR, วิจัยในชั้นเรียน"
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
                    >
                      เพิ่มทักษะ
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-rose-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 7. Change Password */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    เปลี่ยนรหัสผ่าน (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                  />
                </div>
              </div>

              {/* Sticky Bottom Actions */}
              <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur px-5 sm:px-7 py-3.5 sm:py-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-70"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  บันทึกโปรไฟล์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
