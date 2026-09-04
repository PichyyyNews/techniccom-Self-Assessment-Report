"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CollectionsIcon from "@mui/icons-material/Collections";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { GalleryItem } from "@/lib/evidence-grouping";

interface EvidenceThumbnailProps {
  fileUrl: string;
  fileType: string;
  fileName: string;
  title?: string;
  variant?: "table" | "card" | "full";
  height?: number | string;
  gallery?: GalleryItem[];
  onOpenFullscreen?: (slideIndex: number) => void;
}

export function EvidenceThumbnail({
  fileUrl,
  fileType,
  fileName,
  title,
  variant = "card",
  height = 150,
  gallery,
  onOpenFullscreen,
}: EvidenceThumbnailProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});

  const slides = gallery && gallery.length > 0 ? gallery : [{ fileUrl, fileType, fileName, title }];
  const totalSlides = slides.length;
  const activeSlide = slides[currentSlideIndex] || slides[0];

  const lowerName = (activeSlide.fileName || "").toLowerCase();
  const isImage =
    activeSlide.fileType.startsWith("image/") || /\.(jpe?g|png|webp|gif|svg)$/i.test(lowerName);
  const isVideo =
    activeSlide.fileType.startsWith("video/") || /\.(mp4|mov|avi|webm)$/i.test(lowerName);
  const isPdf = activeSlide.fileType.includes("pdf") || lowerName.endsWith(".pdf");
  const isSpreadsheet =
    activeSlide.fileType.includes("excel") ||
    activeSlide.fileType.includes("spreadsheet") ||
    /\.(xlsx?|csv)$/i.test(lowerName);
  const isPresentation =
    activeSlide.fileType.includes("presentation") ||
    activeSlide.fileType.includes("powerpoint") ||
    /\.(pptx?)$/i.test(lowerName);
  const isArchive =
    activeSlide.fileType.includes("zip") ||
    activeSlide.fileType.includes("rar") ||
    activeSlide.fileType.includes("tar") ||
    /\.(zip|rar|7z|tar|gz)$/i.test(lowerName);

  const isImgFailed = imgErrorMap[activeSlide.fileUrl];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  };

  // Variant: "table" (Mini thumbnail for table rows)
  if (variant === "table") {
    if (isImage && !isImgFailed) {
      return (
        <Box sx={{ position: "relative", width: 42, height: 42, flexShrink: 0 }}>
          <Box
            component="img"
            src={activeSlide.fileUrl}
            alt={title || fileName}
            onError={() => setImgErrorMap((prev) => ({ ...prev, [activeSlide.fileUrl]: true }))}
            sx={{
              width: 42,
              height: 42,
              borderRadius: 1.5,
              objectFit: "cover",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "grey.100",
            }}
          />
          {totalSlides > 1 && (
            <Box
              sx={{
                position: "absolute",
                bottom: -2,
                right: -2,
                bgcolor: "primary.main",
                color: "white",
                fontSize: "9px",
                fontWeight: 800,
                px: 0.5,
                borderRadius: 1,
                lineHeight: "14px",
                boxShadow: 1,
              }}
            >
              +{totalSlides}
            </Box>
          )}
        </Box>
      );
    }

    return (
      <Box
        sx={{
          position: "relative",
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
        {totalSlides > 1 && (
          <Box
            sx={{
              position: "absolute",
              bottom: -2,
              right: -2,
              bgcolor: "primary.main",
              color: "white",
              fontSize: "9px",
              fontWeight: 800,
              px: 0.5,
              borderRadius: 1,
              lineHeight: "14px",
              boxShadow: 1,
            }}
          >
            +{totalSlides}
          </Box>
        )}
      </Box>
    );
  }

  // Variant: "card" (Interactive carousel card cover)
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
        bgcolor: isVideo ? "#0f172a" : "grey.100",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        "&:hover .card-carousel-btn": {
          opacity: 1,
        },
        "&:hover .card-fullscreen-btn": {
          opacity: 1,
        },
      }}
    >
      {isImage && !isImgFailed ? (
        <Box
          component="img"
          src={activeSlide.fileUrl}
          alt={activeSlide.title || activeSlide.fileName}
          onError={() => setImgErrorMap((prev) => ({ ...prev, [activeSlide.fileUrl]: true }))}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.25s ease-in-out",
            "&:hover": {
              transform: "scale(1.03)",
            },
          }}
        />
      ) : isVideo ? (
        <Box
          sx={{
            width: "100%",
            height: "100%",
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
      ) : isPdf ? (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            p: 2,
            backgroundImage:
              "linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, rgba(255, 255, 255, 0) 100%)",
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
          <Typography variant="caption" sx={{ fontWeight: 700, color: "error.dark" }}>
            เอกสาร PDF
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            width: "100%",
            height: "100%",
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
      )}

      {/* Multi-file Carousel Badge (Top Left) */}
      {totalSlides > 1 && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            bgcolor: "rgba(15, 23, 42, 0.8)",
            color: "white",
            px: 1,
            py: 0.3,
            borderRadius: 1.5,
            fontSize: "0.6875rem",
            fontWeight: 700,
            backdropFilter: "blur(4px)",
            boxShadow: 1,
            zIndex: 2,
          }}
        >
          <CollectionsIcon sx={{ fontSize: 13 }} />
          <span>
            {currentSlideIndex + 1}/{totalSlides}
          </span>
        </Box>
      )}

      {/* Quick Fullscreen Button (Top Right on Hover) */}
      {isImage && onOpenFullscreen && (
        <IconButton
          className="card-fullscreen-btn"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onOpenFullscreen(currentSlideIndex);
          }}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "rgba(15, 23, 42, 0.75)",
            color: "white",
            p: 0.5,
            opacity: 0,
            transition: "all 0.15s ease",
            backdropFilter: "blur(4px)",
            "&:hover": {
              bgcolor: "rgba(15, 23, 42, 0.95)",
              transform: "scale(1.1)",
            },
            zIndex: 2,
          }}
          title="เปิดดูภาพเต็มจอ"
        >
          <FullscreenIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}

      {/* Interactive Carousel Arrow Buttons on Card */}
      {totalSlides > 1 && (
        <>
          <IconButton
            className="card-carousel-btn"
            size="small"
            onClick={handlePrev}
            sx={{
              position: "absolute",
              left: 6,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(15, 23, 42, 0.75)",
              color: "white",
              p: 0.4,
              opacity: 0,
              transition: "all 0.15s ease",
              "&:hover": {
                bgcolor: "rgba(15, 23, 42, 0.95)",
              },
              zIndex: 3,
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <IconButton
            className="card-carousel-btn"
            size="small"
            onClick={handleNext}
            sx={{
              position: "absolute",
              right: 6,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(15, 23, 42, 0.75)",
              color: "white",
              p: 0.4,
              opacity: 0,
              transition: "all 0.15s ease",
              "&:hover": {
                bgcolor: "rgba(15, 23, 42, 0.95)",
              },
              zIndex: 3,
            }}
          >
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {/* Dot Indicators */}
          <Box
            sx={{
              position: "absolute",
              bottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              zIndex: 2,
            }}
          >
            {slides.map((_, idx) => (
              <Box
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlideIndex(idx);
                }}
                sx={{
                  width: idx === currentSlideIndex ? 12 : 5,
                  height: 5,
                  borderRadius: 2.5,
                  bgcolor: idx === currentSlideIndex ? "primary.main" : "rgba(255, 255, 255, 0.6)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
