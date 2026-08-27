"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  Loader2,
  Camera,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { clsx } from "clsx";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder = "profile-photos",
  className,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    if (!file) return;

    // Validate type
    const validMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    if (!validMimes.includes(file.type)) {
      setError("กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WEBP, GIF, SVG)");
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("ขนาดไฟล์ต้องไม่เกิน 5MB");
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
        onChange(data.url);
      } else {
        setError(data.error || "อัปโหลดรูปภาพไม่สำเร็จ");
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
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={clsx("space-y-2", className)}>
      <label className="block text-xs font-bold text-slate-700">
        รูปประจำตัว (Profile Photo)
      </label>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {value ? (
        /* Preview Card */
        <div className="relative flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 transition">
          <img
            src={value}
            alt="รูปประจำตัว"
            className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shadow-xs flex-shrink-0 bg-white"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              อัปโหลดรูปประจำตัวแล้ว
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{value}</p>

            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs disabled:opacity-50"
              >
                {uploading ? "กำลังอัปโหลด..." : "เปลี่ยนรูปภาพ"}
              </button>

              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
              >
                ลบรูปภาพ
              </button>
            </div>
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
            "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-150 select-none",
            isDragging
              ? "border-blue-500 bg-blue-50/60 scale-[1.01]"
              : "border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-slate-50",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center py-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
              <span className="text-xs font-bold text-slate-700">กำลังอัปโหลดรูปภาพไปยัง MinIO S3...</span>
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100/70 text-blue-600 mb-3 shadow-2xs">
                <Camera className="h-6 w-6" />
              </div>

              <div className="text-xs font-bold text-slate-800">
                ลากรูปมาวางที่นี่ หรือ <span className="text-blue-600 underline">คลิกเพื่อเลือกรูปภาพ</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                รองรับไฟล์ JPG, PNG, WEBP, GIF (ขนาดสูงสุด 5MB)
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden native file input (supports camera on mobile) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
