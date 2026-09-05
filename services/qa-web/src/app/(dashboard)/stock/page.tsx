"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/Grid";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BoltIcon from "@mui/icons-material/Bolt";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import WarningIcon from "@mui/icons-material/Warning";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAcademicYear } from "@/components/layout/AcademicYearContext";
import { EvidenceThumbnail } from "@/components/evidence/EvidenceThumbnail";
import { FileDetailsDialog, EvidenceFileDetails } from "@/components/evidence/FileDetailsDialog";
import { groupEvidenceFiles, GroupedEvidenceFile } from "@/lib/evidence-grouping";
import { PageBreadcrumbs } from "@/components/ui/PageBreadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";

const CATEGORY_MAP: Record<
  string,
  { label: string; color: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "default" }
> = {
  lesson_plan: { label: "แผนการจัดการเรียนรู้", color: "primary" },
  training_cert: { label: "วุฒิบัตรและเกียรติบัตร", color: "success" },
  training_photo: { label: "ภาพกิจกรรมอบรมและดูงาน", color: "info" },
  speaker_activity: { label: "การเป็นวิทยากรและบรรยาย", color: "secondary" },
  research: { label: "งานวิจัยและสิ่งประดิษฐ์", color: "warning" },
  student_work: { label: "ชิ้นงานและผลงานนักศึกษา", color: "error" },
  license: { label: "ใบอนุญาตและคุณวุฒิ", color: "primary" },
  other: { label: "เอกสารและโครงการทั่วไป", color: "default" },
};

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
    return `${day} ${month} ${year} ${hours}:${minutes} น.`;
  } catch {
    return dateString;
  }
}

