# Design & Architecture Rules for Techniccom QA / SAR Web App

This document defines the strict UI design system, architecture guidelines, and UX consistency rules for the Techniccom Self-Assessment Report (SAR) Web Application. All AI models (Gemini / Antigravity), developers, and contributors MUST adhere to these rules unconditionally when generating, modifying, or refactoring code.

---

## 1. UI Component System: Material UI (MUI v6+) Exclusivity

- **Primary UI Framework**: Use **Material UI (MUI v6+)** (`@mui/material`, `@mui/icons-material`) as the single source of truth for all layout structures, navigation bars, headers, typography, buttons, toolbars, tables, chips, modals/dialogs, and form controls.
- **Do NOT mix raw HTML tags or ad-hoc Tailwind classes** for core layout components (`<button>`, `<div>`, `<h1>`-`<h6>`, `<input>`, custom pill links). Always use the corresponding MUI components:
  - Container / Flex / Grid Layouts: `<Box>`, `<Paper>`, `<Grid>`
  - Typography: `<Typography variant="h1" | "h2" | "h3" | "h4" | "subtitle1" | "body1" | "body2" | "caption">`
  - Action Elements: `<Button>`, `<IconButton>`, `<Chip>`
  - Dialogs & Overlays: `<Dialog>`, `<DialogTitle>`, `<DialogContent>`, `<DialogActions>`
  - Tables: `<TableContainer>`, `<Table>`, `<TableHead>`, `<TableBody>`, `<TableRow>`, `<TableCell>`
  - Feedback: `<Tooltip>`, `<Alert>`, `<Snackbar>`, `<CircularProgress>`, `<LinearProgress>`
- **Icons**: Always import icons directly from `@mui/icons-material/*` (e.g. `import ArrowBackIcon from "@mui/icons-material/ArrowBack"`). Do NOT import or mix `lucide-react` or other conflicting icon libraries into MUI pages.
- **Next.js Link Compatibility**:
  - In Server Components: Wrap MUI components inside Next.js `<Link href="..." style={{ textDecoration: "none" }}> <Button ...> ... </Button> </Link>`. NEVER pass `component={Link}` directly to a Client Component from a Server Component.
  - In Client Components (`"use client"`): You may use `<IconButton component={Link} href="...">` or `<Button component={Link} href="...">` safely.

---

## 2. Universal Page Header & Back Button Standards

Every page that is a sub-page, child route, or detailed view (e.g., all pages under `/teachers/*`, `/students/*`, `/admin/*`, `/quick-upload`, `/stock`, `/profile`) MUST implement the **Ultra-Compact Page Header** according to the following exact structure:

```tsx
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
  {/* LEFT: Back Button + Title + Info + Category Chip */}
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    {/* Universal Back Button */}
    <Tooltip title="กลับหน้าหลัก">
      <IconButton
        component={Link}
        href="/dashboard"
        size="small"
        sx={{ color: "text.secondary", p: 0.4 }}
        aria-label="ย้อนกลับ"
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Tooltip>

    {/* Page Title */}
    <Typography variant="h2" sx={{ fontWeight: 700, fontSize: "1.125rem", color: "text.primary" }}>
      ชื่อหัวข้อหน้า
    </Typography>

    {/* Optional Quick Info Tooltip */}
    <Tooltip title="คำอธิบายระบบโดยสังเขป">
      <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Tooltip>

    {/* Optional SAR Standard Tag */}
    <Chip size="small" label="มาตรฐานที่ 1 SAR" color="primary" variant="outlined" sx={{ height: 20, fontSize: "0.6875rem" }} />
  </Box>

  {/* RIGHT: Academic Term Indicator + Primary Action Button */}
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
    {/* Academic Year/Term Chip */}
    <Chip
      icon={<CalendarTodayIcon sx={{ fontSize: 13 }} />}
      label={`รอบข้อมูล ${termLabel}`}
      variant="outlined"
      size="small"
      sx={{ height: 22, fontSize: "0.725rem", display: { xs: "none", sm: "inline-flex" } }}
    />

    {/* Primary CTA Button */}
    <Button
      variant="contained"
      size="small"
      startIcon={<AddIcon sx={{ fontSize: 15 }} />}
      sx={{ px: 1.25, py: 0.35, fontSize: "0.75rem", fontWeight: 600 }}
    >
      ปุ่มการทำงานหลัก
    </Button>
  </Box>
</Box>
```

### Critical Rules for Back Buttons:
1. **Always on the Far Left**: The back button MUST always be placed at the beginning of the Left Box, immediately before the `Typography variant="h2"` page title.
2. **NEVER on the Right**: Do NOT place back buttons in the right-side toolbar wedged between chips or next to primary action buttons.
3. **Consistent Icon and Sizing**: Always use `<IconButton size="small" sx={{ color: "text.secondary", p: 0.4 }}><ArrowBackIcon sx={{ fontSize: 18 }} /></IconButton>` wrapped in `<Tooltip title="...">`.

---

## 3. Anti-Duplication Rules (No Duplicate Buttons on Same Screen)

1. **Single Primary CTA per Scope**: A page must have only one primary action button per task. Never display two buttons that perform the exact same action (e.g. going to `/quick-upload` or creating a backup snapshot) in different places on the same screen.
2. **Embedded Components**: Reusable components such as `LiveEvidenceSection` must accept props like `hideUploadButton?: boolean`. When embedded in a parent page that already provides a descriptive primary action button in its header (e.g., "เพิ่มแผนการสอน", "เพิ่มงานวิจัย", "เพิ่มการอบรม", "บันทึกสมรรถนะ"), always pass `hideUploadButton` to eliminate redundant upload buttons.
3. **Dashboard Quick Actions vs. Dedicated Management Cards**: Quick action bars at the top of the dashboard are strictly for daily shortcuts. Global administrative actions (e.g., user & role management) belong in dedicated cards or sidebar navigation, not duplicated across both.

---

## 4. Typography & Information Density

- All pages follow an **Ultra-Compact / High Information Density** layout tailored for academic and institutional evaluation:
  - Page Titles: `fontSize: "1.125rem"`, `fontWeight: 700`
  - Section Headings: `fontSize: "0.95rem"` to `"1rem"`, `fontWeight: 700`
  - Body Text: `fontSize: "0.8125rem"` to `"0.875rem"`
  - Captions / Meta: `fontSize: "0.7rem"` to `"0.75rem"`
  - Dense Buttons: `size="small"`, `px: 1.25`, `py: 0.35`, `fontSize: "0.75rem"`
  - Compact Chips: `height: 20` or `22`, `fontSize: "0.6875rem"` or `"0.725rem"`

---

## 5. Thai Localization & Academic Year Standards

- Date & Time display must follow Thai Buddhist Era conventions:
  - `day month_th year_be` (e.g. `12 ส.ค. 2568 เวลา 14:30 น.`)
- Academic Year Context: Always read dynamic academic year and term labels from `useAcademicYear()` context (`selectedYear`, `selectedSemester`, `termLabel`).
