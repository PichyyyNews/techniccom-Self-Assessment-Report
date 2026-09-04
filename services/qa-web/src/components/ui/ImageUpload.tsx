"use client";

import React, { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";

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

    const validMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    if (!validMimes.includes(file.type)) {
      setError("กรุณาเลือกไฟล์รูปภาพ JPG PNG WEBP GIF SVG");
      return;
    }

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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }} className={className}>
      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
        รูปประจำตัว
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {value ? (
        <Paper
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            bgcolor: "background.paper",
            borderColor: "divider",
          }}
        >
          <Avatar
            src={value}
            alt="รูปประจำตัว"
            sx={{ width: 56, height: 56, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                อัปโหลดรูปประจำตัวแล้ว
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {value}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "กำลังอัปโหลด" : "เปลี่ยนรูปภาพ"}
              </Button>

              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
                onClick={handleRemove}
                disabled={uploading}
              >
                ลบรูปภาพ
              </Button>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Paper
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
            textAlign: "center",
            cursor: "pointer",
            borderStyle: "dashed",
            borderWidth: 2,
            borderColor: isDragging ? "primary.main" : "divider",
            bgcolor: isDragging ? "primary.50" : "background.paper",
            transition: "all 0.15s ease",
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: "background.default",
            },
          }}
        >
          {uploading ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 1 }}>
              <CircularProgress size={32} sx={{ mb: 1 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                กำลังอัปโหลดรูปภาพ
              </Typography>
            </Box>
          ) : (
            <>
              <PhotoCameraIcon sx={{ fontSize: 36, color: "primary.main", mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                ลากรูปมาวางที่นี่ หรือคลิกเพื่อเลือกรูปภาพ
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5 }}>
                รองรับไฟล์ JPG PNG WEBP GIF ขนาดสูงสุด 5MB
              </Typography>
            </>
          )}
        </Paper>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </Box>
  );
}
