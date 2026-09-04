# 📘 TechSAR System Documentation & Project Handoff

> **TechSAR: ระบบงานประกันคุณภาพการศึกษาและรายงานการประเมินตนเอง (Self-Assessment Report)**  
> วิทยาลัยเทคนิคคอมพิวเตอร์ | Computer Technical College  
> **Repository:** [https://github.com/PichyyyNews/techniccom-Self-Assessment-Report](https://github.com/PichyyyNews/techniccom-Self-Assessment-Report)  
> **Infrastructure Docs:** [https://github.com/PichyyyNews/LBtech-Techniccom-server-proxmox](https://github.com/PichyyyNews/LBtech-Techniccom-server-proxmox)  
> **วันที่จัดทำเอกสาร (Date):** 4 กันยายน 2026  
> **เวอร์ชัน (Version):** 1.5.0 (Dual-Overview Dashboards, Academic Term Selector & Teacher-Student SAR Framework)

---

## 📑 สารบัญ (Table of Contents)
1. [ภาพรวมสถาปัตยกรรมระบบ (System Architecture & Topology)](#1-ภาพรวมสถาปัตยกรรมระบบ-system-architecture--topology)
2. [สิทธิ์การใช้งานและความปลอดภัย (Roles & Security Permissions)](#2-สิทธิ์การใช้งานและความปลอดภัย-roles--security-permissions)
3. [ระบบเลือกปีการศึกษาและภาคเรียน (Global Academic Year & Semester System)](#3-ระบบเลือกปีการศึกษาและภาคเรียน-global-academic-year--semester-system)
4. [ระบบภาพรวม 2 ส่วนแยกกัน (Dual Overview: Teacher vs Student Dashboards)](#4-ระบบภาพรวม-2-ส่วนแยกกัน-dual-overview-teacher-vs-student-dashboards)
5. [ระบบงานครูและบุคลากรตามเกณฑ์ SAR (Teacher System Architecture)](#5-ระบบงานครูและบุคลากรตามเกณฑ์-sar-teacher-system-architecture)
6. [ระบบงานนักเรียน/นักศึกษาเชื่อมโยงครู (Student System Architecture)](#6-ระบบงานนักเรียนนักศึกษาเชื่อมโยงครู-student-system-architecture)
7. [ระบบจัดการหมวดหมู่และประเภทใบอนุญาต (Dedicated Route: `/admin/licenses`)](#7-ระบบจัดการหมวดหมู่และประเภทใบอนุญาต-dedicated-route-adminlicenses)
8. [ศูนย์ควบคุมและมอนิเตอร์ระบบ (System Monitor & Telemetry Command Center)](#8-ศูนย์ควบคุมและมอนิเตอร์ระบบ-system-monitor--telemetry-command-center)
9. [ระบบสำรองข้อมูลและ Snapshot (Database Backup & Restore System)](#9-ระบบสำรองข้อมูลและ-snapshot-database-backup--restore-system)
10. [โครงสร้างโค้ดและ API Endpoints (Codebase & API Reference)](#10-โครงสร้างโค้ดและ-api-endpoints-codebase--api-reference)
11. [ตัวแปรสภาพแวดล้อม (Environment Variables)](#11-ตัวแปรสภาพแวดล้อม-environment-variables)
12. [คู่มือการติดตั้งและรันระบบ (Setup & Deployment Guide)](#12-คู่มือการติดตั้งและรันระบบ-setup--deployment-guide)

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

### รายละเอียดโครงสร้างเครื่องแม่ข่าย:
- **Proxmox VE 8.x Host (`techniccom`)**:
  - IP Address (Tailscale VPN): `100.125.250.85`
  - IP Address (Local LAN): `192.168.1.250`
  - Subnet: `10.10.10.0/24`
- **LXC Container CT 102 (`database-server`)**:
  - Container IP: `10.10.10.102`
  - vCPUs: 2 Cores | Allocated RAM: 4.0 GB | Root Disk: 32.0 GB
  - **Docker Service 1 (`qa_postgres`)**: PostgreSQL 16 Database (Port 5432)
  - **Docker Service 2 (`qa_minio`)**: MinIO S3 Storage (API Port 9000 / Web Console Port 9001)
- **Web Application Service (`qa-web`)**:
  - Next.js 16 (App Router + Turbopack)
  - Port: 3000

---

## 2. สิทธิ์การใช้งานและความปลอดภัย (Roles & Security Permissions)

ระบบใช้ระบบสิทธิ์แบบไดนามิก 2 ชั้น (Two-Tier Permission Model):

1. **สิทธิ์สูงสุด (ROOT Admin)**:
   - สิทธิ์ระดับผู้สร้างระบบ ไม่สามารถลบหรือเปลี่ยนชื่อได้
   - เข้าถึงได้ทุกหน้าในระบบ รวมถึง **`/admin/system` (ศูนย์มอนิเตอร์และตั้งค่า)** และสามารถดู/แก้ไขโปรไฟล์ของบุคลากรทุกคนได้
2. **สิทธิ์แบบกำหนดเอง (Custom Dynamic Roles)**:
   - ผู้ดูแลระบบสามารถสร้าง/แก้ไข/ลบ ยศ/สิทธิ์ได้เอง เช่น *อาจารย์ผู้ประเมิน, หัวหน้าสาขาวิชา, เจ้าหน้าที่ประกันคุณภาพ*
   - กำหนดสี Badge ได้ 5 เฉดสี (`rose`, `blue`, `emerald`, `purple`, `amber`)
   - กำหนดสิทธิ์การเข้าถึงหน้าระบบ (`permissions: string[]`) เช่น `["/dashboard", "/admin/users", "/admin/licenses"]`
   - กำหนดสิทธิ์การดูหรือแก้ไขโปรไฟล์ผู้อื่น (`/profile:view_others`, `/profile:edit_others`)
3. **การรักษาความปลอดภัย (Security Enforcement)**:
   - `NextAuth.js` ซิงก์ข้อมูลสิทธิ์ผู้ใช้งานสดจากฐานข้อมูล PostgreSQL เสมอ (Live DB Session Sync)
   - `middleware.ts` ตรวจจับและป้องกัน Route อัตโนมัติ (`/admin/*`, `/dashboard/*`, `/profile/*`, `/teachers/*`, `/students/*` - Unauthorized Redirect ไปหน้า `/login` ทันที)

---

## 3. ระบบเลือกปีการศึกษาและภาคเรียน (Global Academic Year & Semester System)

ระบบออกแบบให้จัดเก็บและคัดกรองข้อมูลเป็น **รอบปีการศึกษา (Academic Year)** และ **ภาคเรียน (Semester)** ตามบริบทจริงของงานประกันคุณภาพอาชีวศึกษา:

- **Global Context (`AcademicYearContext`)**:
  - เก็บสถานะ `selectedYear` (2569, 2568, 2567, 2566, 2565) และ `selectedSemester` (ภาคเรียนที่ 1, ภาคเรียนที่ 2, ตลอดปีการศึกษา)
  - จดจำค่าที่เลือกไว้ใน `localStorage` (`techsar_academic_year`, `techsar_academic_semester`) ทำให้ผู้ใช้ไม่ต้องเลือกซ้ำเมื่อสลับหน้าหรือรีเฟรช
- **Navbar Selector Popover**:
  - แสดงปุ่มเลือกปี/เทอมบน Navbar ด้านบน (`📅 ปีการศึกษา 2568 [เทอม 1]`) พร้อมหน้าต่างตัวเลือกแบบด่วน
  - ปรับการแสดงผลบนมือถือเป็นชิปกะทัดรัด (`2568/1`) ไม่เบียดบังพื้นที่หน้าจอ
- **Sidebar Active Indicator**:
  - แสดงป้ายกำกับปีการศึกษาและเทอมที่มุมบนของ Sidebar ใต้โลโก้สถาบัน

---

## 4. ระบบภาพรวม 2 ส่วนแยกกัน (Dual Overview: Teacher vs Student Dashboards)

แถบ Sidebar และระบบหน้าแรกแยก **แดชบอร์ดภาพรวม (Overview)** ออกเป็น 2 ด้านอย่างชัดเจน เพื่อตอบโจทย์การประเมิน SAR ทั้งด้านครูและด้านผู้เรียน:

1. **ภาพรวมงานครูและบุคลากร (`/dashboard`)**:
   - ตรวจสอบสถานะใบประกอบวิชาชีพครู (KSP Alerts: A/B/P License และหนังสือผ่อนผันครั้งที่ 1, 2, 3)
   - สรุปข้อมูลบุคลากรในสังกัด, อัตราส่วนครูที่มีใบประกอบฯ ตามเกณฑ์ SAR (สอศ.)
   - มีปุ่มสลับไปดูภาพรวมงานนักเรียน/นักศึกษาแบบ 1-Click
2. **ภาพรวมงานนักเรียนและนักศึกษา (`/dashboard/students`)**:
   - แดชบอร์ดมุ่งเน้น **มาตรฐานที่ 1 คุณภาพของผู้สำเร็จการศึกษาอาชีวศึกษา (SAR สอศ.)**
   - การ์ดสถิติตัวชี้วัด (KPIs): ยอดลงทะเบียนนักเรียน (ปวช./ปวส.), อัตราการเข้าชั้นเรียนเฉลี่ย (%), อัตราการผ่านการประเมินสมรรถนะวิชาชีพ (TPQI/DSD/กว. %), อัตราคงอยู่ของผู้เรียน (Retention Rate %), และการเข้าร่วมกิจกรรมพัฒนาผู้เรียน (%)
   - ลิงก์ด่วนเข้าสู่โมดูลงานนักเรียน 4 ด้าน

---

## 5. ระบบงานครูและบุคลากรตามเกณฑ์ SAR (Teacher System Architecture)

เมนูและโครงสร้างรองรับการเก็บร่องรอยหลักฐานงานครูตาม **มาตรฐานที่ 2 การจัดการอาชีวศึกษา และ มาตรฐานที่ 3 การสร้างสังคมแห่งการเรียนรู้**:

1. **โปรไฟล์และผลงานครู (`/profile`)**:
   - Social Profile ของครู, ประวัติการศึกษา, ประวัติการทำงาน, ทักษะความเชี่ยวชาญ และ Heatmap กิจกรรมการบันทึกข้อมูล (Contribution Graph 52 สัปดาห์)
2. **แผนการสอน & หลังสอน (`/teachers/lesson-plans`)**:
   - จัดเก็บแผนการจัดการเรียนรู้มุ่งเน้นสมรรถนะอาชีพ, บันทึกหลังการจัดการเรียนรู้ และร่องรอยการวัดประเมินผลตามสภาพจริง
3. **การพัฒนาวิชาชีพ & อบรม (`/teachers/trainings`)**:
   - บันทึกประวัติการฝึกอบรม, ชั่วโมงสะสมการพัฒนาวิชาชีพ (เกณฑ์ขั้นต่ำ 20 ชม./ปี), กิจกรรม PLC และการแนบวุฒิบัตร
4. **งานวิจัย & สิ่งประดิษฐ์ (`/teachers/researches`)**:
   - ฐานข้อมูลงานวิจัยในชั้นเรียน (Action Research), นวัตกรรมการจัดการเรียนรู้, สื่อการสอน และผลงานสิ่งประดิษฐ์คนรุ่นใหม่

---

## 6. ระบบงานนักเรียน/นักศึกษาเชื่อมโยงครู (Student System Architecture)

เชื่อมต่อข้อมูลการปฏิบัติงานจริงระหว่างครูผู้สอน/ครูที่ปรึกษา กับข้อมูลของนักเรียน:

1. **ทะเบียนข้อมูลนักเรียน (`/students`)**:
   - ฐานข้อมูลประวัตินักเรียน-นักศึกษา แยกตามระดับชั้น (ปวช./ปวส.), สาขาวิชา, กลุ่มเรียน และครูที่ปรึกษา เพื่อติดตามอัตราคงอยู่และการสำเร็จการศึกษา
2. **เช็คชื่อเข้าเรียน & พฤติกรรม (`/students/attendance`)**:
   - บันทึกเวลาเรียนรายคาบโดยครูผู้สอนเพื่อตรวจสอบเกณฑ์เวลาเรียน 80% ก่อนสอบปลายภาค พร้อมบันทึกพฤติกรรมวินัย
3. **ผลสัมฤทธิ์ & สมรรถนะ (`/students/competencies`)**:
   - ติดตามผลการเรียน (GPAX), ผลคะแนนการทดสอบระดับชาติด้านอาชีวศึกษา (V-NET) และผลการประเมินมาตรฐานฝีมือแรงงาน (TPQI/DSD/กว.)
4. **กิจกรรมผู้เรียน & หน้าเสาธง (`/students/activities`)**:
   - บันทึกการเข้าร่วมกิจกรรมหน้าเสาธง (เกณฑ์ 85%), กิจกรรมชมรมวิชาชีพ (อวท.) และกิจกรรมจิตอาสาบำเพ็ญประโยชน์

---

## 7. ระบบจัดการหมวดหมู่และประเภทใบอนุญาต (Dedicated Route: `/admin/licenses`)

ระบบได้แยกหน้าการตั้งค่าประเภทใบอนุญาตออกมาเป็น Route อิสระ **`/admin/licenses`** พร้อมจัดหมวดหมู่ใน Sidebar:

### 1. ระบบจัดการหมวดหมู่ใบอนุญาต (Dynamic License Category Manager):
- **Model ใน Database**: ตาราง `LicenseCategoryConfig` ใน PostgreSQL (`code`, `title`, `description`, `icon`, `color`, `sortOrder`, `isActive`, `isSystem`)
- **Category Manager Modal**:
  - แสดงรายการหมวดหมู่ทั้งหมด พร้อมนับจำนวนประเภทใบอนุญาตที่สังกัด
  - สร้างหมวดหมู่ใหม่ กำหนดชื่อ, รหัส Code, ไอคอน, โทนสี, และลำดับการแสดงผล
  - ลบหมวดหมู่ที่ไม่ได้ใช้งานได้อย่างปลอดภัย (มีระบบป้องกันการลบหมวดหมู่ที่มีประเภทใบอนุญาตอยู่)
  - ปุ่มคืนค่าหมวดหมู่เริ่มต้น (Reset Defaults: `ksp`, `vocational`, `other`)

### 2. การตั้งค่าประเภทใบอนุญาต (License Configurations CRUD):
- เพิ่ม/แก้ไข/ลบ ประเภทใบอนุญาตได้เองโดยไม่ต้องแก้ไขโค้ด
- กำหนด รหัสประเภท (Code), ชื่อภาษาไทย (Title), คำอธิบาย (Description), และเลือกหมวดหมู่
- กำหนด **อายุใช้งานเริ่มต้น (defaultYears)**, หน่วยงานผู้ออก (Issuer), โทนสี และไอคอน
- เปิด/ปิดตัวเลือก: **รอบผ่อนผัน (requiresProvisionalRound)** และ **ให้ระบุสาขา/ระดับ (requiresTitle)**

---

## 8. ศูนย์ควบคุมและมอนิเตอร์ระบบ (System Monitor & Telemetry Command Center)

หน้าศูนย์ควบคุมระบบ (`/admin/system`) สงวนสิทธิ์เฉพาะ **ROOT** เท่านั้น:

1. **Dual-Node Real-Time Streaming (อัปเดตสดทุก 2.5 วินาที)**:
   - **Node 1: เครื่อง App Server (Web Host)**: สตรีม % CPU, RAM, Heap Used, Node Version, Uptime
   - **Node 2: เครื่อง Database Server (Proxmox CT 102)**: สตรีม Query Load CPU, RAM 4.0 GB, พื้นที่ดิสก์ 32.0 GB, สถานะ PostgreSQL (Port 5432) และ MinIO S3 (Port 9000)
2. **วิเคราะห์ขนาดตารางใน Database (PostgreSQL Tables Breakdown)**:
   - แสดงตาราง `User`, `RoleDefinition`, `TeacherLicense`, `LicenseTypeConfig`, `LicenseCategoryConfig`, `ActivityLog` พร้อมแถวและขนาดพื้นที่
3. **Active SQL Queries Monitor (`pg_stat_activity`)**:
   - แสดงคำสั่ง SQL Query ที่กำลังทำงานสด, PID, User, และ Runtime
4. **Streaming Audit Logs**:
   - บันทึกกิจกรรมระบบสตรีมสดเข้าสู่หน้าจอทันที

---

## 9. ระบบสำรองข้อมูลและ Snapshot (Database Backup & Restore System)

- **ปุ่มสร้าง Snapshot**: กดปุ่มเพื่อเปิด **Modal สร้าง Snapshot**
  - กำหนด **ชื่อ Snapshot (Name)** และ **คำอธิบาย (Description)**
  - แปลงข้อมูล Users, Roles, TeacherLicenses, LicenseConfigs, ActivityLogs เป็น JSON Snapshot แล้วอัปโหลดไปยัง MinIO S3 Bucket `qa-evidences/system-backups/`
- **การดาวน์โหลด**:
  - รายการ Snapshot แสดงชื่อตัวหนา คำอธิบาย และปุ่มกด **ดาวน์โหลดไฟล์ JSON** ลงเครื่องได้ทันที

---

## 10. โครงสร้างโค้ดและ API Endpoints (Codebase & API Reference)

```
services/qa-web/
├── prisma/
│   └── schema.prisma                  # PostgreSQL Schema
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   ├── admin/licenses/        # ตั้งค่าประเภทใบอนุญาต, หมวดหมู่ และ Preset Chips (หน้าเฉพาะ)
│   │   │   ├── admin/system/          # ศูนย์มอนิเตอร์และตั้งค่าโครงสร้างระบบ (ROOT Only)
│   │   │   └── admin/users/           # จัดการผู้ใช้งานและยศ/สิทธิ์การใช้งาน (2 Tabs: Users & Roles)
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/             # แดชบอร์ดภาพรวมงานครูและบุคลากร (Teacher Overview)
│   │   │   │   └── students/          # แดชบอร์ดภาพรวมงานนักเรียน/นักศึกษา (Student Overview)
│   │   │   ├── profile/               # หน้าโปรไฟล์ส่วนตัว และ Social Profile View (/profile/[id])
│   │   │   ├── teachers/
│   │   │   │   ├── lesson-plans/      # แผนการจัดการเรียนรู้ & บันทึกหลังสอน
│   │   │   │   ├── trainings/         # การพัฒนาวิชาชีพ & อบรมสัมมนา
│   │   │   │   └── researches/        # งานวิจัย นวัตกรรม & สิ่งประดิษฐ์
│   │   │   └── students/
│   │   │       ├── page.tsx           # ทะเบียนข้อมูลนักเรียน/นักศึกษา
│   │   │       ├── attendance/        # บันทึกการเข้าเรียน & พฤติกรรม
│   │   │       ├── competencies/      # ผลสัมฤทธิ์ & สมรรถนะวิชาชีพ
│   │   │       └── activities/        # กิจกรรมผู้เรียน & หน้าเสาธง
│   │   ├── api/
│   │   │   ├── admin/license-categories/ # CRUD APIs สำหรับหมวดหมู่ใบอนุญาต
│   │   │   ├── admin/license-configs/    # CRUD APIs + Reset Defaults + Preset Chips Manager
│   │   │   ├── admin/roles/              # CRUD APIs สำหรับจัดการยศ/สิทธิ์
│   │   │   ├── admin/system/backup/      # GET/POST Snapshot สำรองข้อมูล S3
│   │   │   ├── admin/system/logs/        # GET ดึง System Audit Logs
│   │   │   ├── admin/system/metrics/     # GET สตรีมมิ่ง Telemetry 2 Nodes สด
│   │   │   ├── admin/system/status/      # GET เช็กสถานะ Health Ping
│   │   │   ├── admin/users/              # CRUD APIs สำหรับจัดการบัญชีผู้ใช้
│   │   │   ├── auth/[...nextauth]/       # NextAuth.js Authentication Handlers
│   │   │   ├── files/[...key]/           # S3 File Stream & Download Proxy
│   │   │   ├── license-categories/       # GET ดึงหมวดหมู่ที่ Active
│   │   │   ├── license-configs/          # GET ดึงประเภทใบอนุญาตที่ Active
│   │   │   ├── profile/                  # GET/PUT อัปเดตโปรไฟล์ตนเอง
│   │   │   ├── profile/[id]/             # GET/PUT ดูและแก้ไขโปรไฟล์ผู้อื่น
│   │   │   └── upload/                   # อัปโหลดรูปภาพและไฟล์หลักฐานไปยัง MinIO S3
│   │   └── login/                        # หน้าเข้าสู่ระบบ
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AcademicYearContext.tsx   # Global State จัดการปีการศึกษา (2568) และภาคเรียน (เทอม 1, 2)
│   │   │   ├── AppShell.tsx              # Root Layout Shell หุ้ม AcademicYearProvider & SidebarProvider
│   │   │   ├── AppSidebar.tsx            # 4 Grouped Nav (Dual Overview, Teacher, Student, Admin)
│   │   │   ├── Navbar.tsx                # Top Bar พร้อม Term Selector Popover & Profile Dropdown
│   │   │   └── SidebarContext.tsx        # Context ควบคุมการย่อ/ขยาย Sidebar
│   │   ├── profile/                      # ContributionGraph (Responsive 52-Week Heatmap)
│   │   └── ui/                           # ImageUpload, DocumentUpload
│   └── middleware.ts                     # Route Protection & RBAC Guard (ครอบคลุม /admin, /dashboard, /profile, /teachers, /students)
```

---

## 11. ตัวแปรสภาพแวดล้อม (Environment Variables)

สร้างไฟล์ `.env` ในโฟลเดอร์ `services/qa-web/`:

```env
# Database Connection (PostgreSQL 16 in CT 102)
# Tailscale IP: 100.125.250.85 | Local LAN IP: 192.168.1.250 / 10.10.10.102
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

## 12. คู่มือการติดตั้งและรันระบบ (Setup & Deployment Guide)

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

### 4. Build สำหรับ Production:
```bash
npm run build
npm run start
```

---

## 👤 บัญชีผู้ดูแลระบบเริ่มต้น (Default Accounts)

- **ผู้ดูแลระบบสูงสุด (ROOT Admin)**:
  - Email: `admin@techniccom.ac.th`
  - Password: `Password123!`
  - สิทธิ์: `ROOT` (เข้าถึงทุกหน้า รวมถึง `/admin/system`, `/admin/licenses` และ `/admin/users`)

---

*เอกสารฉบับนี้จัดทำขึ้นเพื่อใช้ส่งมอบงานและอ้างอิงการพัฒนาต่อยอดระบบ TechSAR อย่างสมบูรณ์*
