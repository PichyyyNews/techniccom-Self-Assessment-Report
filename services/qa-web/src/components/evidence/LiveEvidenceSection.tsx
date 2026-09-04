"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import BoltIcon from "@mui/icons-material/Bolt";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useAcademicYear } from "@/components/layout/AcademicYearContext";
import { EvidenceThumbnail } from "@/components/evidence/EvidenceThumbnail";
import { FileDetailsDialog, EvidenceFileDetails } from "@/components/evidence/FileDetailsDialog";
import { groupEvidenceFiles, GroupedEvidenceFile } from "@/lib/evidence-grouping";

interface LiveEvidenceSectionProps {
  category: string | string[];
  sectionTitle?: string;
  emptyNotice?: string;
  scope?: "all" | "my";
}

function stringToColor(string: string) {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "#2563eb",
    "#7c3aed",
    "#059669",
    "#d97706",
    "#dc2626",
    "#0891b2",
    "#4f46e5",
    "#db2777",
    "#0d9488",
  ];
  return colors[Math.abs(hash) % colors.length];
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

export function LiveEvidenceSection({
  category,
  sectionTitle = "ไฟล์หลักฐานที่จัดเก็บในระบบ",
  emptyNotice = "ยังไม่มีไฟล์หลักฐานในรอบปีการศึกษานี้",
  scope = "all",
}: LiveEvidenceSectionProps) {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;

  const { selectedYear, selectedSemester } = useAcademicYear();
  const [files, setFiles] = useState<EvidenceFileDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsFile, setDetailsFile] = useState<GroupedEvidenceFile | EvidenceFileDetails | null>(null);
  const [initialSlideIndex, setInitialSlideIndex] = useState(0);

  const fetchEvidence = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("scope", scope);
      params.set("academicYear", selectedYear);
      if (selectedSemester !== "all") {
        params.set("semester", selectedSemester);
      }

      // Support multi-category
      const categoryParam = Array.isArray(category) ? category.join(",") : category;
      params.set("category", categoryParam);
      params.set("_t", String(Date.now()));

      const res = await fetch(`/api/evidence?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.files) {
        setFiles(data.files);
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

  // Star Toggle
  const handleToggleStar = async (file: EvidenceFileDetails, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/evidence/${file.id}/star`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  metadata: {
                    ...f.metadata,
                    starredBy: data.starredBy,
                  },
                }
              : f
          )
        );
      }
    } catch (err) {
      console.error("Failed to star file:", err);
    }
  };

  const handleFileUpdated = (updated: EvidenceFileDetails) => {
    setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  const groupedFiles = React.useMemo(() => groupEvidenceFiles(files), [files]);

  return (
    <Paper sx={{ overflow: "hidden" }}>
      {/* Section Header */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.default",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.875rem" }}>
            {sectionTitle}
          </Typography>
          <Chip
            size="small"
            label={`${groupedFiles.length} รายการ${files.length > groupedFiles.length ? ` (${files.length} ไฟล์)` : ""}`}
            color="primary"
            variant="outlined"
            sx={{ height: 20, fontSize: "0.6875rem" }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Tooltip title="รีเฟรชข้อมูล">
            <IconButton size="small" onClick={fetchEvidence} sx={{ p: 0.4 }}>
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="เปิดดูในคลังหลักฐานทั้งหมด">
            <IconButton
              component={Link}
              href="/stock"
              size="small"
              sx={{ color: "text.secondary", p: 0.4 }}
            >
              <FolderSpecialIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Button
            component={Link}
            href="/quick-upload"
            variant="contained"
            size="small"
            startIcon={<BoltIcon sx={{ fontSize: 15 }} />}
            sx={{ px: 1.25, py: 0.35, fontSize: "0.75rem", fontWeight: 600 }}
          >
            อัปโหลดเพิ่ม
          </Button>
        </Box>
      </Box>

      {/* Content Area */}
      {loading ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <CircularProgress size={30} sx={{ mb: 1.5 }} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            กำลังโหลดไฟล์หลักฐาน
          </Typography>
        </Box>
      ) : groupedFiles.length === 0 ? (
        <Box sx={{ py: 6, px: 3, textAlign: "center" }}>
          <FolderSpecialIcon sx={{ fontSize: 44, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
            {emptyNotice}
          </Typography>
          <Box sx={{ mt: 1.5 }}>
            <Button
              component={Link}
              href="/quick-upload"
              size="small"
              variant="text"
              startIcon={<AddIcon />}
            >
              คลิกที่นี่เพื่อเริ่มอัปโหลดหลักฐานเข้าสู่หมวดนี้
            </Button>
          </Box>
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 50 }}></TableCell>
                <TableCell>ชื่อเอกสารและหลักฐาน</TableCell>
                <TableCell>ผู้จัดเก็บ</TableCell>
                <TableCell>วันเวลาที่อัปโหลด</TableCell>
                <TableCell>ขนาด</TableCell>
                <TableCell align="right">การจัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groupedFiles.map((file) => {
                const meta = file.metadata || {};
                const starredBy = Array.isArray(meta.starredBy) ? meta.starredBy : [];
                const isStarred = currentUserId ? starredBy.includes(currentUserId) : false;
                const tags = Array.isArray(meta.tags) ? meta.tags : [];
                const galleryCount = file.gallery?.length || 1;

                return (
                  <TableRow
                    key={file.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                      setInitialSlideIndex(0);
                      setDetailsFile(file);
                    }}
                  >
                    {/* Mini Thumbnail */}
                    <TableCell sx={{ pr: 0 }}>
                      <EvidenceThumbnail
                        fileUrl={file.fileUrl}
                        fileType={file.fileType}
                        fileName={file.fileName}
                        title={file.title}
                        variant="table"
                        gallery={file.gallery}
                      />
                    </TableCell>

                    {/* Title & Extra */}
                    <TableCell>
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: { xs: 200, sm: 320 },
                            }}
                          >
                            {file.title}
                          </Typography>
                          {galleryCount > 1 && (
                            <Chip
                              size="small"
                              label={`${galleryCount} ไฟล์`}
                              color="primary"
                              variant="outlined"
                              sx={{ height: 18, fontSize: 10, fontWeight: 700 }}
                            />
                          )}
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: { xs: 200, sm: 320 },
                          }}
                        >
                          {galleryCount > 1
                            ? `ชุดหลักฐาน ${galleryCount} รายการ (${file.fileName})`
                            : file.fileName}
                        </Typography>
                        {tags.length > 0 && (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                            {tags.slice(0, 3).map((t, idx) => (
                              <Chip key={idx} size="small" label={`#${t}`} variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </TableCell>

                    {/* Uploader */}
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar
                          src={file.user?.avatarUrl || undefined}
                          alt={file.user?.name}
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            bgcolor: stringToColor(file.user?.name || "User"),
                            color: "#ffffff",
                          }}
                        >
                          {file.user?.name ? file.user.name.charAt(0) : <PersonIcon sx={{ fontSize: 16 }} />}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {file.user?.name || "บุคลากร"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                            {file.user?.position || file.user?.roleCode || "ผู้บันทึก"}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Upload Time */}
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {formatThaiDateTime(file.createdAt)}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* File Size */}
                    <TableCell>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                        {/* Star Button */}
                        <Tooltip title={isStarred ? "เลิกติดดาว" : "ติดดาว"}>
                          <IconButton
                            size="small"
                            color={isStarred ? "warning" : "default"}
                            onClick={(e) => handleToggleStar(file, e)}
                          >
                            {isStarred ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>

                        {/* View Details */}
                        <Tooltip title="ดูรายละเอียดและพรีวิว">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setInitialSlideIndex(0);
                              setDetailsFile(file);
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* Direct Download */}
                        <Tooltip title="ดาวน์โหลดไฟล์">
                          <IconButton
                            size="small"
                            component="a"
                            href={file.fileUrl}
                            download={file.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileDownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Details & Preview Dialog */}
      <FileDetailsDialog
        open={Boolean(detailsFile)}
        file={detailsFile}
        initialSlideIndex={initialSlideIndex}
        onClose={() => setDetailsFile(null)}
        onFileUpdated={handleFileUpdated}
      />
    </Paper>
  );
}
