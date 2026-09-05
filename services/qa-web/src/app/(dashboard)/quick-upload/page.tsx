"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import Autocomplete from "@mui/material/Autocomplete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import MicIcon from "@mui/icons-material/Mic";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import PaletteIcon from "@mui/icons-material/Palette";
import BadgeIcon from "@mui/icons-material/Badge";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAcademicYear } from "@/components/layout/AcademicYearContext";
import { PageBreadcrumbs } from "@/components/ui/PageBreadcrumbs";

interface UploadCard {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ sx?: any }>;
  badge: string;
  badgeColor?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
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
    description: "จัดเก็บแผนการสอน บันทึกหลังสอน และเกณฑ์การวัดประเมินผล",
    icon: MenuBookIcon,
    badge: "เกณฑ์ SAR มาตรฐาน 2",
    badgeColor: "primary",
    linkedUrl: "/teachers/lesson-plans",
    linkedTitle: "หน้าแผนการจัดการเรียนรู้",
  },
  {
    id: "training_cert",
    category: "training_cert",
    title: "วุฒิบัตรและเกียรติบัตร",
    subtitle: "การพัฒนาวิชาชีพครู",
    description: "วุฒิบัตรผ่านการอบรม สัมมนา พัฒนาทักษะวิชาชีพทั้งภายในและภายนอก",
    icon: WorkspacePremiumIcon,
    badge: "การพัฒนาวิชาชีพ",
    badgeColor: "success",
    linkedUrl: "/teachers/trainings",
    linkedTitle: "หน้าการพัฒนาวิชาชีพ",
  },
  {
    id: "training_photo",
    category: "training_photo",
    title: "ภาพกิจกรรมอบรมและดูงาน",
    subtitle: "ร่องรอยการเรียนรู้",
    description: "ประมวลภาพถ่ายการเข้าร่วมประชุม สัมมนา ศึกษาดูงาน และการปฏิบัติหน้าที่",
    icon: PhotoCameraIcon,
    badge: "ภาพกิจกรรม",
    badgeColor: "info",
    linkedUrl: "/teachers/trainings",
    linkedTitle: "หน้าการพัฒนาวิชาชีพ",
    isMediaRich: true,
  },
  {
    id: "speaker_activity",
    category: "speaker_activity",
    title: "วิทยากรและบริการวิชาชีพ",
    subtitle: "หนังสือเชิญและภาพบรรยาย",
    description: "การทำหน้าที่วิทยากรบรรยาย ให้ความรู้แก่ชุมชนและสถานประกอบการ",
    icon: MicIcon,
    badge: "บริการวิชาการ",
    badgeColor: "secondary",
    linkedUrl: "/teachers/trainings",
    linkedTitle: "หน้าการพัฒนาวิชาชีพ",
    isMediaRich: true,
  },
  {
    id: "research",
    category: "research",
    title: "งานวิจัยและสิ่งประดิษฐ์",
    subtitle: "นวัตกรรมและสื่อการสอน",
    description: "รายงานวิจัยในชั้นเรียน เอกสารสิ่งประดิษฐ์คนรุ่นใหม่ และสิทธิบัตร",
    icon: LightbulbIcon,
    badge: "เกณฑ์ SAR มาตรฐาน 3",
    badgeColor: "warning",
    linkedUrl: "/teachers/researches",
    linkedTitle: "หน้างานวิจัยและนวัตกรรม",
  },
  {
    id: "student_work",
    category: "student_work",
    title: "ชิ้นงานและผลงานนักศึกษา",
    subtitle: "หลักฐานสมรรถนะผู้เรียน",
    description: "ผลงานนักเรียน ชิ้นงานโครงงาน รางวัลการแข่งขันทักษะวิชาชีพ",
    icon: PaletteIcon,
    badge: "เกณฑ์ SAR มาตรฐาน 1",
    badgeColor: "error",
    linkedUrl: "/students/competencies",
    linkedTitle: "หน้าสมรรถนะนักเรียน",
    isMediaRich: true,
  },
  {
    id: "license",
    category: "license",
    title: "ใบอนุญาตและคุณวุฒิ",
    subtitle: "คุรุสภา TPQI DSD กว",
    description: "สแกนบัตรหรือเอกสารใบรับรองมาตรฐานวิชาชีพ และหนังสือผ่อนผัน",
    icon: BadgeIcon,
    badge: "มาตรฐานวิชาชีพ",
    badgeColor: "primary",
    linkedUrl: "/profile",
    linkedTitle: "หน้าโปรไฟล์",
  },
  {
    id: "other",
    category: "other",
    title: "ประกันคุณภาพและโครงการ",
    subtitle: "เอกสารร่องรอย SAR ทั่วไป",
    description: "คำสั่งแต่งตั้ง รายงานผลการดำเนินงานโครงการ และเอกสารหลักฐานอื่นๆ",
    icon: FolderSpecialIcon,
    badge: "SAR หลักฐาน",
    badgeColor: "secondary",
    linkedUrl: "/stock",
    linkedTitle: "หน้าคลังหลักฐาน",
  },
];

