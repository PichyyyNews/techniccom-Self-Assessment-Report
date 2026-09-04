"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Image as ImageIcon,
  Video,
  Download,
  Eye,
  ExternalLink,
  Plus,
  Zap,
  MapPin,
  Building2,
  Calendar,
  Loader2,
  FolderArchive,
  X,
} from "lucide-react";
import { useAcademicYear } from "@/components/layout/AcademicYearContext";

interface EvidenceFileItem {
  id: string;
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
    name: string;
    avatarUrl?: string | null;
  } | null;
}

interface LiveEvidenceSectionProps {
  category: string | string[];
  sectionTitle?: string;
  emptyNotice?: string;
  scope?: "all" | "my";
}

export function LiveEvidenceSection({
  category,
  sectionTitle = "ไฟล์หลักฐานที่อัปโหลดแล้วในระบบ (Live Evidence)",
  emptyNotice = "ยังไม่มีไฟล์หลักฐานที่อัปโหลดในรอบปีการศึกษานี้",
  scope = "all",
}: LiveEvidenceSectionProps) {
  const { selectedYear, selectedSemester } = useAcademicYear();
  const [files, setFiles] = useState<EvidenceFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<EvidenceFileItem | null>(null);

  const fetchEvidence = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("scope", scope);
      params.set("academicYear", selectedYear);
      if (selectedSemester !== "all") {
        params.set("semester", selectedSemester);
      }

      if (Array.isArray(category)) {
        // Fetch all and filter client-side
      } else {
        params.set("category", category);
      }

      const res = await fetch(`/api/evidence?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.files) {
        let list: EvidenceFileItem[] = data.files;
        if (Array.isArray(category)) {
          list = list.filter((f) => category.includes(f.category));
        }
        setFiles(list);
      }
    } catch (err) {
      console.error("Failed to load live evidence:", err);
    } finally {
      setLoading(false);
    }
  }, [category, selectedYear, selectedSemester, scope]);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-cyan-600" />;
    if (fileType.includes("pdf")) return <FileText className="h-5 w-5 text-rose-600" />;
    if (fileType.startsWith("video/")) return <Video className="h-5 w-5 text-indigo-600" />;
    return <FileText className="h-5 w-5 text-blue-600" />;
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Section Header */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-800">{sectionTitle}</h3>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
              {files.length} รายการ
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            เชื่อมโยงอัตโนมัติจากหน้า Quick Upload และคลัง Stock กลาง
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/quick-upload"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs"
          >
            <Zap className="h-3.5 w-3.5 text-amber-300" />
            <span>+ อัปโหลดไฟล์เพิ่ม</span>
          </Link>
          <Link
            href="/stock"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
          >
            <FolderArchive className="h-3.5 w-3.5 text-slate-400" />
            <span>ดูในคลัง Stock</span>
          </Link>
        </div>
      </div>

      {/* Files Display */}
      {loading ? (
        <div className="py-12 text-center space-y-2">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
          <p className="text-xs text-slate-400 font-medium">กำลังโหลดไฟล์หลักฐาน...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="p-8 text-center space-y-3">
          <div className="h-12 w-12 mx-auto rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">
            <FolderArchive className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold text-slate-600">{emptyNotice}</p>
          <Link
            href="/quick-upload"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 underline"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>คลิกที่นี่เพื่ออัปโหลดหลักฐานเข้าสู่หมวดนี้</span>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-bold text-slate-500">ชื่อเอกสาร / ไฟล์</th>
                <th className="py-3 px-4 font-bold text-slate-500">ข้อมูลเพิ่มเติม / สถานที่</th>
                <th className="py-3 px-4 font-bold text-slate-500">ผู้จัดเก็บ</th>
                <th className="py-3 px-4 font-bold text-slate-500">ขนาด</th>
                <th className="py-3 px-4 font-bold text-slate-500 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {files.map((file) => (
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
                  <td className="py-3 px-4 text-slate-600">
                    {file.metadata?.location ? (
                      <div className="flex items-center gap-1 text-[11px] text-slate-600">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{file.metadata.location}</span>
                      </div>
                    ) : file.metadata?.subjectCode ? (
                      <span className="text-[11px] font-semibold text-blue-700">
                        {file.metadata.subjectCode}
                      </span>
                    ) : (
                      file.description || "-"
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {file.user?.name || "บุคลากร"}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition"
                        title="ดูตัวอย่างไฟล์"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition"
                        title="ดาวน์โหลดไฟล์"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="truncate">
                <h4 className="text-sm font-black text-slate-900 truncate">
                  {previewFile.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {previewFile.fileName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewFile.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
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
                <div className="p-8 text-center space-y-2">
                  <FileText className="h-10 w-10 text-blue-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">
                    คลิกดาวน์โหลดเพื่อเปิดดูไฟล์นี้
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
