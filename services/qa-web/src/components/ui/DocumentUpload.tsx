"use client";

import React, { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

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
  label = "เอกสารหลักฐาน หรือ สแกนบัตรใบอนุญาต",
  className,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    if (!file) return;

    const validMimes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!validMimes.includes(file.type)) {
      setError("กรุณาเลือกไฟล์ PDF หรือรูปภาพ JPG PNG WEBP");
      return;
    }

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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }} className={className}>
      {label && (
        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
          {label}
        </Typography>
      )}

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
            justifyContent: "space-between",
            p: 1.75,
            bgcolor: "background.paper",
            borderColor: "primary.light",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            {isPdf ? (
              <Box
                sx={{
                  display: "flex",
                  width: 44,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 2,
                  bgcolor: "error.50",
                  color: "error.main",
                  flexShrink: 0,
                }}
              >
                <DescriptionIcon />
              </Box>
            ) : (
              <Box
                component="img"
                src={value}
                alt="เอกสารหลักฐาน"
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  objectFit: "cover",
                  border: "1px solid",
                  borderColor: "divider",
                  flexShrink: 0,
                }}
              />
            )}

            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                  {isPdf ? "ไฟล์เอกสาร PDF" : "ไฟล์รูปภาพหลักฐาน"}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: { xs: 180, sm: 300 },
                }}
              >
                {fileName || value.split("/").pop()}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
            <Button
              size="small"
              variant="outlined"
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            >
              เปิดดูไฟล์
            </Button>

            <Button
              size="small"
              variant="outlined"
              color="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              เปลี่ยน
            </Button>

            <IconButton
              size="small"
              color="error"
              onClick={handleRemove}
              disabled={uploading}
              aria-label="ลบไฟล์"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
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
            <Box sx={{ width: "100%", maxWidth: 280, py: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 1 }}>
                กำลังอัปโหลดเอกสาร
              </Typography>
              <LinearProgress />
            </Box>
          ) : (
            <>
              <CloudUploadIcon sx={{ fontSize: 36, color: "primary.main", mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5 }}>
                รองรับไฟล์ PDF หรือรูปภาพ JPG PNG WEBP ขนาดไม่เกิน 10MB
              </Typography>
            </>
          )}
        </Paper>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </Box>
  );
}