export default function QuickUploadPage() {
  const { selectedYear, selectedSemester, termLabel, availableYears, availableSemesters } =
    useAcademicYear();

  const [activeModalCard, setActiveModalCard] = useState<UploadCard | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [organization, setOrganization] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [trainingHours, setTrainingHours] = useState("");
  const [externalVideoUrl, setExternalVideoUrl] = useState("");
  const [uploadYear, setUploadYear] = useState(selectedYear);
  const [uploadSemester, setUploadSemester] = useState(selectedSemester);

  // Upload status
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openUploadModal = (card: UploadCard, initialFiles?: File[]) => {
    setActiveModalCard(card);
    setUploadYear(selectedYear);
    setUploadSemester(selectedSemester);
    const filesToSet = initialFiles || [];
    setSelectedFiles(filesToSet);
    setTitle(filesToSet.length > 0 ? filesToSet[0].name.replace(/\.[^/.]+$/, "") : "");
    setDescription("");
    setLocation("");
    setOrganization("");
    setEventDate(new Date().toISOString().split("T")[0]);
    setSubjectCode("");
    setGradeLevel("");
    setTrainingHours("");
    setExternalVideoUrl("");
    setTags([card.badge.replace(/\s+/g, "")]);
    setErrorMessage("");
    setUploadSuccess(null);
  };

  const handleCardDragOver = (e: React.DragEvent, cardId: string) => {
    e.preventDefault();
    setDragOverCardId(cardId);
  };

  const handleCardLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCardId(null);
  };

  const handleCardDrop = (e: React.DragEvent, card: UploadCard) => {
    e.preventDefault();
    setDragOverCardId(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      openUploadModal(card, filesArray);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      if (!title && newFiles[0]) {
        setTitle(newFiles[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("กรุณาระบุชื่อเอกสารหรือหัวข้อหลักฐาน");
      return;
    }
    if (selectedFiles.length === 0 && !externalVideoUrl.trim()) {
      setErrorMessage("กรุณาเลือกไฟล์เอกสารหรือรูปภาพ หรือระบุลิงก์วิดีโอ");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("title", title.trim());
      if (description.trim()) formData.append("description", description.trim());
      formData.append("category", activeModalCard?.category || "other");
      formData.append("academicYear", uploadYear);
      formData.append("semester", uploadSemester);
      formData.append("tags", JSON.stringify(tags));
      if (location.trim()) formData.append("location", location.trim());
      if (organization.trim()) formData.append("organization", organization.trim());
      if (eventDate) formData.append("eventDate", eventDate);
      if (subjectCode.trim()) formData.append("subjectCode", subjectCode.trim());
      if (gradeLevel.trim()) formData.append("gradeLevel", gradeLevel.trim());
      if (trainingHours.trim()) formData.append("trainingHours", trainingHours.trim());
      if (externalVideoUrl.trim()) formData.append("externalVideoUrl", externalVideoUrl.trim());

      const res = await fetch("/api/evidence/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการอัปโหลด");
      }

      setUploadSuccess(data);
      setSnackbarOpen(true);
    } catch (err: any) {
      setErrorMessage(err.message || "เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.25, sm: 2 }, maxWidth: 1300, mx: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* 0. Breadcrumbs */}
      <PageBreadcrumbs
        items={[
          { label: "หน้าหลัก", href: "/dashboard" },
          { label: "ทางลัดอัปโหลดด่วน" },
        ]}
      />

      {/* 1. Ultra-Compact Page Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          pb: 0.75,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="กลับหน้าหลัก">
            <IconButton
              component={Link}
              href="/dashboard"
              size="small"
              sx={{ color: "text.secondary", p: 0.4 }}
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Typography variant="h2" sx={{ fontWeight: 700, fontSize: "1.125rem", color: "text.primary" }}>
            ทางลัดอัปโหลดด่วน
          </Typography>
          <Tooltip title="เลือกหมวดหมู่หรือลากวางไฟล์ เพื่อบันทึกลงคลังหลักฐานและเชื่อมโยงสู่ระบบงานอัตโนมัติ">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Chip
            icon={<CalendarTodayIcon sx={{ fontSize: 13 }} />}
            label={`รอบข้อมูลปัจจุบัน ${termLabel}`}
            variant="outlined"
            color="primary"
            size="small"
            sx={{ height: 22, fontSize: "0.725rem", display: { xs: "none", sm: "inline-flex" } }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Button
            component={Link}
            href="/stock"
            variant="outlined"
            size="small"
            startIcon={<FolderSpecialIcon sx={{ fontSize: 16 }} />}
            sx={{ px: 1.25, py: 0.4, fontSize: "0.75rem", fontWeight: 600 }}
          >
            ไปยังคลังหลักฐาน
          </Button>
        </Box>
      </Box>

      {/* 2. Interactive Compact App Grid Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 1.5,
        }}
      >
        {UPLOAD_CARDS.map((card) => {
          const Icon = card.icon;
          const isDragOver = dragOverCardId === card.id;

          return (
            <Paper
              key={card.id}
              onDragOver={(e) => handleCardDragOver(e, card.id)}
              onDragLeave={handleCardLeave}
              onDrop={(e) => handleCardDrop(e, card)}
              onClick={() => openUploadModal(card)}
              sx={{
                p: 1.5,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                transition: "all 0.15s ease-in-out",
                borderColor: isDragOver ? "primary.main" : "divider",
                bgcolor: isDragOver ? "primary.50" : "background.paper",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "background.default",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    width: 36,
                    height: 36,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1.5,
                    bgcolor: "primary.50",
                    color: "primary.main",
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                </Box>
                <Chip
                  size="small"
                  label={card.badge}
                  color={card.badgeColor || "default"}
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.6875rem" }}
                />
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="h4" sx={{ color: "text.primary", mb: 0.25, fontSize: "0.875rem", fontWeight: 700 }}>
                  {card.title}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "primary.main", display: "block", fontSize: "0.725rem" }}>
                  {card.subtitle}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    mt: 0.25,
                    fontSize: "0.725rem",
                    lineHeight: 1.35,
                  }}
                >
                  {card.description}
                </Typography>
              </Box>

              <Box
                sx={{
                  pt: 1,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.725rem" }}>
                  {card.linkedTitle}
                </Typography>
                <ArrowForwardIcon sx={{ fontSize: 13, color: "text.secondary" }} />
              </Box>

                {isDragOver && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 3,
                      bgcolor: "rgba(30, 64, 175, 0.9)",
                      color: "#ffffff",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      zIndex: 10,
                    }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 36 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      ปล่อยไฟล์เพื่ออัปโหลด
                    </Typography>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>

      {/* 3. Upload Modal (MUI Dialog) */}
      <Dialog
        open={Boolean(activeModalCard)}
        onClose={() => setActiveModalCard(null)}
        maxWidth="sm"
        fullWidth
      >
        {activeModalCard && (
          <>
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    width: 36,
                    height: 36,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1.5,
                    bgcolor: "primary.50",
                    color: "primary.main",
                  }}
                >
                  <activeModalCard.icon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="h4">
                    อัปโหลด {activeModalCard.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    จัดเก็บและเชื่อมโยงไปยัง {activeModalCard.linkedTitle} อัตโนมัติ
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={() => setActiveModalCard(null)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
              {uploadSuccess ? (
                <Box sx={{ py: 3, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 56, color: "success.main" }} />
                  <Typography variant="h3" sx={{ color: "text.primary" }}>
                    {uploadSuccess.count && uploadSuccess.count > 1
                      ? `อัปโหลดสำเร็จทั้งหมด ${uploadSuccess.count} รายการ`
                      : "อัปโหลดและจัดหมวดหมู่สำเร็จ"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 420 }}>
                    หลักฐานชุด &ldquo;{title}&rdquo; ถูกบันทึกลงในคลังหลักฐาน และเชื่อมโยงไปยัง {activeModalCard.linkedTitle} เรียบร้อยแล้ว
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1, mt: 2, width: "100%", justifyContent: "center" }}>
                    <Button
                      component={Link}
                      href={activeModalCard.linkedUrl}
                      variant="contained"
                      size="small"
                    >
                      เปิดดูใน {activeModalCard.linkedTitle}
                    </Button>
                    <Button
                      component={Link}
                      href="/stock"
                      variant="outlined"
                      size="small"
                      startIcon={<FolderSpecialIcon />}
                    >
                      ดูในคลังหลักฐาน
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => openUploadModal(activeModalCard)}
                    >
                      อัปโหลดชุดอื่นเพิ่ม
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {errorMessage && (
                    <Alert severity="error">
                      {errorMessage}
                    </Alert>
                  )}

                  {/* Multi-File Picker / Drop zone */}
                  <Paper
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      p: 2.5,
                      textAlign: "center",
                      cursor: "pointer",
                      borderStyle: "dashed",
                      borderWidth: 2,
                      borderColor: selectedFiles.length > 0 ? "success.main" : "divider",
                      bgcolor: selectedFiles.length > 0 ? "success.50" : "background.default",
                      "&:hover": { borderColor: "primary.main" },
                    }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 36, color: "primary.main", mb: 0.5 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      คลิกเพื่อเลือกไฟล์ หรือลากไฟล์หลายไฟล์มาวางที่นี่
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      รองรับการเลือกหลายไฟล์พร้อมกัน (PDF รูปภาพ วิดีโอ หรือเอกสาร)
                    </Typography>
                  </Paper>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />

                  {/* Queued Files List */}
                  {selectedFiles.length > 0 && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                          ไฟล์ที่เลือก ({selectedFiles.length} รายการ)
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => fileInputRef.current?.click()}
                          sx={{ fontSize: 12, p: 0 }}
                        >
                          + เพิ่มไฟล์อีก
                        </Button>
                      </Box>
                      <Box sx={{ maxHeight: 150, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0.75 }}>
                        {selectedFiles.map((file, idx) => (
                          <Paper
                            key={idx}
                            variant="outlined"
                            sx={{
                              p: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              bgcolor: "grey.50",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                              <InsertDriveFileIcon fontSize="small" sx={{ color: "primary.main" }} />
                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: 13,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    maxWidth: 320,
                                  }}
                                >
                                  {file.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: 11 }}>
                                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </Typography>
                              </Box>
                            </Box>
                            <IconButton size="small" color="error" onClick={() => handleRemoveFile(idx)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Paper>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Document Title */}
                  <TextField
                    label="ชื่อเอกสารหรือหัวข้อหลักฐาน"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    fullWidth
                    size="small"
                  />

                  {/* Tags Input (Autocomplete with freeSolo) */}
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[
                      "SAR68",
                      "มาตรฐาน1",
                      "มาตรฐาน2",
                      "มาตรฐาน3",
                      "นวัตกรรม",
                      "การอบรม",
                      "บริการวิชาชีพ",
                      "ผลงานนักศึกษา",
                      "เกียรติบัตร",
                    ]}
                    value={tags}
                    onChange={(_, newVal) => setTags(newVal)}
                    renderValue={(value, getItemProps) =>
                      value.map((option, index) => {
                        const { key, ...itemProps } = getItemProps({ index });
                        return (
                          <Chip
                            key={key}
                            variant="outlined"
                            label={`#${option}`}
                            size="small"
                            {...itemProps}
                          />
                        );
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="ป้ายกำกับเพิ่มเติม (Tags)"
                        placeholder="พิมพ์แท็กแล้วกด Enter"
                        helperText="พิมพ์แท็กเพื่อความสะดวกในการค้นหา เช่น SAR68, มาตรฐาน2, ผลงานเด่น"
                      />
                    )}
                  />

                  {/* Term Selectors */}
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>ปีการศึกษา</InputLabel>
                      <Select
                        value={uploadYear}
                        label="ปีการศึกษา"
                        onChange={(e) => setUploadYear(e.target.value)}
                      >
                        {availableYears.map((y) => (
                          <MenuItem key={y} value={y}>
                            {y}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" fullWidth>
                      <InputLabel>ภาคเรียน</InputLabel>
                      <Select
                        value={uploadSemester}
                        label="ภาคเรียน"
                        onChange={(e) => setUploadSemester(e.target.value)}
                      >
                        {availableSemesters.map((s) => (
                          <MenuItem key={s.value} value={s.value}>
                            {s.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Contextual Fields */}
                  {activeModalCard.category === "lesson_plan" && (
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                      <TextField
                        label="รหัสวิชา"
                        value={subjectCode}
                        onChange={(e) => setSubjectCode(e.target.value)}
                        size="small"
                      />
                      <TextField
                        label="ระดับชั้น"
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(e.target.value)}
                        size="small"
                      />
                    </Box>
                  )}

                  {(activeModalCard.category === "training_photo" ||
                    activeModalCard.category === "speaker_activity" ||
                    activeModalCard.category === "training_cert") && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                        <TextField
                          label="สถานที่จัดกิจกรรม"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          size="small"
                        />
                        <TextField
                          label="หน่วยงานที่จัด"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          size="small"
                        />
                      </Box>
                      <TextField
                        label="จำนวนชั่วโมงอบรม (ชม.)"
                        type="number"
                        value={trainingHours}
                        onChange={(e) => setTrainingHours(e.target.value)}
                        size="small"
                        placeholder="เช่น 6, 12, 18, 20"
                        helperText="ใช้คำนวณสะสมตามเกณฑ์ SAR มาตรฐาน 2 (เกณฑ์ขั้นต่ำ 20 ชม./ปี)"
                      />
                    </Box>
                  )}

                  <TextField
                    label="คำอธิบายเพิ่มเติม"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={2}
                    size="small"
                    fullWidth
                  />

                  {/* External video link (optional) */}
                  {activeModalCard.isMediaRich && (
                    <TextField
                      label="ลิงก์คลิปวิดีโอภายนอก (YouTube หรือ Google Drive)"
                      value={externalVideoUrl}
                      onChange={(e) => setExternalVideoUrl(e.target.value)}
                      size="small"
                      fullWidth
                    />
                  )}

                  {isUploading && (
                    <Box sx={{ py: 1 }}>
                      <LinearProgress />
                      <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>
                        กำลังอัปโหลดเอกสารไปยังคลังข้อมูล
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </DialogContent>

            {!uploadSuccess && (
              <DialogActions sx={{ px: 3, py: 1.5 }}>
                <Button onClick={() => setActiveModalCard(null)} color="secondary" disabled={isUploading}>
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={isUploading || (selectedFiles.length === 0 && !externalVideoUrl.trim())}
                >
                  {isUploading
                    ? "กำลังบันทึก"
                    : selectedFiles.length > 1
                    ? `บันทึกข้อมูล (${selectedFiles.length} ไฟล์)`
                    : "บันทึกข้อมูล"}
                </Button>
              </DialogActions>
            )}
          </>
        )}
      </Dialog>

      {/* Snackbar Toast Feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%" }}>
          อัปโหลดและจัดหมวดหมู่ข้อมูลสำเร็จ
        </Alert>
      </Snackbar>
    </Box>
  );
}
