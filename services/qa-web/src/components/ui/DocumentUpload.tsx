"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { clsx } from "clsx";

interface DocumentUploadProps {
  value?: string | null;
  fileName?: string | null;
  onChange: (url: string | null, originalName?: string | null) => void;
  folder?: string;
  label?: string;
  className?: string;
}

export function DocumentUpload({
  value,
  fileName,
  onChange,
  folder = "license-documents",
  label = "เอกสารหลักฐาน / สแกนบัตรใบอนุญาต (PDF หรือ รูปภาพ)",
  className,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    if (!file) return;

    // Validate mime type
    const validMimes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!validMimes.includes(file.type)) {
      setError("กรุณาเลือกไฟล์ PDF หรือรูปภาพ (JPG, PNG, WEBP)");
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("ขนาดไฟล์ต้องไม่เกิน 10MB");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        onChange(data.url, data.originalName || file.name);
      } else {
        setError(data.error || "อัปโหลดเอกสารไม่สำเร็จ");
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isPdf =
    value?.toLowerCase().endsWith(".pdf") ||
    fileName?.toLowerCase().endsWith(".pdf");

  return (
    <div className={clsx("space-y-1.5", className)}>
      {label && (
        <label className="block text-[11px] font-semibold text-slate-700">
          {label}
        </label>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {value ? (
        /* Document Preview Card */
        <div className="relative flex items-center justify-between gap-3 rounded-2xl border border-teal-200 bg-teal-50/40 p-3.5 transition hover:bg-teal-50/60">
          <div className="flex items-center gap-3 min-w-0">
            {isPdf ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 border border-rose-200 flex-shrink-0">
                <FileText className="h-6 w-6" />
              </div>
            ) : (
              <img
                src={value}
                alt="เอกสารหลักฐาน"
                className="h-12 w-12 rounded-xl object-cover border border-slate-200 shadow-2xs flex-shrink-0 bg-white"
              />
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1 text-xs font-bold text-teal-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                <span>{isPdf ? "ไฟล์เอกสาร PDF" : "ไฟล์รูปภาพหลักฐาน"}</span>
              </div>
              <p className="text-[11px] text-slate-600 truncate mt-0.5 max-w-[240px] sm:max-w-xs font-medium">
                {fileName || value.split("/").pop()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-teal-300 bg-white px-2.5 py-1 text-xs font-bold text-teal-700 hover:bg-teal-50 transition shadow-2xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">เปิดดูไฟล์</span>
            </a>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs disabled:opacity-50"
            >
              เปลี่ยน
            </button>

            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="rounded-lg border border-rose-200 bg-white px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition shadow-2xs disabled:opacity-50"
              title="ลบไฟล์เอกสาร"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone / Upload Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-150 select-none",
            isDragging
              ? "border-teal-500 bg-teal-50/60 scale-[1.01]"
              : "border-slate-200 bg-slate-50/50 hover:border-teal-400 hover:bg-teal-50/20",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center py-2">
              <Loader2 className="h-7 w-7 animate-spin text-teal-600 mb-2" />
              <span className="text-xs font-bold text-slate-700">กำลังอัปโหลดเอกสารไปยัง MinIO S3...</span>
            </div>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100/70 text-teal-700 mb-2 shadow-2xs">
                <UploadCloud className="h-5 w-5" />
              </div>

              <div className="text-xs font-bold text-slate-800">
                ลากไฟล์มาวางที่นี่ หรือ <span className="text-teal-600 underline">คลิกเพื่ออัปโหลดไฟล์</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                รองรับไฟล์ PDF จากระบบ KSP Self-Service, KSP School หรือรูปถ่ายบัตร JPG, PNG (สูงสุด 10MB)
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
