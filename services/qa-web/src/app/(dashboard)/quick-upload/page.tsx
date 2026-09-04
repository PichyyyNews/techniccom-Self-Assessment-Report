"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Zap,
  BookOpen,
  Award,
  Camera,
  Mic,
  Lightbulb,
  Palette,
  FileBadge,
  FolderArchive,
  UploadCloud,
  X,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  Sparkles,
  Loader2,
  ExternalLink,
  MapPin,
  Building2,
  Video,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useAcademicYear } from "@/components/layout/AcademicYearContext";

interface UploadCard {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge: string;
  linkedUrl: string;
  linkedTitle: string;
  isMediaRich?: boolean;
}

const UPLOAD_CARDS: UploadCard[] = [
  {
    id: "lesson_plan",
    category: "lesson_plan",
    title: "แผนการจัดการเรียนรู้",
    subtitle: "มุ่งเน้นสมรรถนะอาชีพ",
    description: "บันทึกและจัดเก็บแผนการสอน, บันทึกหลังสอน, และเกณฑ์การวัดประเมินผล",
    icon: BookOpen,
    color: "from-blue-600 to-indigo-700",
    badge: "เกณฑ์ SAR มฐ.2",
    linkedUrl: "/teachers/lesson-plans",
    linkedTitle: "หน้าแผนการสอน",
  },
  {
    id: "training_cert",
    category: "training_cert",
    title: "วุฒิบัตร / เกียรติบัตร",
    subtitle: "การพัฒนาวิชาชีพ & PLC",
    description: "ใบรับรองการผ่านการฝึกอบรม สัมมนาเชิงปฏิบัติการ นับชั่วโมงวิทยฐานะ",
    icon: Award,
    color: "from-emerald-600 to-teal-700",
    badge: "เกณฑ์ SAR มฐ.2",
    linkedUrl: "/teachers/trainings",
    linkedTitle: "หน้าการพัฒนาวิชาชีพ",
  },
  {
    id: "training_photo",
    category: "training_photo",
    title: "ภาพกิจกรรมอบรม / ดูงาน",
    subtitle: "ไปที่ไหน ทำอะไร เก็บภาพ/คลิป",
    description: "บันทึกภาพถ่ายการเข้าร่วมกิจกรรม ศึกษาดูงานสถานประกอบการ",
    icon: Camera,
    color: "from-cyan-600 to-blue-700",
    badge: "ภาพกิจกรรม",
    linkedUrl: "/teachers/trainings",
    linkedTitle: "หน้าการพัฒนาวิชาชีพ",
    isMediaRich: true,
  },
  {
    id: "speaker_activity",
    category: "speaker_activity",
    title: "การเป็นวิทยากร & บริการวิชาชีพ",
    subtitle: "หนังสือเชิญ & ภาพบรรยาย",
    description: "บันทึกการทำหน้าที่วิทยากรบรรยาย ให้ความรู้แก่ชุมชนและสถานประกอบการ",
    icon: Mic,
    color: "from-purple-600 to-indigo-700",
    badge: "บริการวิชาการ",
    linkedUrl: "/teachers/trainings",
    linkedTitle: "หน้าการพัฒนาวิชาชีพ",
    isMediaRich: true,
  },
  {
    id: "research",
    category: "research",
    title: "งานวิจัย & สิ่งประดิษฐ์",
    subtitle: "นวัตกรรม & สื่อการสอน",
    description: "รายงานวิจัยในชั้นเรียน, เอกสารสิ่งประดิษฐ์คนรุ่นใหม่, และสิทธิบัตร",
    icon: Lightbulb,
    color: "from-amber-500 to-orange-600",
    badge: "เกณฑ์ SAR มฐ.3",
    linkedUrl: "/teachers/researches",
    linkedTitle: "หน้างานวิจัย & นวัตกรรม",
  },
  {
    id: "student_work",
    category: "student_work",
    title: "ชิ้นงาน & ผลงานนักศึกษา",
    subtitle: "หลักฐานสมรรถนะผู้เรียน",
    description: "ร่องรอยผลงานนักเรียน, ชิ้นงานโครงงาน, รางวัลการแข่งขันทักษะวิชาชีพ",
    icon: Palette,
    color: "from-rose-500 to-pink-600",
    badge: "เกณฑ์ SAR มฐ.1",
    linkedUrl: "/students/competencies",
    linkedTitle: "หน้าสมรรถนะนักเรียน",
    isMediaRich: true,
  },
  {
    id: "license",
    category: "license",
    title: "ใบอนุญาต & คุณวุฒิ",
    subtitle: "คุรุสภา / TPQI / DSD / กว.",
    description: "สแกนบัตรหรือเอกสารใบรับรองมาตรฐานวิชาชีพ และหนังสือผ่อนผัน",
    icon: FileBadge,
    color: "from-teal-600 to-emerald-800",
    badge: "มาตรฐานวิชาชีพ",
    linkedUrl: "/profile",
    linkedTitle: "หน้าโปรไฟล์ & ใบประกอบ",
  },
  {
    id: "other",
    category: "other",
    title: "ประกันคุณภาพ & โครงการ",
    subtitle: "เอกสารร่องรอย SAR ทั่วไป",
    description: "คำสั่งแต่งตั้ง, รายงานผลการดำเนินงานโครงการ และเอกสารหลักฐานอื่นๆ",
    icon: FolderArchive,
    color: "from-slate-700 to-slate-900",
    badge: "SAR หลักฐาน",
    linkedUrl: "/stock",
    linkedTitle: "หน้าคลังไฟล์หลักฐาน",
  },
];

