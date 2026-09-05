"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import InboxIcon from "@mui/icons-material/Inbox";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  actionIcon?: React.ReactNode;
  compact?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  actionIcon,
  compact = false,
}: EmptyStateProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        py: compact ? 4 : 7,
        px: 3,
        textAlign: "center",
        bgcolor: "background.paper",
        borderRadius: 2.5,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          mb: 1.75,
          p: 2,
          borderRadius: "50%",
          bgcolor: "action.hover",
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "& svg": {
            fontSize: compact ? 36 : 48,
            color: "text.disabled",
          },
        }}
      >
        {icon || <InboxIcon />}
      </Box>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          fontSize: compact ? "0.95rem" : "1.05rem",
          color: "text.primary",
          mb: 0.5,
        }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            maxWidth: 440,
            fontSize: "0.8125rem",
            mb: actionLabel && (onAction || actionHref) ? 2.5 : 0,
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
      )}

      {actionLabel && (onAction || actionHref) && (
        <Button
          component={actionHref ? (Link as any) : "button"}
          href={actionHref}
          variant="contained"
          size="small"
          onClick={onAction}
          startIcon={actionIcon}
          sx={{
            px: 2,
            py: 0.6,
            fontSize: "0.8rem",
            fontWeight: 600,
            borderRadius: 1.5,
            textTransform: "none",
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
}
