"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import MailIcon from "@mui/icons-material/Mail";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password: password,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 420, mx: "auto", px: 2 }}>
      {/* Header & Logo */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Box
          component="img"
          src="/logo.svg"
          alt="TechSAR Logo"
          sx={{ mx: "auto", height: 72, width: 72, objectFit: "contain" }}
        />
        <Typography variant="h1" sx={{ mt: 2, color: "text.primary" }}>
          เข้าสู่ระบบ TechSAR
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          ระบบรายงานการประเมินตนเองและประกันคุณภาพการศึกษา
        </Typography>
      </Box>

      {/* Main Login Card */}
      <Paper sx={{ p: { xs: 3, sm: 4 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box>
          <Typography variant="h3">ลงชื่อเข้าใช้งาน</Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            กรุณาระบุอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบงาน
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="อีเมลผู้ใช้งาน"
            type="email"
            required
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@technic.ac.th"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MailIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="รหัสผ่าน"
            type={showPassword ? "text" : "password"}
            required
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="สลับการแสดงรหัสผ่าน"
                    >
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            endIcon={<ArrowForwardIcon />}
            sx={{ mt: 1, py: 1.25 }}
          >
            {loading ? "กำลังตรวจสอบข้อมูล" : "เข้าสู่ระบบงาน"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
