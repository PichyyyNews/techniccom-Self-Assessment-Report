"use client";

import React from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";

export interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: number | { xs: string | number; sm: string | number; md: string | number };
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function DetailDrawer({
  open,
  onClose,
  title,
  subtitle,
  width = { xs: "100%", sm: 480, md: 540 },
  children,
  actions,
}: DetailDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width,
            maxWidth: "100vw",
            boxShadow: 8,
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            noWrap
            sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              noWrap
              sx={{ color: "text.secondary", display: "block", fontSize: "0.75rem" }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="close" sx={{ ml: 1 }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Body Content */}
      <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>{children}</Box>

      {/* Footer Actions */}
      {actions && (
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          {actions}
        </Box>
      )}
    </Drawer>
  );
}
