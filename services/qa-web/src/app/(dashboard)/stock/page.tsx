"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FolderArchive,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  FileText,
  Image as ImageIcon,
  Video,
  FileCheck,
  Calendar,
  User,
  ArrowLeft,
  Zap,
  Grid,
  List,
  RefreshCw,
  Sparkles,
  ExternalLink,
  MapPin,
  Building2,
  X,
  AlertTriangle,
  Loader2,
  Plus,
} from "lucide-react";
import { useAcademicYear } from "@/components/layout/AcademicYearContext";

interface EvidenceFileItem {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  category: string;
  fileKey: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  academicYear: string;
  semester: string;
  metadata?: {
    location?: string;
    organization?: string;
    eventDate?: string;
    subjectCode?: string;
    gradeLevel?: string;
    externalVideoUrl?: string;
  } | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    position?: string | null;
    roleCode: string;
  } | null;
}

const CATEGORY_MAP: Record<
  string,
  { label: string; color: string; badgeColor: string }
> = {
  lesson_plan: {
    label: "แผนการจัดการเรียนรู้",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  training_cert: {
    label: "วุฒิบัตร / เกียรติบัตร",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  training_photo: {
    label: "ภาพกิจกรรมอบรม/ดูงาน",
    color: "text-cyan-600 bg-cyan-50 border-cyan-200",
    badgeColor: "bg-cyan-100 text-cyan-700",
  },
  speaker_activity: {
    label: "การเป็นวิทยากร & บรรยาย",
    color: "text-purple-600 bg-purple-50 border-purple-200",
    badgeColor: "bg-purple-100 text-purple-700",
  },
  research: {
    label: "งานวิจัย & สิ่งประดิษฐ์",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  student_work: {
    label: "ชิ้นงาน & ผลงานนักศึกษา",
    color: "text-rose-600 bg-rose-50 border-rose-200",
    badgeColor: "bg-rose-100 text-rose-700",
  },
  license: {
    label: "ใบประกอบวิชาชีพ / คุณวุฒิ",
    color: "text-teal-600 bg-teal-50 border-teal-200",
    badgeColor: "bg-teal-100 text-teal-700",
  },
  other: {
    label: "เอกสาร SAR / โครงการ",
    color: "text-slate-600 bg-slate-50 border-slate-200",
    badgeColor: "bg-slate-100 text-slate-700",
  },
};

export default function FileStockPage() {
  const { data: session } = useSession();
  const { selectedYear, selectedSemester, termLabel, availableYears, availableSemesters } =
    useAcademicYear();

  const [scope, setScope] = useState<"all" | "my">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>(selectedYear);
  const [filterSemester, setFilterSemester] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [files, setFiles] = useState<EvidenceFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<EvidenceFileItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EvidenceFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("scope", scope);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (filterYear !== "all") params.set("academicYear", filterYear);
      if (filterSemester !== "all") params.set("semester", filterSemester);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/evidence?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error("Failed to load evidence files:", err);
    } finally {
      setLoading(false);
    }
  }, [scope, selectedCategory, filterYear, filterSemester, searchQuery]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/evidence/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        const d = await res.json();
        alert(d.error || "ไม่สามารถลบไฟล์ได้");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบไฟล์");
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwnerOrRoot = (file: EvidenceFileItem) => {
    if (!session?.user) return false;
    return session.user.role === "ROOT" || file.userId === session.user.id;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-cyan-600" />;
    if (fileType.includes("pdf")) return <FileText className="h-5 w-5 text-rose-600" />;
    if (fileType.startsWith("video/")) return <Video className="h-5 w-5 text-indigo-600" />;
    return <FileCheck className="h-5 w-5 text-blue-600" />;
  };

  const totalSizeMB = files.reduce((acc, f) => acc + f.fileSize, 0) / (1024 * 1024);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 text-xs font-bold transition shadow-2xs group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>← กลับหน้าหลัก (Dashboard)</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/quick-upload"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-200 transition active:scale-95"
          >
            <Zap className="h-4 w-4 text-amber-300" />
            <span>+ ทางลัดอัปโหลดด่วน (Quick Upload)</span>
          </Link>
        </div>
      </div>

      {/* 2. Header Title Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-1">
              <FolderArchive className="h-3.5 w-3.5 text-blue-600" />
              คลังหลักฐานดิจิทัลกลาง (Central Evidence Repository)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              คลังไฟล์และร่องรอยหลักฐาน (File Stock)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              ศูนย์รวมไฟล์เอกสาร, วุฒิบัตร, ภาพกิจกรรมการอบรม, งานวิจัย และชิ้นงานนักเรียน สไตล์ Google Drive
              เชื่อมโยงข้อมูลสู่เล่มรายงานการประเมินตนเอง (SAR)
            </p>
          </div>

          {/* Mini Stats Box */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex-shrink-0">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase">จำนวนไฟล์ในคลัง</div>
              <div className="text-xl font-black text-slate-900">{files.length} รายการ</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase">พื้นที่จัดเก็บ</div>
              <div className="text-xl font-black text-blue-600">{totalSizeMB.toFixed(1)} MB</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Scope Switcher */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        {/* Top Controls: Scope Toggle + Search + View Mode */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Scope Toggle: My Files vs All College Files */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200/80 select-none flex-shrink-0">
            <button
              type="button"
              onClick={() => setScope("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                scope === "all"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🌐 ไฟล์ทุกคนในวิทยาลัย</span>
            </button>
            <button
              type="button"
              onClick={() => setScope("my")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                scope === "my"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>📂 เฉพาะไฟล์ของฉัน</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อไฟล์, หัวข้อ, หรือผู้เผยแพร่..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Year & Semester Selectors + View Mode */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Year Selector */}
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">ทุกปีการศึกษา</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  ปี {y}
                </option>
              ))}
            </select>

            {/* Semester Selector */}
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">ทุกภาคเรียน</option>
              {availableSemesters.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.shortLabel}
                </option>
              ))}
            </select>

            {/* Grid / List View Toggle */}
            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="แสดงผลแบบ Card Grid"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="แสดงผลแบบ Table List"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            ทั้งหมด ({files.length})
          </button>

          {Object.entries(CATEGORY_MAP).map(([key, val]) => {
            const isSelected = selectedCategory === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                }`}
              >
                {val.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Files List / Grid View */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-xs text-slate-400 font-medium">กำลังโหลดคลังไฟล์หลักฐาน...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-slate-200 bg-white p-8 space-y-4 shadow-xs">
          <div className="h-16 w-16 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <FolderArchive className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">ยังไม่พบไฟล์หลักฐานในหมวดหมู่นี้</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              คุณสามารถอัปโหลดไฟล์หลักฐานแรกผ่านทางลัด Quick Upload
              หรือปรับตัวกรองปีการศึกษาเพื่อค้นหา
            </p>
          </div>
          <Link
            href="/quick-upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>ไปที่หน้า Quick Upload</span>
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file) => {
            const cat = CATEGORY_MAP[file.category] || {
              label: file.category,
              badgeColor: "bg-slate-100 text-slate-700",
            };
            const isOwner = isOwnerOrRoot(file);
            const isImage = file.fileType.startsWith("image/");

            return (
              <div
                key={file.id}
                className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail / Header Preview */}
                  <div className="relative h-36 bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-100">
                    {isImage ? (
                      <img
                        src={file.fileUrl}
                        alt={file.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        {getFileIcon(file.fileType)}
                        <span className="text-[11px] font-bold uppercase">
                          {file.fileType.split("/")[1] || "FILE"}
                        </span>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black shadow-xs ${cat.badgeColor}`}
                      >
                        {cat.label}
                      </span>
                    </div>

                    {/* Academic Term Tag */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur text-white shadow-xs">
                        ปี {file.academicYear}/{file.semester === "all" ? "ทั้งปี" : `เทอม ${file.semester}`}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <h3
                      className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition"
                      title={file.title}
                    >
                      {file.title}
                    </h3>
                    {file.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {file.description}
                      </p>
                    )}

                    {/* Location / Event Date metadata */}
                    {file.metadata?.location && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{file.metadata.location}</span>
                      </div>
                    )}

                    {/* Uploader info */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 truncate">
                        {file.user?.avatarUrl ? (
                          <img
                            src={file.user.avatarUrl}
                            alt={file.user.name}
                            className="h-5 w-5 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center flex-shrink-0">
                            {file.user?.name?.charAt(0) || "U"}
                          </div>
                        )}
                        <span className="text-slate-600 truncate font-semibold">
                          {file.user?.name || "บุคลากร"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewFile(file)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white transition"
                      title="ดูตัวอย่างไฟล์ (Preview)"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={file.fileName}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-white transition"
                      title="ดาวน์โหลดไฟล์"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(file)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition"
                      title="ลบไฟล์"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table List View */
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4 font-bold text-slate-500">ชื่อเอกสาร / ไฟล์</th>
                  <th className="py-3.5 px-4 font-bold text-slate-500">หมวดหมู่</th>
                  <th className="py-3.5 px-4 font-bold text-slate-500">ปี/เทอม</th>
                  <th className="py-3.5 px-4 font-bold text-slate-500">ผู้เผยแพร่</th>
                  <th className="py-3.5 px-4 font-bold text-slate-500">ขนาด</th>
                  <th className="py-3.5 px-4 font-bold text-slate-500 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.map((file) => {
                  const cat = CATEGORY_MAP[file.category] || {
                    label: file.category,
                    badgeColor: "bg-slate-100 text-slate-700",
                  };
                  const isOwner = isOwnerOrRoot(file);

                  return (
                    <tr key={file.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {getFileIcon(file.fileType)}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate max-w-xs sm:max-w-sm">
                              {file.title}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {file.fileName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.badgeColor}`}
                        >
                          {cat.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">
                        {file.academicYear}/{file.semester}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {file.user?.name || "-"}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewFile(file)}
                            className="p-1 rounded-lg text-slate-500 hover:text-blue-600 transition"
                            title="ดูตัวอย่าง"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg text-slate-500 hover:text-emerald-600 transition"
                            title="ดาวน์โหลด"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          {isOwner && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(file)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition"
                              title="ลบไฟล์"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5 truncate">
                {getFileIcon(previewFile.fileType)}
                <div className="truncate">
                  <h3 className="text-sm font-black text-slate-900 truncate">
                    {previewFile.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    {previewFile.fileName} • {(previewFile.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewFile.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>เปิดแท็บใหม่</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Media Body */}
            <div className="flex-1 overflow-auto p-4 bg-slate-100/60 flex items-center justify-center min-h-[400px]">
              {previewFile.fileType.startsWith("image/") ? (
                <img
                  src={previewFile.fileUrl}
                  alt={previewFile.title}
                  className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-md"
                />
              ) : previewFile.fileType.includes("pdf") ? (
                <iframe
                  src={previewFile.fileUrl}
                  title={previewFile.title}
                  className="w-full h-[70vh] rounded-xl border border-slate-200 bg-white"
                />
              ) : previewFile.fileType.startsWith("video/") ? (
                <video
                  src={previewFile.fileUrl}
                  controls
                  className="max-h-[70vh] max-w-full rounded-xl shadow-md"
                />
              ) : (
                <div className="text-center space-y-3 p-8 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <FileText className="h-12 w-12 mx-auto text-blue-600" />
                  <p className="text-xs font-bold text-slate-700">
                    ไฟล์ประเภทนี้ไม่รองรับการแสดงผลพรีวิวในหน้าจอโดยตรง
                  </p>
                  <a
                    href={previewFile.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                  >
                    <Download className="h-4 w-4" />
                    <span>ดาวน์โหลดเพื่อเปิดดู</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                ยืนยันการลบไฟล์หลักฐาน?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์ &ldquo;{deleteTarget.title}&rdquo;?
                การกระทำนี้จะลบไฟล์ออกจาก MinIO S3 และฐานข้อมูลอย่างถาวร
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>กำลังลบ...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>ลบไฟล์ถาวร</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
