# 📘 TechSAR System Documentation & Project Handoff

> **TechSAR: ระบบงานประกันคุณภาพการศึกษาและรายงานการประเมินตนเอง (Self-Assessment Report)**  
> วิทยาลัยเทคนิคคอมพิวเตอร์ | Computer Technical College  
> **Repository:** [https://github.com/PichyyyNews/techniccom-Self-Assessment-Report](https://github.com/PichyyyNews/techniccom-Self-Assessment-Report)  
> **Infrastructure Docs:** [https://github.com/PichyyyNews/LBtech-Techniccom-server-proxmox](https://github.com/PichyyyNews/LBtech-Techniccom-server-proxmox)  
> **วันที่จัดทำเอกสาร (Date):** 4 กันยายน 2026  
> **เวอร์ชัน (Version):** 1.6.0 (Quick Upload Launcher, Central Evidence Stock & Auto-Categorization System)

---

## 📑 สารบัญ (Table of Contents)
1. [ภาพรวมสถาปัตยกรรมระบบ (System Architecture & Topology)](#1-ภาพรวมสถาปัตยกรรมระบบ-system-architecture--topology)
2. [สิทธิ์การใช้งานและความปลอดภัย (Roles & Security Permissions)](#2-สิทธิ์การใช้งานและความปลอดภัย-roles--security-permissions)
3. [ระบบเลือกปีการศึกษาและภาคเรียน (Global Academic Year & Semester System)](#3-ระบบเลือกปีการศึกษาและภาคเรียน-global-academic-year--semester-system)
4. [ระบบภาพรวม 2 ส่วนแยกกัน (Dual Overview: Teacher vs Student Dashboards)](#4-ระบบภาพรวม-2-ส่วนแยกกัน-dual-overview-teacher-vs-student-dashboards)
5. [ทางลัดอัปโหลดด่วนและคลังไฟล์หลักฐาน (Quick Upload & Evidence Stock)](#5-ทางลัดอัปโหลดด่วนและคลังไฟล์หลักฐาน-quick-upload--evidence-stock)
6. [ระบบงานครูและบุคลากรตามเกณฑ์ SAR (Teacher System Architecture)](#6-ระบบงานครูและบุคลากรตามเกณฑ์-sar-teacher-system-architecture)
7. [ระบบงานนักเรียน/นักศึกษาเชื่อมโยงครู (Student System Architecture)](#7-ระบบงานนักเรียนนักศึกษาเชื่อมโยงครู-student-system-architecture)
8. [ระบบจัดการหมวดหมู่และประเภทใบอนุญาต (Dedicated Route: `/admin/licenses`)](#8-ระบบจัดการหมวดหมู่และประเภทใบอนุญาต-dedicated-route-adminlicenses)
9. [ศูนย์ควบคุมและมอนิเตอร์ระบบ (System Monitor & Telemetry Command Center)](#9-ศูนย์ควบคุมและมอนิเตอร์ระบบ-system-monitor--telemetry-command-center)
10. [ระบบสำรองข้อมูลและ Snapshot (Database Backup & Restore System)](#10-ระบบสำรองข้อมูลและ-snapshot-database-backup--restore-system)
11. [โครงสร้างโค้ดและ API Endpoints (Codebase & API Reference)](#11-โครงสร้างโค้ดและ-api-endpoints-codebase--api-reference)
12. [ตัวแปรสภาพแวดล้อม (Environment Variables)](#12-ตัวแปรสภาพแวดล้อม-environment-variables)
13. [คู่มือการติดตั้งและรันระบบ (Setup & Deployment Guide)](#13-คู่มือการติดตั้งและรันระบบ-setup--deployment-guide)

---

## 1. ภาพรวมสถาปัตยกรรมระบบ (System Architecture & Topology)

โครงสร้างระบบถูกออกแบบให้แยกส่วนระหว่าง **Application Web Layer** และ **Database / Storage Infrastructure Layer** บน Proxmox Virtual Environment เพื่อความเสถียรและความปลอดภัยระดับ Enterprise:

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │           🌐 Proxmox VE Host: "techniccom"             │
                                  │      Local IP: 192.168.1.250 | Tailscale: 100.125.250.85│
                                  └───────────────────────────┬────────────────────────────┘
                                                              │
                                            ┌─────────────────┴─────────────────┐
                                            ▼                                   ▼
┌─────────────────────────────────┐   ┌───────────────────────────┐   ┌───────────────────────────┐
│     ⚡ Next.js 16 Web App       │   │    🐘 PostgreSQL 16       │   │      🪣 MinIO S3          │
│    (App Router + Turbopack)     │──▶│   (Docker `qa_postgres`)  │   │     (Docker `qa_minio`)   │
│    Port: 3000 (Local / Server)  │   │   CT 102: Port 5432       │   │   CT 102: Port 9000/9001  │
│    Session: Live NextAuth DB    │   │   Database: `qa_system_db`│   │   Bucket: `qa-evidences`  │
└─────────────────────────────────┘   └───────────────────────────┘   └───────────────────────────┘
```

---

## 2. สิทธิ์การใช้งานและความปลอดภัย (Roles & Security Permissions)

ระบบใช้ระบบสิทธิ์แบบไดนามิก 2 ชั้น (Two-Tier Permission Model):

1. **สิทธิ์สูงสุด (ROOT Admin)**:
   - สิทธิ์ระดับผู้สร้างระบบ ไม่สามารถลบหรือเปลี่ยนชื่อได้
   - เข้าถึงได้ทุกหน้าในระบบ รวมถึง **`/admin/system` (ศูนย์มอนิเตอร์และตั้งค่า)** และสามารถดู/แก้ไขโปรไฟล์ของบุคลากรทุกคนได้ รวมถึงการจัดการไฟล์หลักฐานในคลัง
2. **สิทธิ์แบบกำหนดเอง (Custom Dynamic Roles)**:
   - ผู้ดูแลระบบสามารถสร้าง/แก้ไข/ลบ ยศ/สิทธิ์ได้เอง เช่น *อาจารย์ผู้ประเมิน, หัวหน้าสาขาวิชา, เจ้าหน้าที่ประกันคุณภาพ*
   - กำหนดสี Badge ได้ 5 เฉดสี (`rose`, `blue`, `emerald`, `purple`, `amber`)
   - กำหนดสิทธิ์การเข้าถึงหน้าระบบ (`permissions: string[]`)
3. **การรักษาความปลอดภัย (Security Enforcement)**:
   - `NextAuth.js` ซิงก์ข้อมูลสิทธิ์ผู้ใช้งานสดจากฐานข้อมูล PostgreSQL เสมอ (Live DB Session Sync)
   - `middleware.ts` ตรวจจับและป้องกัน Route อัตโนมัติ (`/admin/*`, `/dashboard/*`, `/profile/*`, `/teachers/*`, `/students/*`, `/quick-upload/*`, `/stock/*`)

---

## 3. ระบบเลือกปีการศึกษาและภาคเรียน (Global Academic Year & Semester System)

ระบบออกแบบให้จัดเก็บและคัดกรองข้อมูลเป็น **รอบปีการศึกษา (Academic Year)** และ **ภาคเรียน (Semester)** ตามบริบทจริงของงานประกันคุณภาพอาชีวศึกษา:

- **Global Context (`AcademicYearContext`)**:
  - จัดเก็บสถานะ `selectedYear` (2569, 2568, 2567, 2566, 2565) และ `selectedSemester` (ภาคเรียนที่ 1, ภาคเรียนที่ 2, ตลอดปีการศึกษา)
  - จดจำค่าที่เลือกไว้ใน `localStorage` (`techsar_academic_year`, `techsar_academic_semester`)
- **Navbar Selector Popover**:
  - แสดงปุ่มเลือกปี/เทอมบน Navbar ด้านบน (`📅 ปีการศึกษา 2568 [เทอม 1]`) พร้อมหน้าต่างตัวเลือกแบบด่วน
- **Sidebar Active Indicator**:
  - แสดงป้ายกำกับปีการศึกษาและเทอมที่มุมบนของ Sidebar ใต้โลโก้สถาบัน

---

## 4. ระบบภาพรวม 2 ส่วนแยกกัน (Dual Overview: Teacher vs Student Dashboards)

แถบ Sidebar และระบบหน้าแรกแยก **แดชบอร์ดภาพรวม (Overview)** ออกเป็น 2 ด้านอย่างชัดเจน:

1. **ภาพรวมงานครูและบุคลากร (`/dashboard`)**:
   - ตรวจสอบสถานะใบประกอบวิชาชีพครู (KSP Alerts: A/B/P License และหนังสือผ่อนผันครั้งที่ 1, 2, 3)
   - สรุปข้อมูลบุคลากรในสังกัด และอัตราส่วนครูที่มีใบประกอบฯ ตามเกณฑ์ SAR
2. **ภาพรวมงานนักเรียนและนักศึกษา (`/dashboard/students`)**:
   - แดชบอร์ดมุ่งเน้น **มาตรฐานที่ 1 คุณภาพของผู้สำเร็จการศึกษาอาชีวศึกษา (SAR สอศ.)**
   - ตัวชี้วัดสถิติ: ยอดลงทะเบียน, อัตราเข้าชั้นเรียน (%), สมรรถนะวิชาชีพ (%), อัตราคงอยู่ (%)

---

## 5. ทางลัดอัปโหลดด่วนและคลังไฟล์หลักฐาน (Quick Upload & Evidence Stock)

ศูนย์กลางการจัดการไฟล์หลักฐานดิจิทัล (Digital Evidence & Artifact Management) สไตล์ Google Drive ผสมผสานระบบทางลัดแบบ App Launcher บนมือถือ:

### 1. ทางลัดอัปโหลดด่วน (`/quick-upload`):
- **รูปแบบ App Grid การ์ด 8 หมวดหมู่**:
  1. 📚 **แผนการจัดการเรียนรู้** (`lesson_plan`) -> เชื่อมไปหน้า `/teachers/lesson-plans`
  2. 📜 **วุฒิบัตร / เกียรติบัตร** (`training_cert`) -> เชื่อมไปหน้า `/teachers/trainings`
  3. 📸 **ภาพกิจกรรมอบรม / ดูงาน** (`training_photo`) -> บันทึกสถานที่, วันที่, หน่วยงานจัด
  4. 🎤 **การเป็นวิทยากร & บริการวิชาชีพ** (`speaker_activity`) -> บันทึกภาพบรรยาย, หนังสือเชิญ
  5. 💡 **งานวิจัย & สิ่งประดิษฐ์** (`research`) -> เชื่อมไปหน้า `/teachers/researches`
  6. 🎨 **ชิ้นงาน & ผลงานนักศึกษา** (`student_work`) -> เชื่อมไปหน้า `/students/competencies`
  7. 🪪 **ใบประกอบวิชาชีพ & คุณวุฒิ** (`license`) -> เชื่อมไปหน้า `/profile`
  8. 📁 **เอกสารงานประกันคุณภาพ & โครงการ** (`other`) -> ร่องรอยหลักฐานทั่วไป
- **Interactive Drag & Drop**: สามารถลากไฟล์มาวางบนการ์ดแต่ละใบได้โดยตรง หรือคลิกเพื่อเปิด Modal ป้อนข้อมูล
- รองรับไฟล์เอกสาร PDF, รูปภาพ JPG/PNG/WEBP, วิดีโอ MP4 สูงสุด 50MB และรองรับการแนบลิงก์คลิปวิดีโอภายนอก (YouTube / Google Drive)

### 2. คลังไฟล์หลักฐานและ Stock กลาง (`/stock`):
- **Google Drive Interface**:
  - **ตัวสลับมุมมอง**: สลับดู **"ไฟล์ของฉัน (My Files)"** หรือ **"ไฟล์ทุกคนในวิทยาลัย (All College Files)"**
  - **Filter Bar**: ค้นหาแบบ Real-time, กรองหมวดหมู่ชิป, กรองปีการศึกษา/ภาคเรียน
  - **View Mode**: สลับดูแบบ Grid Cards (พร้อมพรีวิวรูปภาพ) หรือ Table List
  - **การจัดการไฟล์**: พรีวิวเอกสาร/ภาพ/วิดีโอใน Modal, ดาวน์โหลดตรง, และลบไฟล์ (เฉพาะเจ้าของหรือ ROOT)

### 3. ระบบจัดหมวดหมู่อัตโนมัติ (Auto-Categorization & Sub-Pages Integration):
- คอมโพเนนต์ `LiveEvidenceSection` ฝังอยู่ในทุกหน้าย่อย:
  - หน้าแผนการสอน (`/teachers/lesson-plans`) ดึงไฟล์หมวด `lesson_plan` มาแสดงสด
  - หน้าการพัฒนาวิชาชีพ (`/teachers/trainings`) ดึงไฟล์วุฒิบัตร ภาพอบรม และวิทยากรมาแสดงสด
  - หน้างาวิจัย (`/teachers/researches`) ดึงไฟล์วิจัยและสิ่งประดิษฐ์มาแสดงสด
  - หน้าสมรรถนะนักเรียน (`/students/competencies`) ดึงชิ้นงานนักศึกษามาแสดงสด
  - หน้าโปรไฟล์ครู (`/profile`) ดึงผลงานและหลักฐานทั้งหมดของครูท่านนั้นมาแสดงในแท็บร่องรอยผลงาน

---

## 6. ระบบงานครูและบุคลากรตามเกณฑ์ SAR (Teacher System Architecture)

- **โปรไฟล์และผลงานครู (`/profile`)**
- **แผนการสอน & หลังสอน (`/teachers/lesson-plans`)**
- **การพัฒนาวิชาชีพ & อบรม (`/teachers/trainings`)**
- **งานวิจัย & สิ่งประดิษฐ์ (`/teachers/researches`)**

---

## 7. ระบบงานนักเรียน/นักศึกษาเชื่อมโยงครู (Student System Architecture)

- **ทะเบียนข้อมูลนักเรียน (`/students`)**
- **เช็คชื่อเข้าเรียน & พฤติกรรม (`/students/attendance`)**
- **ผลสัมฤทธิ์ & สมรรถนะ (`/students/competencies`)**
- **กิจกรรมผู้เรียน & หน้าเสาธง (`/students/activities`)**

---

## 8. ระบบจัดการหมวดหมู่และประเภทใบอนุญาต (Dedicated Route: `/admin/licenses`)

ระบบได้แยกหน้าการตั้งค่าประเภทใบอนุญาตออกมาเป็น Route อิสระ **`/admin/licenses`** พร้อมจัดหมวดหมู่ใน Sidebar เพื่อให้ผู้ดูแลระบบทำงานได้สะดวกและเป็นสัดส่วน

---

## 9. ศูนย์ควบคุมและมอนิเตอร์ระบบ (System Monitor & Telemetry Command Center)

หน้าศูนย์ควบคุมระบบ (`/admin/system`) สงวนสิทธิ์เฉพาะ **ROOT** เท่านั้น สตรีม % CPU, RAM, Disk 32GB, PostgreSQL Port 5432, MinIO Port 9000 แบบ Real-Time

---

## 10. ระบบสำรองข้อมูลและ Snapshot (Database Backup & Restore System)

ปุ่มสร้าง Snapshot สำรองข้อมูล Users, Roles, TeacherLicenses, LicenseConfigs, EvidenceFiles และบันทึกลง MinIO S3 พร้อมดาวน์โหลดไฟล์ JSON ได้ทันที

---

## 11. โครงสร้างโค้ดและ API Endpoints (Codebase & API Reference)

```
services/qa-web/
├── prisma/
│   └── schema.prisma                  # PostgreSQL Schema (User, EvidenceFile, TeacherLicense, ...)
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   ├── admin/licenses/        # ตั้งค่าประเภทใบอนุญาต, หมวดหมู่ และ Preset Chips
│   │   │   ├── admin/system/          # ศูนย์มอนิเตอร์และตั้งค่าโครงสร้างระบบ (ROOT Only)
│   │   │   └── admin/users/           # จัดการผู้ใช้งานและยศ/สิทธิ์การใช้งาน
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/             # ภาพรวมงานครูและบุคลากร
│   │   │   │   └── students/          # ภาพรวมงานนักเรียน/นักศึกษา
│   │   │   ├── quick-upload/          # ทางลัดอัปโหลดด่วนแบบ App Grid 8 หมวดหมู่
│   │   │   ├── stock/                 # คลังไฟล์หลักฐานสไตล์ Google Drive (My/All Files)
│   │   │   ├── profile/               # หน้าโปรไฟล์ส่วนตัว และคลังผลงาน Evidence Artifacts
│   │   │   ├── teachers/              # แผนการสอน, อบรมสัมมนา, งานวิจัย
│   │   │   └── students/              # ทะเบียนนักเรียน, เช็คชื่อ, สมรรถนะ, กิจกรรม
│   │   ├── api/
│   │   │   ├── evidence/              # GET ดึงรายการไฟล์หลักฐานตาม Scope/Category/Term
│   │   │   ├── evidence/upload/       # POST อัปโหลดไฟล์สู่ MinIO S3 & บันทึก EvidenceFile
│   │   │   ├── evidence/[id]/         # DELETE ลบไฟล์หลักฐานและ S3 Object
│   │   │   ├── files/[...key]/        # S3 Stream & Proxy พร้อมรองรับ PDF/Image/Video
│   │   │   └── ...                    # APIs อื่นๆ ตามระบบเดิม
│   │   └── login/                     # หน้าเข้าสู่ระบบ
│   ├── components/
│   │   ├── evidence/
│   │   │   └── LiveEvidenceSection.tsx# คอมโพเนนต์แสดงผลไฟล์หลักฐานสดในหน้าย่อยต่างๆ
│   │   ├── layout/
│   │   │   ├── AcademicYearContext.tsx# State จัดการปีการศึกษา (2568) และภาคเรียน
│   │   │   ├── AppSidebar.tsx         # 5 Grouped Nav (Overview, Files, Teacher, Student, Admin)
│   │   │   └── Navbar.tsx             # Popover ตัวเลือกปี/เทอม และ Profile Dropdown
│   │   └── ...
│   └── middleware.ts                  # Route Protection & RBAC Guard
```

---

## 12. ตัวแปรสภาพแวดล้อม (Environment Variables)

สร้างไฟล์ `.env` ในโฟลเดอร์ `services/qa-web/`:

```env
# Database Connection (PostgreSQL 16 in CT 102)
DATABASE_URL="postgresql://qa_admin:SuperSecretPassword123@100.125.250.85:5432/qa_system_db?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"

# MinIO S3 Object Storage
S3_ENDPOINT="http://100.125.250.85:9000"
S3_BUCKET_NAME="qa-evidences"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="miniopassword123"

# Node Environment
NODE_ENV="development"
```

---

## 13. คู่มือการติดตั้งและรันระบบ (Setup & Deployment Guide)

### 1. ติดตั้ง Dependencies:
```bash
cd services/qa-web
npm install
```

### 2. อัปเดต Prisma Client และเชื่อมโยง Database:
```bash
npx prisma generate
npx prisma db push
```

### 3. รัน Development Server:
```bash
npm run dev
```
เปิดบราวเซอร์ที่: **`http://localhost:3000`**

---

## 👤 บัญชีผู้ดูแลระบบเริ่มต้น (Default Accounts)

- **ผู้ดูแลระบบสูงสุด (ROOT Admin)**:
  - Email: `admin@techniccom.ac.th`
  - Password: `Password123!`
  - สิทธิ์: `ROOT` (เข้าถึงทุกหน้า รวมถึง `/admin/system`, `/admin/licenses`, `/admin/users`, `/quick-upload`, `/stock`)

---

*เอกสารฉบับนี้จัดทำขึ้นเพื่อใช้ส่งมอบงานและอ้างอิงการพัฒนาต่อยอดระบบ TechSAR อย่างสมบูรณ์*
