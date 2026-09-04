"use client";

import React, { useState, useEffect } from "react";
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
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
import SendIcon from "@mui/icons-material/Send";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SchoolIcon from "@mui/icons-material/School";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";

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

interface FileDetailsDialogProps {
  open: boolean;
  file: EvidenceFileDetails | null;
  onClose: () => void;
  onFileUpdated?: (updatedFile: EvidenceFileDetails) => void;
}

// Thai Date Formatter
function formatThaiDateTime(dateString: string) {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const months = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
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
  onClose,
  onFileUpdated,
}: FileDetailsDialogProps) {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;

  const [currentFile, setCurrentFile] = useState<EvidenceFileDetails | null>(file);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isStarring, setIsStarring] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentFile(file);
    setCommentText("");
    setCommentError(null);
  }, [file]);

  if (!currentFile) return null;

  const metadata = currentFile.metadata || {};
  const tags = Array.isArray(metadata.tags) ? metadata.tags : [];
  const starredBy = Array.isArray(metadata.starredBy) ? metadata.starredBy : [];
  const comments = Array.isArray(metadata.comments) ? metadata.comments : [];
  const isStarred = currentUserId ? starredBy.includes(currentUserId) : false;

  const lowerName = (currentFile.fileName || "").toLowerCase();
  const isImage =
    currentFile.fileType.startsWith("image/") || /\.(jpe?g|png|webp|gif|svg)$/i.test(lowerName);
  const isVideo =
    currentFile.fileType.startsWith("video/") ||
    Boolean(metadata.externalVideoUrl) ||
    /\.(mp4|mov|avi|webm)$/i.test(lowerName);
  const isPdf = currentFile.fileType.includes("pdf") || lowerName.endsWith(".pdf");

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
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {currentFile.fileName}
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
            href={currentFile.fileUrl}
            download={currentFile.fileName}
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
          {/* Left Column: Preview Area */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary" }}>
              การแสดงตัวอย่างไฟล์
            </Typography>

            <Box
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "grey.900",
                overflow: "hidden",
                minHeight: 380,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isImage ? (
                <Box
                  component="img"
                  src={currentFile.fileUrl}
                  alt={currentFile.title}
                  sx={{
                    width: "100%",
                    maxHeight: 520,
                    objectFit: "contain",
                    bgcolor: "#000",
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
                    src={currentFile.fileUrl}
                    controls
                    sx={{ width: "100%", maxHeight: 460 }}
                  />
                )
              ) : isPdf ? (
                <Box
                  component="iframe"
                  src={`${currentFile.fileUrl}#toolbar=1`}
                  sx={{ width: "100%", height: 500, border: "none", bgcolor: "#fff" }}
                  title={currentFile.title}
                />
              ) : (
                <Box sx={{ p: 4, textAlign: "center", color: "grey.300" }}>
                  <DescriptionIcon sx={{ fontSize: 64, color: "grey.500", mb: 1.5 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    {currentFile.fileName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "grey.400", mb: 2 }}>
                    ไฟล์ประเภทนี้ไม่สามารถแสดงผลแบบพรีวิวบนเบราว์เซอร์ได้โดยตรง
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    component="a"
                    href={currentFile.fileUrl}
                    download={currentFile.fileName}
                    startIcon={<FileDownloadIcon />}
                  >
                    ดาวน์โหลดเพื่อเปิดดู
                  </Button>
                </Box>
              )}
            </Box>

            {/* Preview Action Bar */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Button
                variant="outlined"
                size="small"
                component="a"
                href={currentFile.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<OpenInNewIcon />}
              >
                เปิดในหน้าต่างใหม่
              </Button>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {(currentFile.fileSize / (1024 * 1024)).toFixed(2)} MB
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
  );
}