export default function StockPage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const { selectedYear, selectedSemester, availableYears, availableSemesters } =
    useAcademicYear();

  const [files, setFiles] = useState<EvidenceFileDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<"all" | "my" | "starred">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>(selectedYear);
  const [filterSemester, setFilterSemester] = useState<string>(selectedSemester);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [detailsFile, setDetailsFile] = useState<GroupedEvidenceFile | EvidenceFileDetails | null>(null);
  const [initialSlideIndex, setInitialSlideIndex] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<GroupedEvidenceFile | EvidenceFileDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (scope === "starred") {
        params.set("starred", "true");
      } else {
        params.set("scope", scope);
      }
      if (filterCategory !== "all") params.set("category", filterCategory);
      if (filterYear !== "all") params.set("academicYear", filterYear);
      if (filterSemester !== "all") params.set("semester", filterSemester);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("_t", String(Date.now()));

      const res = await fetch(`/api/evidence?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.files) {
        setFiles(data.files);
      }
    } catch (err) {
      console.error("Failed to load evidence files:", err);
    } finally {
      setLoading(false);
    }
  }, [scope, filterCategory, filterYear, filterSemester, searchQuery]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const groupedFiles = React.useMemo(() => groupEvidenceFiles(files), [files]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const idsToDelete =
        deleteTarget.gallery && deleteTarget.gallery.length > 0
          ? deleteTarget.gallery.map((g) => g.id)
          : [deleteTarget.id];

      await Promise.all(
        idsToDelete.map((id) =>
          fetch(`/api/evidence/${id}`, { method: "DELETE" })
        )
      );

      setFiles((prev) => prev.filter((f) => !idsToDelete.includes(f.id)));
      setDeleteTarget(null);
      setSnackbarMessage("ลบไฟล์หลักฐานเรียบร้อยแล้ว");
    } catch (err: any) {
      setSnackbarMessage(err.message || "เกิดข้อผิดพลาดในการลบไฟล์");
    } finally {
      setIsDeleting(false);
    }
  };

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
              ? { ...f, metadata: { ...f.metadata, starredBy: data.starredBy } }
              : f
          )
        );
      }
    } catch (err) {
      console.error("Star toggle error:", err);
    }
  };

  const handleFileUpdated = (updated: EvidenceFileDetails) => {
    setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  const isOwnerOrRoot = (file: EvidenceFileDetails) => {
    if (!session?.user) return false;
    if ((session.user as any).role === "ROOT") return true;
    return (file as any).userId === (session.user as any).id;
  };

  const totalSizeMB = files.reduce((acc, f) => acc + f.fileSize, 0) / (1024 * 1024);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: { xs: 1.5, sm: 2.5 } }}>
      {/* Breadcrumbs Navigation */}
      <PageBreadcrumbs />

      {/* 1. Ultra-Compact Page Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, pb: 0.75, borderBottom: "1px solid", borderColor: "divider" }}>
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
            คลังไฟล์และร่องรอยหลักฐาน
          </Typography>
          <Tooltip title="ศูนย์รวมไฟล์เอกสาร วุฒิบัตร ภาพกิจกรรม และหลักฐานเพื่อจัดทำรายงานประเมินตนเอง SAR">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Chip
            size="small"
            label={`${groupedFiles.length} รายการ (${files.length} ไฟล์ • ${totalSizeMB.toFixed(1)} MB)`}
            color="primary"
            variant="outlined"
            sx={{ height: 22, fontSize: "0.725rem", display: { xs: "none", sm: "inline-flex" } }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Button
            component={Link}
            href="/quick-upload"
            variant="contained"
            size="small"
            startIcon={<BoltIcon sx={{ fontSize: 16 }} />}
            sx={{ px: 1.5, py: 0.4, fontSize: "0.75rem", fontWeight: 600 }}
          >
            อัปโหลดด่วน
          </Button>
        </Box>
      </Box>

      {/* 2. Compact Filter Toolbar */}
      <Paper sx={{ p: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, alignItems: { xs: "stretch", lg: "center" }, justifyContent: "space-between", gap: 1 }}>
          <Tabs
            value={scope}
            onChange={(_, val) => setScope(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            textColor="primary"
            indicatorColor="primary"
            sx={{ minHeight: 32, "& .MuiTab-root": { minHeight: 32, py: 0.25, px: 1.25, fontSize: "0.8rem" } }}
          >
            <Tab label="ไฟล์ทั้งหมดในวิทยาลัย" value="all" />
            <Tab label="เฉพาะไฟล์ของฉัน" value="my" />
            <Tab label="ที่ติดดาวไว้" value="starred" icon={<StarIcon sx={{ fontSize: 14 }} />} iconPosition="start" />
          </Tabs>

          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
            <TextField
              size="small"
              placeholder="ค้นหาชื่อไฟล์ หัวข้อ หรือแท็ก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: "text.secondary" }} /></InputAdornment>,
                  endAdornment: searchQuery ? <InputAdornment position="end"><IconButton size="small" onClick={() => setSearchQuery("")}><CloseIcon fontSize="small" /></IconButton></InputAdornment> : null,
                  sx: { height: 32, fontSize: "0.8125rem" }
                }
              }}
              sx={{ width: { xs: "100%", sm: 220, md: 240 } }}
            />

            <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 150 }, flex: { xs: "1 1 100%", sm: "initial" } }}>
              <InputLabel sx={{ fontSize: "0.8rem", top: -3 }}>หมวดหมู่หลักฐาน</InputLabel>
              <Select
                value={filterCategory}
                label="หมวดหมู่หลักฐาน"
                onChange={(e) => setFilterCategory(e.target.value)}
                sx={{ height: 32, fontSize: "0.8125rem" }}
              >
                <MenuItem value="all" sx={{ fontSize: "0.8125rem" }}>ทุกหมวดหมู่ ({files.length})</MenuItem>
                {Object.entries(CATEGORY_MAP).map(([catKey, catMeta]) => (
                  <MenuItem key={catKey} value={catKey} sx={{ fontSize: "0.8125rem" }}>
                    {catMeta.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { xs: "calc(50% - 6px)", sm: 105 }, flex: { xs: "1 1 calc(50% - 6px)", sm: "initial" } }}>
              <InputLabel sx={{ fontSize: "0.8rem", top: -3 }}>ปีการศึกษา</InputLabel>
              <Select
                value={filterYear}
                label="ปีการศึกษา"
                onChange={(e) => setFilterYear(e.target.value)}
                sx={{ height: 32, fontSize: "0.8125rem" }}
              >
                {availableYears.map((y) => (
                  <MenuItem key={y} value={y} sx={{ fontSize: "0.8125rem" }}>ปี {y}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { xs: "calc(50% - 6px)", sm: 95 }, flex: { xs: "1 1 calc(50% - 6px)", sm: "initial" } }}>
              <InputLabel sx={{ fontSize: "0.8rem", top: -3 }}>ภาคเรียน</InputLabel>
              <Select
                value={filterSemester}
                label="ภาคเรียน"
                onChange={(e) => setFilterSemester(e.target.value)}
                sx={{ height: 32, fontSize: "0.8125rem" }}
              >
                {availableSemesters.map((s) => (
                  <MenuItem key={s.value} value={s.value} sx={{ fontSize: "0.8125rem" }}>{s.shortLabel}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(_, val) => val && setViewMode(val)}
              sx={{ height: 32 }}
            >
              <ToggleButton value="list" aria-label="list view" sx={{ px: 0.8, py: 0.2 }}>
                <Tooltip title="มุมมองตาราง (List View)">
                  <ViewListIcon sx={{ fontSize: 18 }} />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="grid" aria-label="grid view" sx={{ px: 0.8, py: 0.2 }}>
                <Tooltip title="มุมมองการ์ด (Grid View)">
                  <GridViewIcon sx={{ fontSize: 18 }} />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            <Tooltip title="รีเฟรชข้อมูล">
              <IconButton size="small" onClick={fetchFiles} sx={{ p: 0.4 }}>
                <RefreshIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ py: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
          <CircularProgress size={36} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            กำลังโหลดรายการไฟล์หลักฐาน...
          </Typography>
        </Box>
      ) : files.length === 0 ? (
        <EmptyState
          icon={<FolderSpecialIcon sx={{ fontSize: 48 }} />}
          title="ไม่พบไฟล์หลักฐานตามเงื่อนไขที่เลือก"
          description="ยังไม่มีการอัปโหลดไฟล์หลักฐานในหมวดหมู่นี้ หรือไม่พบข้อมูลตามคำค้นหา คุณสามารถอัปโหลดไฟล์ใหม่ได้ทันที"
          actionLabel="อัปโหลดไฟล์หลักฐาน (Quick Upload)"
          actionHref="/quick-upload"
          actionIcon={<BoltIcon sx={{ fontSize: 16 }} />}
        />
      ) : viewMode === "list" ? (
        <Paper sx={{ overflow: "hidden" }}>
          <TableContainer sx={{ overflowX: "auto", width: "100%" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 50 }}></TableCell>
                  <TableCell>ชื่อเอกสาร</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>หมวดหมู่</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>ผู้จัดเก็บ</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>วันเวลาที่อัปโหลด</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>ขนาด</TableCell>
                  <TableCell align="right">การจัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedFiles.map((file) => {
                  const cat = CATEGORY_MAP[file.category] || { label: file.category, color: "default" };
                  const isOwner = isOwnerOrRoot(file);
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
                                maxWidth: { xs: 150, sm: 280 },
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
                              maxWidth: { xs: 150, sm: 280 },
                            }}
                          >
                            {galleryCount > 1
                              ? `ชุดหลักฐาน ${galleryCount} รายการ (${file.fileName})`
                              : file.fileName}
                          </Typography>
                          <Box sx={{ display: { xs: "flex", sm: "none" }, alignItems: "center", gap: 0.5, mt: 0.25, flexWrap: "wrap" }}>
                            <Chip size="small" label={cat.label} color={cat.color} variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.6875rem" }}>
                              {formatThaiDateTime(file.createdAt)}
                            </Typography>
                          </Box>
                          {tags.length > 0 && (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                              {tags.slice(0, 3).map((t, idx) => (
                                <Chip key={idx} size="small" label={`#${t}`} variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                              ))}
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                        <Chip size="small" label={cat.label} color={cat.color} variant="outlined" />
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
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
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{file.user?.name || "บุคลากร"}</Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>{file.user?.position || file.user?.roleCode || "ผู้บันทึก"}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>{formatThaiDateTime(file.createdAt)}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>{(file.fileSize / (1024 * 1024)).toFixed(2)} MB</Typography>
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                          <Tooltip title={isStarred ? "เลิกติดดาว" : "ติดดาว"}><IconButton size="small" color={isStarred ? "warning" : "default"} onClick={(e) => handleToggleStar(file, e)}>{isStarred ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}</IconButton></Tooltip>
                          <Tooltip title="ดูรายละเอียดและพรีวิว"><IconButton size="small" onClick={() => { setInitialSlideIndex(0); setDetailsFile(file); }}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="ดาวน์โหลด"><IconButton size="small" component="a" href={file.fileUrl} download={file.fileName} target="_blank" rel="noopener noreferrer"><FileDownloadIcon fontSize="small" /></IconButton></Tooltip>
                          {isOwner && <Tooltip title="ลบไฟล์"><IconButton size="small" color="error" onClick={() => setDeleteTarget(file)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
          {groupedFiles.map((file) => {
            const cat = CATEGORY_MAP[file.category] || { label: file.category, color: "default" };
            const isOwner = isOwnerOrRoot(file);
            const meta = file.metadata || {};
            const starredBy = Array.isArray(meta.starredBy) ? meta.starredBy : [];
            const isStarred = currentUserId ? starredBy.includes(currentUserId) : false;
            const tags = Array.isArray(meta.tags) ? meta.tags : [];
            const galleryCount = file.gallery?.length || 1;

            return (
              <Paper
                key={file.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease",
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: 2,
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={() => {
                  setInitialSlideIndex(0);
                  setDetailsFile(file);
                }}
              >
                <EvidenceThumbnail
                  fileUrl={file.fileUrl}
                  fileType={file.fileType}
                  fileName={file.fileName}
                  title={file.title}
                  variant="card"
                  height={150}
                  gallery={file.gallery}
                  onClickThumbnail={(slideIdx) => {
                    setInitialSlideIndex(slideIdx);
                    setDetailsFile(file);
                  }}
                  onOpenFullscreen={(slideIdx) => {
                    setInitialSlideIndex(slideIdx);
                    setDetailsFile(file);
                  }}
                />
                <Box sx={{ p: 1.75, display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Chip size="small" label={cat.label} color={cat.color} variant="outlined" sx={{ height: 22, fontSize: "0.6875rem", fontWeight: 600 }} />
                        {galleryCount > 1 && (
                          <Chip
                            size="small"
                            label={`${galleryCount} ภาพ`}
                            color="primary"
                            variant="filled"
                            sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }}
                          />
                        )}
                      </Box>
                      <IconButton
                        size="small"
                        color={isStarred ? "warning" : "default"}
                        onClick={(e) => handleToggleStar(file, e)}
                        title={isStarred ? "เลิกติดดาว" : "ติดดาว"}
                        sx={{ p: 0.35 }}
                      >
                        {isStarred ? <StarIcon sx={{ fontSize: 18 }} /> : <StarBorderIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", mb: 0.25, color: "text.primary" }}>
                      {file.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", mb: 0.75, fontSize: "0.725rem" }}>
                      {galleryCount > 1 ? `ชุดไฟล์ ${galleryCount} รายการ` : file.fileName}
                    </Typography>
                    {tags.length > 0 && (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 0.75 }}>
                        {tags.slice(0, 2).map((t, idx) => (
                          <Chip key={idx} size="small" label={`#${t}`} variant="filled" sx={{ height: 18, fontSize: "0.625rem" }} />
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* Prominent Uploader Footer with Avatar */}
                  <Box
                    sx={{
                      pt: 1.25,
                      mt: 1,
                      borderTop: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, mr: 0.5 }}>
                      <Tooltip title={`อัปโหลดโดย ${file.user?.name || "บุคลากร"}${file.user?.position || file.user?.roleCode ? ` (${file.user.position || file.user.roleCode})` : ""}`}>
                        <Avatar
                          src={file.user?.avatarUrl || undefined}
                          alt={file.user?.name}
                          sx={{
                            width: 36,
                            height: 36,
                            fontSize: "0.875rem",
                            fontWeight: 700,
                            bgcolor: stringToColor(file.user?.name || "User"),
                            color: "#ffffff",
                            border: "2px solid",
                            borderColor: "background.paper",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                            flexShrink: 0,
                            transition: "transform 0.15s ease",
                            "&:hover": { transform: "scale(1.08)" },
                          }}
                        >
                          {file.user?.name ? file.user.name.charAt(0) : <PersonIcon sx={{ fontSize: 18 }} />}
                        </Avatar>
                      </Tooltip>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: "0.775rem",
                            lineHeight: 1.25,
                          }}
                          title={file.user?.name || "บุคลากร"}
                        >
                          {file.user?.name || "บุคลากร"}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontSize: "0.6875rem",
                            display: "block",
                            lineHeight: 1.2,
                            mt: 0.25,
                          }}
                        >
                          {formatThaiDateTime(file.createdAt)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, flexShrink: 0 }}>
                      <Tooltip title="ดูรายละเอียด">
                        <IconButton size="small" onClick={() => { setInitialSlideIndex(0); setDetailsFile(file); }} sx={{ p: 0.5 }}>
                          <VisibilityIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ดาวน์โหลด">
                        <IconButton size="small" component="a" href={file.fileUrl} download={file.fileName} target="_blank" rel="noopener noreferrer" sx={{ p: 0.5 }}>
                          <FileDownloadIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      {isOwner && (
                        <Tooltip title="ลบไฟล์">
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget(file)} sx={{ p: 0.5 }}>
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      <FileDetailsDialog
        open={Boolean(detailsFile)}
        file={detailsFile}
        initialSlideIndex={initialSlideIndex}
        onClose={() => setDetailsFile(null)}
        onFileUpdated={handleFileUpdated}
      />

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        {deleteTarget && (
          <>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "error.main" }}><WarningIcon color="error" /><Typography variant="h4" sx={{ color: "error.main" }}>ยืนยันการลบไฟล์หลักฐาน</Typography></DialogTitle>
            <DialogContent dividers><Typography variant="body2" sx={{ color: "text.primary" }}>ท่านต้องการลบไฟล์ &ldquo;{deleteTarget.title}&rdquo; หรือไม่</Typography><Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>การดำเนินการนี้จะลบไฟล์ออกจากคลังหลักฐานอย่างถาวร</Typography></DialogContent>
            <DialogActions sx={{ px: 3, py: 1.5 }}><Button onClick={() => setDeleteTarget(null)} color="secondary" disabled={isDeleting}>ยกเลิก</Button><Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting}>{isDeleting ? "กำลังลบ" : "ลบไฟล์ข้อมูล"}</Button></DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={Boolean(snackbarMessage)} autoHideDuration={3000} onClose={() => setSnackbarMessage(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbarMessage(null)} severity="success" sx={{ width: "100%" }}>{snackbarMessage}</Alert>
      </Snackbar>
    </Box>
  );
}
