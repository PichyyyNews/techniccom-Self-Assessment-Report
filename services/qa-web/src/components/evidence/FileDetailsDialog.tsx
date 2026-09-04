"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
import SendIcon from "@mui/icons-material/Send";
import DescriptionIcon from "@mui/icons-material/Description";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import CollectionsIcon from "@mui/icons-material/Collections";
import { GroupedEvidenceFile, GalleryItem } from "@/lib/evidence-grouping";

export interface CommentItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  roleCode?: string;
  text: string;
  createdAt: string;
}

export interface EvidenceFileDetails {
  id: string;
  userId?: string;
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
    tags?: string[];
    starredBy?: string[];
    comments?: CommentItem[];
    batchId?: string | null;
    batchIndex?: number;
    batchTotal?: number;
    originalTitle?: string;
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
  gallery?: GalleryItem[];
}

interface FileDetailsDialogProps {
  open: boolean;
  file: GroupedEvidenceFile | EvidenceFileDetails | null;
  initialSlideIndex?: number;
  onClose: () => void;
  onFileUpdated?: (updatedFile: EvidenceFileDetails) => void;
}

// Thai Date Formatter
function formatThaiDateTime(dateString: string) {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const months = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear() + 543;
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${year} เวลา ${hours}:${minutes} น.`;
  } catch {
    return dateString;
  }
}

export function FileDetailsDialog({
  open,
  file,
  initialSlideIndex = 0,
  onClose,
  onFileUpdated,
}: FileDetailsDialogProps) {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;

  const [currentFile, setCurrentFile] = useState<EvidenceFileDetails | null>(file);
  const [activeSlideIndex, setActiveSlideIndex] = useState(initialSlideIndex);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isStarring, setIsStarring] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentFile(file);
    setActiveSlideIndex(initialSlideIndex || 0);
    setCommentText("");
    setCommentError(null);
    setFullscreenOpen(false);
    setZoomLevel(1);
  }, [file, initialSlideIndex]);

  // Gallery items normalization
  const gallery: GalleryItem[] =
    currentFile?.gallery && currentFile.gallery.length > 0
      ? currentFile.gallery
      : currentFile
      ? [
          {
            id: currentFile.id,
            title: currentFile.title,
            fileName: currentFile.fileName,
            fileUrl: currentFile.fileUrl,
            fileType: currentFile.fileType,
            fileSize: currentFile.fileSize,
            metadata: currentFile.metadata,
            createdAt: currentFile.createdAt,
          },
        ]
      : [];

  const totalSlides = gallery.length;
  const activeItem: GalleryItem | null = gallery[activeSlideIndex] || gallery[0] || null;

  const handlePrevSlide = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveSlideIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
      setZoomLevel(1);
    },
    [totalSlides]
  );

  const handleNextSlide = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
      setZoomLevel(1);
    },
    [totalSlides]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevSlide();
      } else if (e.key === "ArrowRight") {
        handleNextSlide();
      } else if (e.key === "Escape") {
        if (fullscreenOpen) {
          setFullscreenOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, fullscreenOpen, handlePrevSlide, handleNextSlide]);

  if (!currentFile || !activeItem) return null;

  const metadata = currentFile.metadata || {};
  const tags = Array.isArray(metadata.tags) ? metadata.tags : [];
  const starredBy = Array.isArray(metadata.starredBy) ? metadata.starredBy : [];
  const comments = Array.isArray(metadata.comments) ? metadata.comments : [];
  const isStarred = currentUserId ? starredBy.includes(currentUserId) : false;

  const lowerName = (activeItem.fileName || "").toLowerCase();
  const isImage =
    activeItem.fileType.startsWith("image/") || /\.(jpe?g|png|webp|gif|svg)$/i.test(lowerName);
  const isVideo =
    activeItem.fileType.startsWith("video/") ||
    Boolean(metadata.externalVideoUrl) ||
    /\.(mp4|mov|avi|webm)$/i.test(lowerName);
  const isPdf = activeItem.fileType.includes("pdf") || lowerName.endsWith(".pdf");

  // Handle Star Toggle
  const handleToggleStar = async () => {
    if (isStarring) return;
    try {
      setIsStarring(true);
      const res = await fetch(`/api/evidence/${currentFile.id}/star`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const updated: EvidenceFileDetails = {
          ...currentFile,
          metadata: {
            ...currentFile.metadata,
            starredBy: data.starredBy,
          },
        };
        setCurrentFile(updated);
        onFileUpdated?.(updated);
      }
    } catch (err) {
      console.error("Star toggle error:", err);
    } finally {
      setIsStarring(false);
    }
  };

  // Handle Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      setCommentError(null);
      const res = await fetch(`/api/evidence/${currentFile.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const updated: EvidenceFileDetails = {
          ...currentFile,
          metadata: {
            ...currentFile.metadata,
            comments: data.comments,
          },
        };
        setCurrentFile(updated);
        setCommentText("");
        onFileUpdated?.(updated);
      } else {
        setCommentError(data.error || "ไม่สามารถบันทึกความคิดเห็นได้");
      }
    } catch (err: any) {
      setCommentError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
        {/* Dialog Header */}
        <DialogTitle
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.default",
          }}
        >
          <Box sx={{ minWidth: 0, pr: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: "text.primary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentFile.title}
              </Typography>
              {totalSlides > 1 && (
                <Chip
                  size="small"
                  icon={<CollectionsIcon sx={{ fontSize: 14 }} />}
                  label={`${activeSlideIndex + 1}/${totalSlides} - ${activeItem.fileName}`}
                  color="primary"
                  variant="outlined"
                  sx={{ height: 22, fontSize: "0.725rem", fontWeight: 600 }}
                />
              )}
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {activeItem.fileName}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
            {/* Star Button */}
            <Tooltip title={isStarred ? "ยกเลิกการติดดาว" : "ติดดาวเป็นไฟล์สำคัญ"}>
              <Button
                size="small"
                variant={isStarred ? "contained" : "outlined"}
                color="warning"
                onClick={handleToggleStar}
                startIcon={isStarred ? <StarIcon /> : <StarBorderIcon />}
                sx={{ minWidth: 100 }}
              >
                {isStarred ? "ติดดาวแล้ว" : "ติดดาว"}
              </Button>
            </Tooltip>

            {/* Download Button */}
            <Button
              component="a"
              href={activeItem.fileUrl}
              download={activeItem.fileName}
              variant="contained"
              color="primary"
              size="small"
              startIcon={<FileDownloadIcon />}
            >
              ดาวน์โหลด
            </Button>

            {/* Close Button */}
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* Dialog Content */}
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" },
              gap: 3,
            }}
          >
            {/* Left Column: Preview Area with Carousel Controls */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  การแสดงตัวอย่างไฟล์
                </Typography>
                {isImage && (
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<FullscreenIcon />}
                    onClick={() => setFullscreenOpen(true)}
                    sx={{ fontSize: "0.75rem", py: 0.25 }}
                  >
                    ดูภาพเต็มจอ
                  </Button>
                )}
              </Box>

              {/* Main Preview Container */}
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "grey.900",
                  overflow: "hidden",
                  minHeight: 380,
                  maxHeight: 520,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isImage ? "zoom-in" : "default",
                  "&:hover .carousel-nav-btn": {
                    opacity: 1,
                  },
                }}
                onClick={() => {
                  if (isImage) setFullscreenOpen(true);
                }}
              >
                {isImage ? (
                  <Box
                    component="img"
                    src={activeItem.fileUrl}
                    alt={activeItem.title || activeItem.fileName}
                    sx={{
                      width: "100%",
                      height: "100%",
                      maxHeight: 500,
                      objectFit: "contain",
                      bgcolor: "#000",
                      transition: "transform 0.15s ease",
                    }}
                  />
                ) : isVideo ? (
                  metadata.externalVideoUrl ? (
                    <Box
                      component="iframe"
                      src={metadata.externalVideoUrl}
                      sx={{ width: "100%", height: 420, border: "none" }}
                      title={currentFile.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <Box
                      component="video"
                      src={activeItem.fileUrl}
                      controls
                      sx={{ width: "100%", maxHeight: 460 }}
                    />
                  )
                ) : isPdf ? (
                  <Box
                    component="iframe"
                    src={`${activeItem.fileUrl}#toolbar=1`}
                    sx={{ width: "100%", height: 480, border: "none", bgcolor: "#fff" }}
                    title={activeItem.title}
                  />
                ) : (
                  <Box sx={{ p: 4, textAlign: "center", color: "grey.300" }}>
                    <DescriptionIcon sx={{ fontSize: 64, color: "grey.500", mb: 1.5 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      {activeItem.fileName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "grey.400", mb: 2 }}>
                      ไฟล์ประเภทนี้ไม่สามารถแสดงผลแบบพรีวิวบนเบราว์เซอร์ได้โดยตรง
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      component="a"
                      href={activeItem.fileUrl}
                      download={activeItem.fileName}
                      startIcon={<FileDownloadIcon />}
                    >
                      ดาวน์โหลดเพื่อเปิดดู
                    </Button>
                  </Box>
                )}

                {/* Floating Carousel Navigation Buttons */}
                {totalSlides > 1 && (
                  <>
                    <IconButton
                      className="carousel-nav-btn"
                      onClick={handlePrevSlide}
                      sx={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(0, 0, 0, 0.65)",
                        color: "white",
                        opacity: 0.85,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "rgba(0, 0, 0, 0.9)",
                          transform: "translateY(-50%) scale(1.1)",
                        },
                      }}
                      title="ภาพก่อนหน้า (ลูกศรซ้าย)"
                    >
                      <ChevronLeftIcon sx={{ fontSize: 28 }} />
                    </IconButton>

                    <IconButton
                      className="carousel-nav-btn"
                      onClick={handleNextSlide}
                      sx={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(0, 0, 0, 0.65)",
                        color: "white",
                        opacity: 0.85,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "rgba(0, 0, 0, 0.9)",
                          transform: "translateY(-50%) scale(1.1)",
                        },
                      }}
                      title="ภาพถัดไป (ลูกศรขวา)"
                    >
                      <ChevronRightIcon sx={{ fontSize: 28 }} />
                    </IconButton>

                    {/* Counter Overlay Badge */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 12,
                        left: 12,
                        bgcolor: "rgba(0, 0, 0, 0.75)",
                        color: "white",
                        px: 1.25,
                        py: 0.4,
                        borderRadius: 1.5,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {activeSlideIndex + 1} / {totalSlides}
                    </Box>
                  </>
                )}
              </Box>

              {/* Bottom Thumbnail Strip (When multi-file) */}
              {totalSlides > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    overflowX: "auto",
                    py: 0.5,
                    px: 0.5,
                    bgcolor: "grey.50",
                    borderRadius: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    "&::-webkit-scrollbar": { height: 6 },
                    "&::-webkit-scrollbar-thumb": { bgcolor: "grey.300", borderRadius: 3 },
                  }}
                >
                  {gallery.map((gItem, idx) => {
                    const isItemImg =
                      gItem.fileType.startsWith("image/") ||
                      /\.(jpe?g|png|webp|gif|svg)$/i.test(gItem.fileName);
                    const isSelected = idx === activeSlideIndex;

                    return (
                      <Box
                        key={gItem.id || idx}
                        onClick={() => setActiveSlideIndex(idx)}
                        sx={{
                          position: "relative",
                          width: 48,
                          height: 48,
                          borderRadius: 1.5,
                          overflow: "hidden",
                          flexShrink: 0,
                          cursor: "pointer",
                          border: "2px solid",
                          borderColor: isSelected ? "primary.main" : "transparent",
                          opacity: isSelected ? 1 : 0.65,
                          transition: "all 0.15s ease",
                          "&:hover": {
                            opacity: 1,
                            borderColor: isSelected ? "primary.main" : "grey.400",
                          },
                        }}
                      >
                        {isItemImg ? (
                          <Box
                            component="img"
                            src={gItem.fileUrl}
                            alt={gItem.fileName}
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              bgcolor: "grey.200",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "text.secondary",
                            }}
                          >
                            <DescriptionIcon sx={{ fontSize: 20 }} />
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* Preview Action Bar */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    component="a"
                    href={activeItem.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<OpenInNewIcon />}
                  >
                    เปิดในหน้าต่างใหม่
                  </Button>
                  {isImage && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FullscreenIcon />}
                      onClick={() => setFullscreenOpen(true)}
                    >
                      ขยายเต็มจอ
                    </Button>
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {(activeItem.fileSize / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              </Box>
            </Box>

            {/* Right Column: Metadata & Comments */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* 1. Uploader & Upload Time Card */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Avatar
                  src={currentFile.user?.avatarUrl || undefined}
                  sx={{ width: 48, height: 48, bgcolor: "primary.main" }}
                >
                  <PersonIcon />
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {currentFile.user?.name || "บุคลากรวิทยาลัย"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                    {currentFile.user?.position || currentFile.user?.roleCode || "ผู้จัดเก็บข้อมูล"}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      อัปโหลดเมื่อ {formatThaiDateTime(currentFile.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* 2. File Meta Specifications */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  รายละเอียดของหลักฐาน
                </Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                      ปีการศึกษาและภาคเรียน
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {currentFile.academicYear} / เทอม {currentFile.semester}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                      หมวดหมู่หลักฐาน
                    </Typography>
                    <Chip
                      size="small"
                      label={currentFile.category}
                      color="primary"
                      variant="outlined"
                      sx={{ mt: 0.25 }}
                    />
                  </Box>

                  {metadata.subjectCode && (
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        รหัสวิชา
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {metadata.subjectCode}
                      </Typography>
                    </Box>
                  )}

                  {metadata.location && (
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        สถานที่จัดกิจกรรม
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {metadata.location}
                      </Typography>
                    </Box>
                  )}

                  {metadata.organization && (
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        หน่วยงานจัดงาน
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {metadata.organization}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {currentFile.description && (
                  <Box sx={{ pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                      คำอธิบายเพิ่มเติม
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-line" }}>
                      {currentFile.description}
                    </Typography>
                  </Box>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <Box sx={{ pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 0.5, mb: 0.75 }}
                    >
                      <LocalOfferIcon sx={{ fontSize: 13 }} />
                      ป้ายกำกับ (Tags)
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {tags.map((tag, idx) => (
                        <Chip key={idx} size="small" label={`#${tag}`} variant="filled" color="secondary" />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>

              {/* 3. Comments & QA Feedback Section */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 0.75 }}
                  >
                    <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
                    ความคิดเห็นและข้อเสนอแนะ ({comments.length})
                  </Typography>
                </Box>

                {commentError && (
                  <Alert severity="error" onClose={() => setCommentError(null)}>
                    {commentError}
                  </Alert>
                )}

                {/* Comments Feed */}
                <Box
                  sx={{
                    maxHeight: 220,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    pr: 0.5,
                  }}
                >
                  {comments.length === 0 ? (
                    <Typography variant="caption" sx={{ color: "text.secondary", py: 2, textAlign: "center" }}>
                      ยังไม่มีความคิดเห็นหรือข้อเสนอแนะ SAR สำหรับไฟล์นี้
                    </Typography>
                  ) : (
                    comments.map((comment) => (
                      <Box
                        key={comment.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: "grey.50",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
                            {comment.userName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: 10 }}>
                            {formatThaiDateTime(comment.createdAt)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 13 }}>
                          {comment.text}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>

                {/* Add Comment Input */}
                <Box component="form" onSubmit={handleAddComment} sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="พิมพ์ข้อเสนอแนะหรือบันทึก SAR..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={isSubmittingComment}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="small"
                    disabled={!commentText.trim() || isSubmittingComment}
                    startIcon={isSubmittingComment ? <CircularProgress size={14} /> : <SendIcon />}
                    sx={{ px: 2, flexShrink: 0 }}
                  >
                    ส่ง
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: "background.default" }}>
          <Button onClick={onClose} color="inherit">
            ปิดหน้าต่าง
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= FULLSCREEN IMAGE LIGHTBOX MODAL ================= */}
      {fullscreenOpen && isImage && (
        <Dialog
          fullScreen
          open={fullscreenOpen}
          onClose={() => setFullscreenOpen(false)}
          sx={{
            "& .MuiDialog-paper": {
              bgcolor: "rgba(5, 5, 5, 0.96)",
              backdropFilter: "blur(8px)",
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: 0,
            },
          }}
        >
          {/* Fullscreen Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: { xs: 2, sm: 3 },
              py: 1.5,
              bgcolor: "rgba(0, 0, 0, 0.7)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              zIndex: 10,
            }}
          >
            <Box sx={{ minWidth: 0, pr: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "white" }} noWrap>
                {currentFile.title}
              </Typography>
              <Typography variant="caption" sx={{ color: "grey.400" }} noWrap>
                {totalSlides > 1 ? `ภาพที่ ${activeSlideIndex + 1} จาก ${totalSlides} • ` : ""}
                {activeItem.fileName}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Zoom Controls */}
              <Tooltip title="ย่อขนาด">
                <IconButton
                  size="small"
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                  sx={{ color: "grey.300", bgcolor: "rgba(255,255,255,0.08)" }}
                >
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="รีเซ็ตขนาดปกติ">
                <IconButton
                  size="small"
                  onClick={() => setZoomLevel(1)}
                  sx={{ color: "grey.300", bgcolor: "rgba(255,255,255,0.08)" }}
                >
                  <FitScreenIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="ขยายขนาด">
                <IconButton
                  size="small"
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                  sx={{ color: "grey.300", bgcolor: "rgba(255,255,255,0.08)" }}
                >
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.2)", mx: 0.5 }} />

              <Tooltip title="เปิดไฟล์ต้นฉบับ">
                <IconButton
                  size="small"
                  component="a"
                  href={activeItem.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: "grey.300", bgcolor: "rgba(255,255,255,0.08)" }}
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="ดาวน์โหลด">
                <IconButton
                  size="small"
                  component="a"
                  href={activeItem.fileUrl}
                  download={activeItem.fileName}
                  sx={{ color: "grey.300", bgcolor: "rgba(255,255,255,0.08)" }}
                >
                  <FileDownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="ปิด (Esc)">
                <IconButton
                  size="small"
                  onClick={() => setFullscreenOpen(false)}
                  sx={{ color: "white", bgcolor: "rgba(255,255,255,0.15)", ml: 1 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Fullscreen Image Display Center */}
          <Box
            sx={{
              position: "relative",
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "auto",
              p: 2,
            }}
            onClick={(e) => {
              // Clicking outside image closes fullscreen
              if (e.target === e.currentTarget) {
                setFullscreenOpen(false);
              }
            }}
          >
            <Box
              component="img"
              src={activeItem.fileUrl}
              alt={activeItem.fileName}
              sx={{
                maxWidth: "96vw",
                maxHeight: "84vh",
                objectFit: "contain",
                transform: `scale(${zoomLevel})`,
                transition: "transform 0.15s ease",
                boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
                borderRadius: 1,
              }}
            />

            {/* Left/Right Floating Navigation */}
            {totalSlides > 1 && (
              <>
                <IconButton
                  onClick={handlePrevSlide}
                  sx={{
                    position: "fixed",
                    left: 20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(30, 30, 30, 0.75)",
                    color: "white",
                    p: 1.5,
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.95)",
                      transform: "translateY(-50%) scale(1.15)",
                    },
                  }}
                  title="ภาพก่อนหน้า (←)"
                >
                  <ChevronLeftIcon sx={{ fontSize: 36 }} />
                </IconButton>

                <IconButton
                  onClick={handleNextSlide}
                  sx={{
                    position: "fixed",
                    right: 20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(30, 30, 30, 0.75)",
                    color: "white",
                    p: 1.5,
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.95)",
                      transform: "translateY(-50%) scale(1.15)",
                    },
                  }}
                  title="ภาพถัดไป (→)"
                >
                  <ChevronRightIcon sx={{ fontSize: 36 }} />
                </IconButton>
              </>
            )}
          </Box>

          {/* Fullscreen Bottom Thumbnail Bar */}
          {totalSlides > 1 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.25,
                px: 3,
                py: 1.5,
                bgcolor: "rgba(0, 0, 0, 0.75)",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                overflowX: "auto",
              }}
            >
              {gallery.map((gItem, idx) => {
                const isSelected = idx === activeSlideIndex;
                return (
                  <Box
                    key={gItem.id || idx}
                    onClick={() => {
                      setActiveSlideIndex(idx);
                      setZoomLevel(1);
                    }}
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 1.5,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: "2px solid",
                      borderColor: isSelected ? "primary.main" : "transparent",
                      opacity: isSelected ? 1 : 0.5,
                      transition: "all 0.15s ease",
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    <Box
                      component="img"
                      src={gItem.fileUrl}
                      alt={gItem.fileName}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </Dialog>
      )}
    </>
  );
}
