"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1e40af", // Blue 800
      light: "#3b82f6",
      dark: "#1e3a8a",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#475569", // Slate 600
      light: "#64748b",
      dark: "#334155",
      contrastText: "#ffffff",
    },
    success: {
      main: "#16a34a",
      light: "#22c55e",
      dark: "#15803d",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#d97706",
      light: "#f59e0b",
      dark: "#b45309",
      contrastText: "#ffffff",
    },
    error: {
      main: "#dc2626",
      light: "#ef4444",
      dark: "#b91c1c",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
    divider: "#e2e8f0",
  },
  typography: {
    fontFamily: [
      "Prompt",
      "Sarabun",
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      "sans-serif",
    ].join(","),
    h1: {
      fontSize: "1.25rem",
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: "-0.01em",
    },
    h2: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.35,
    },
    h4: {
      fontSize: "0.9375rem",
      fontWeight: 600,
      lineHeight: 1.35,
    },
    subtitle1: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.45,
      color: "#64748b",
    },
    subtitle2: {
      fontSize: "0.8125rem",
      fontWeight: 500,
      lineHeight: 1.45,
      color: "#64748b",
    },
    body1: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.8125rem",
      lineHeight: 1.5,
    },
    caption: {
      fontSize: "0.75rem",
      lineHeight: 1.4,
      color: "#64748b",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      fontSize: "0.8125rem",
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          padding: "6px 16px",
        },
        sizeSmall: {
          padding: "4px 10px",
          fontSize: "0.75rem",
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
        },
        outlined: {
          border: "1px solid #e2e8f0",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
        },
        sizeSmall: {
          height: 22,
          fontSize: "0.6875rem",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "#f1f5f9",
          padding: "7px 12px",
          fontSize: "0.8125rem",
        },
        head: {
          fontWeight: 600,
          backgroundColor: "#f8fafc",
          color: "#475569",
          padding: "8px 12px",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: "0.8125rem",
          fontWeight: 500,
        },
      },
    },
  },
});
