"use client";

import React from "react";
import Link from "next/link";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface PageBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function PageBreadcrumbs({ items }: PageBreadcrumbsProps) {
  return (
    <Breadcrumbs
      separator={<NavigateNextIcon sx={{ fontSize: 13, color: "text.disabled" }} />}
      aria-label="breadcrumb"
      sx={{
        mb: 0.5,
        "& .MuiBreadcrumbs-ol": {
          alignItems: "center",
        },
      }}
    >
      <Link
        href="/dashboard"
        style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.4,
            fontSize: "0.725rem",
            fontWeight: 500,
            color: "text.secondary",
            "&:hover": { color: "primary.main" },
          }}
        >
          <HomeOutlinedIcon sx={{ fontSize: 14 }} />
          <span>หน้าหลัก</span>
        </Box>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast || !item.href) {
          return (
            <Typography
              key={item.label}
              variant="caption"
              sx={{
                fontSize: "0.725rem",
                fontWeight: 600,
                color: isLast ? "text.primary" : "text.secondary",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.4,
              }}
            >
              {item.icon}
              {item.label}
            </Typography>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.4,
                fontSize: "0.725rem",
                fontWeight: 500,
                color: "text.secondary",
                "&:hover": { color: "primary.main" },
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </Box>
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
