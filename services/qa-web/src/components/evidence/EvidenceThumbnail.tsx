"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

interface EvidenceThumbnailProps {
  fileUrl: string;
  fileType: string;
  fileName: string;
  title?: string;
  variant?: "table" | "card" | "full";
  height?: number | string;
}

export function EvidenceThumbnail({
  fileUrl,
  fileType,
  fileName,
  title,
  variant = "card",
  height = 140,
}: EvidenceThumbnailProps) {
  const [imgError, setImgError] = useState(false);

  const lowerName = (fileName || "").toLowerCase();
  const isImage = fileType.startsWith("image/") || /\.(jpe?g|png|webp|gif|svg)$/i.test(lowerName);
  const isVideo = fileType.startsWith("video/") || /\.(mp4|mov|avi|webm)$/i.test(lowerName);
  const isPdf = fileType.includes("pdf") || lowerName.endsWith(".pdf");
  const isSpreadsheet =
    fileType.includes("excel") ||
    fileType.includes("spreadsheet") ||
    /\.(xlsx?|csv)$/i.test(lowerName);
  const isPresentation =
    fileType.includes("presentation") ||
    fileType.includes("powerpoint") ||
    /\.(pptx?)$/i.test(lowerName);
  const isArchive =
    fileType.includes("zip") ||
    fileType.includes("rar") ||
    fileType.includes("tar") ||
    /\.(zip|rar|7z|tar|gz)$/i.test(lowerName);

  // Variant: "table" (Mini thumbnail for table rows)
  if (variant === "table") {
    if (isImage && !imgError) {
      return (
        <Box
          component="img"
          src={fileUrl}
          alt={title || fileName}
          onError={() => setImgError(true)}
          sx={{
            width: 42,
            height: 42,
            borderRadius: 1.5,
            objectFit: "cover",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "grey.100",
            flexShrink: 0,
          }}
        />
      );
    }

    return (
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
          bgcolor: isPdf
            ? "error.50"
            : isVideo
            ? "secondary.50"
            : isSpreadsheet
            ? "success.50"
            : isPresentation
            ? "warning.50"
            : isArchive
            ? "amber.50"
            : "primary.50",
          color: isPdf
            ? "error.main"
            : isVideo
            ? "secondary.main"
            : isSpreadsheet
            ? "success.main"
            : isPresentation
            ? "warning.main"
            : isArchive
            ? "warning.dark"
            : "primary.main",
        }}
      >
        {isPdf ? (
          <PictureAsPdfIcon sx={{ fontSize: 22 }} />
        ) : isVideo ? (
          <PlayCircleFilledWhiteIcon sx={{ fontSize: 22 }} />
        ) : isSpreadsheet ? (
          <TableChartIcon sx={{ fontSize: 22 }} />
        ) : isPresentation ? (
          <SlideshowIcon sx={{ fontSize: 22 }} />
        ) : isArchive ? (
          <FolderZipIcon sx={{ fontSize: 22 }} />
        ) : (
          <DescriptionIcon sx={{ fontSize: 22 }} />
        )}
      </Box>
    );
  }

  // Variant: "card" (Card cover for grid view)
  if (isImage && !imgError) {
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height,
          borderRadius: 1.5,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "grey.100",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          component="img"
          src={fileUrl}
          alt={title || fileName}
          onError={() => setImgError(true)}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.2s ease-in-out",
            "&:hover": {
              transform: "scale(1.03)",
            },
          }}
        />
      </Box>
    );
  }

  if (isVideo) {
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height,
          borderRadius: 1.5,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "#0f172a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          color: "white",
        }}
      >
        <PlayCircleFilledWhiteIcon sx={{ fontSize: 44, color: "secondary.light" }} />
        <Typography variant="caption" sx={{ color: "grey.300", fontWeight: 600 }}>
          ไฟล์วิดีโอคลิป
        </Typography>
      </Box>
    );
  }

  if (isPdf) {
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height,
          borderRadius: 1.5,
          border: "1px solid",
          borderColor: "error.200",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          p: 2,
          overflow: "hidden",
          backgroundImage: "linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, rgba(255, 255, 255, 0) 100%)",
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: "error.50",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "error.main",
            boxShadow: 1,
          }}
        >
          <PictureAsPdfIcon sx={{ fontSize: 28 }} />
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: "error.dark",
            letterSpacing: 0.5,
          }}
        >
          เอกสาร PDF
        </Typography>
      </Box>
    );
  }

  // Other types
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height,
        borderRadius: 1.5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "grey.50",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        p: 2,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: isSpreadsheet
            ? "success.50"
            : isPresentation
            ? "warning.50"
            : isArchive
            ? "amber.50"
            : "primary.50",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isSpreadsheet
            ? "success.main"
            : isPresentation
            ? "warning.main"
            : isArchive
            ? "warning.dark"
            : "primary.main",
        }}
      >
        {isSpreadsheet ? (
          <TableChartIcon sx={{ fontSize: 26 }} />
        ) : isPresentation ? (
          <SlideshowIcon sx={{ fontSize: 26 }} />
        ) : isArchive ? (
          <FolderZipIcon sx={{ fontSize: 26 }} />
        ) : (
          <InsertDriveFileIcon sx={{ fontSize: 26 }} />
        )}
      </Box>
      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
        {isSpreadsheet
          ? "ตารางคำนวณ"
          : isPresentation
          ? "สไลด์นำเสนอ"
          : isArchive
          ? "ไฟล์บีบอัด"
          : "เอกสารข้อมูล"}
      </Typography>
    </Box>
  );
}