export default function QuickUploadPage() {
  const { selectedYear, selectedSemester, termLabel, availableYears, availableSemesters } =
    useAcademicYear();

  const [activeModalCard, setActiveModalCard] = useState<UploadCard | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [organization, setOrganization] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [externalVideoUrl, setExternalVideoUrl] = useState("");
  const [uploadYear, setUploadYear] = useState(selectedYear);
  const [uploadSemester, setUploadSemester] = useState(selectedSemester);

  // Upload status
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openUploadModal = (card: UploadCard, file?: File) => {
    setActiveModalCard(card);
    setUploadYear(selectedYear);
    setUploadSemester(selectedSemester);
    setTitle(file ? file.name.replace(/\.[^/.]+$/, "") : "");
    setDescription("");
    setLocation("");
    setOrganization("");
    setEventDate(new Date().toISOString().split("T")[0]);
    setSubjectCode("");
    setGradeLevel("");
    setExternalVideoUrl("");
    setErrorMessage("");
    setUploadSuccess(null);

    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    } else {
      setSelectedFile(null);
      setFilePreview(null);
    }
  };

  const handleCardDragOver = (e: React.DragEvent, cardId: string) => {
    e.preventDefault();
    setDragOverCardId(cardId);
  };

  const handleCardDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCardId(null);
  };

  const handleCardDrop = (e: React.DragEvent, card: UploadCard) => {
    e.preventDefault();
    setDragOverCardId(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      openUploadModal(card, file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("กรุณาระบุชื่อเอกสารหรือหัวข้อหลักฐาน");
      return;
    }
    if (!selectedFile && !externalVideoUrl.trim()) {
      setErrorMessage("กรุณาเลือกไฟล์เอกสาร/รูปภาพ หรือระบุลิงก์วิดีโอ");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      formData.append("title", title.trim());
      if (description.trim()) formData.append("description", description.trim());
      formData.append("category", activeModalCard?.category || "other");
      formData.append("academicYear", uploadYear);
      formData.append("semester", uploadSemester);
      if (location.trim()) formData.append("location", location.trim());
      if (organization.trim()) formData.append("organization", organization.trim());
      if (eventDate) formData.append("eventDate", eventDate);
      if (subjectCode.trim()) formData.append("subjectCode", subjectCode.trim());
      if (gradeLevel.trim()) formData.append("gradeLevel", gradeLevel.trim());
      if (externalVideoUrl.trim()) formData.append("externalVideoUrl", externalVideoUrl.trim());

      const res = await fetch("/api/evidence/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการอัปโหลด");
      }

      setUploadSuccess(data.data);
    } catch (err: any) {
      setErrorMessage(err.message || "เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Top Breadcrumb with Unified Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/stock"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 text-xs font-bold transition shadow-2xs group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>← ไปยังคลังไฟล์หลักฐาน (File Stock)</span>
        </Link>

        {/* Term Badge Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-xs text-blue-800 font-bold">
          <Calendar className="h-3.5 w-3.5 text-blue-600" />
          <span>รอบข้อมูลปัจจุบัน: {termLabel}</span>
        </div>
      </div>

      {/* 2. Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-slate-200">
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-bold text-blue-200">
            <Zap className="h-3.5 w-3.5 text-amber-300" />
            Quick Upload Launcher • ลากวางกระจายไฟล์สู่อัตโนมัติ
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            ทางลัดอัปโหลดด่วน (Quick Upload Grid)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            เลือกหมวดหมู่ที่ต้องการ หรือลากไฟล์มาวางบนการ์ดได้ทันที
            ระบบจะส่งไฟล์เข้า MinIO S3 บันทึกลงคลัง Stock กลาง
            และเชื่อมโยงไปจัดหมวดหมู่ในหน้าย่อยและโปรไฟล์ครูให้อัตโนมัติ
          </p>
        </div>

        {/* Decorative graphic */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* 3. Interactive App Grid Cards (Like Mobile App Launcher) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            เลือกหมวดหมู่เพื่ออัปโหลด (คลิก หรือลากไฟล์วางบนการ์ด)
          </h2>
          <span className="text-xs text-slate-400 font-medium">8 หมวดหมู่หลัก</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {UPLOAD_CARDS.map((card) => {
            const Icon = card.icon;
            const isDragOver = dragOverCardId === card.id;

            return (
              <div
                key={card.id}
                onDragOver={(e) => handleCardDragOver(e, card.id)}
                onDragLeave={handleCardDragLeave}
                onDrop={(e) => handleCardDrop(e, card)}
                onClick={() => openUploadModal(card)}
                className={`relative rounded-3xl border bg-white p-5 cursor-pointer transition-all duration-200 group flex flex-col justify-between select-none ${
                  isDragOver
                    ? "border-blue-500 ring-4 ring-blue-500/20 shadow-xl scale-[1.02] bg-blue-50/50"
                    : "border-slate-200 hover:border-blue-300 hover:shadow-lg shadow-xs hover:-translate-y-0.5"
                }`}
              >
                {/* Top Badge & Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition">
                    {card.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-1 mb-4">
                  <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition">
                    {card.title}
                  </h3>
                  <div className="text-xs font-bold text-blue-700">{card.subtitle}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {card.description}
                  </p>
                </div>

                {/* Footer link indicator */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-blue-600 transition">
                  <span className="truncate">เชื่อมไป: {card.linkedTitle}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 flex-shrink-0" />
                </div>

                {/* Drag over overlay visual indicator */}
                {isDragOver && (
                  <div className="absolute inset-0 rounded-3xl bg-blue-600/90 backdrop-blur-xs flex flex-col items-center justify-center text-white font-black text-sm animate-in fade-in duration-150 z-20">
                    <UploadCloud className="h-8 w-8 mb-1 animate-bounce" />
                    <span>ปล่อยไฟล์ตรงนี้เพื่ออัปโหลด</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Quick Upload Modal */}
      {activeModalCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${activeModalCard.color} text-white flex items-center justify-center shadow-md flex-shrink-0`}
                >
                  <activeModalCard.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">
                      อัปโหลด: {activeModalCard.title}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {activeModalCard.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    จะถูกจัดหมวดหมู่และส่งไปยัง {activeModalCard.linkedTitle} อัตโนมัติ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalCard(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Success State */}
            {uploadSuccess ? (
              <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    อัปโหลดและจัดหมวดหมู่สำเร็จ!
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    ไฟล์ &ldquo;{uploadSuccess.title}&rdquo; ถูกบันทึกลงในคลัง และกระจายไปยัง{" "}
                    {activeModalCard.linkedTitle} เรียบร้อยแล้ว
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link
                    href={activeModalCard.linkedUrl}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    <span>เปิดดูใน {activeModalCard.linkedTitle}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    href="/stock"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
                  >
                    <span>ไปยังคลังไฟล์ทั้งหมด (File Stock)</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setUploadSuccess(null);
                      setSelectedFile(null);
                      setFilePreview(null);
                      setTitle("");
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
                  >
                    + อัปโหลดไฟล์อื่นในหมวดนี้เพิ่ม
                  </button>
                </div>
              </div>
            ) : (
              /* Upload Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {errorMessage}
                  </div>
                )}

                {/* 1. File Upload Dropzone */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    1. แนบไฟล์เอกสาร / รูปภาพ / คลิปวิดีโอ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,application/pdf,video/*"
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl border border-blue-200 bg-blue-50/50">
                      <div className="flex items-center gap-3 min-w-0">
                        {filePreview ? (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="h-12 w-12 rounded-xl object-cover border border-blue-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                            <FileText className="h-6 w-6" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB •{" "}
                            {selectedFile.type || "ไฟล์เอกสาร"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFilePreview(null);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition"
                        title="เปลี่ยนไฟล์"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition hover:bg-blue-50/30"
                    >
                      <UploadCloud className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                      <p className="text-xs font-bold text-slate-700">
                        คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางในกรอบนี้
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        รองรับไฟล์ PDF, รูปภาพ JPG/PNG/WEBP, วิดีโอ MP4 (ขนาดไม่เกิน 50MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Title & Academic Year / Term */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      2. ชื่อเอกสาร / หัวข้อหลักฐาน <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="เช่น แผนการสอนวิชาเครือข่าย หรือ วุฒิบัตรการอบรม AI"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      ปีการศึกษา / เทอม
                    </label>
                    <div className="flex gap-1.5">
                      <select
                        value={uploadYear}
                        onChange={(e) => setUploadYear(e.target.value)}
                        className="flex-1 px-2.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        {availableYears.map((y) => (
                          <option key={y} value={y}>
                            ปี {y}
                          </option>
                        ))}
                      </select>
                      <select
                        value={uploadSemester}
                        onChange={(e) => setUploadSemester(e.target.value)}
                        className="w-24 px-2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        {availableSemesters.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.shortLabel}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Description */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    3. รายละเอียดเพิ่มเติม (คำอธิบาย)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="ระบุวัตถุประสงค์ ผลลัพธ์ที่ได้ หรือหมายเหตุประกอบเอกสาร"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* 4. Category-Specific Fields */}
                {(activeModalCard.category === "training_photo" ||
                  activeModalCard.category === "speaker_activity" ||
                  activeModalCard.category === "training_cert") && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      ข้อมูลสถานที่และกิจกรรม (ไปที่ไหน ทำอะไร)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          สถานที่จัดกิจกรรม
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="เช่น ณ สสอ., โรงแรม..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1 flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          หน่วยงานผู้จัด
                        </label>
                        <input
                          type="text"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="เช่น สำนักพัฒนาสมรรถนะครูฯ"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          วันที่จัดกิจกรรม
                        </label>
                        <input
                          type="date"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeModalCard.category === "lesson_plan" && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      ข้อมูลรายวิชาและระดับชั้น
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          รหัสวิชา / ชื่อวิชา
                        </label>
                        <input
                          type="text"
                          value={subjectCode}
                          onChange={(e) => setSubjectCode(e.target.value)}
                          placeholder="เช่น 20105-2001 การเขียนโปรแกรม"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          ระดับชั้น / กลุ่มเรียน
                        </label>
                        <input
                          type="text"
                          value={gradeLevel}
                          onChange={(e) => setGradeLevel(e.target.value)}
                          placeholder="เช่น ปวช. 2 ช่างเทคนิคคอมพิวเตอร์"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Optional External Video / Link */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5 text-blue-600" />
                    แนบลิงก์คลิปวิดีโอภายนอก (YouTube / Google Drive / TikTok)
                  </label>
                  <input
                    type="url"
                    value={externalVideoUrl}
                    onChange={(e) => setExternalVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveModalCard(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-200 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>กำลังอัปโหลด...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4" />
                        <span>อัปโหลดและจัดหมวดหมู่</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
