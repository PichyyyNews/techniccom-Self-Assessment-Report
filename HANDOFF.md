# 📘 TechSAR System Documentation & Project Handoff

> **TechSAR: ระบบงานประกันคุณภาพการศึกษาและรายงานการประเมินตนเอง (Self-Assessment Report)**  
> วิทยาลัยเทคนิคคอมพิวเตอร์ | Computer Technical College  
> **Repository:** [https://github.com/PichyyyNews/techniccom-Self-Assessment-Report](https://github.com/PichyyyNews/techniccom-Self-Assessment-Report)  
> **Infrastructure Docs:** [https://github.com/PichyyyNews/LBtech-Techniccom-server-proxmox](https://github.com/PichyyyNews/LBtech-Techniccom-server-proxmox)  
> **วันที่จัดทำเอกสาร (Date):** 28 สิงหาคม 2026  
> **เวอร์ชัน (Version):** 1.2.0 (Dual-Node Real-Time Streaming & Snapshot System)

---

## 📑 สารบัญ (Table of Contents)
1. [ภาพรวมสถาปัตยกรรมระบบ (System Architecture & Topology)](#1-ภาพรวมสถาปัตยกรรมระบบ-system-architecture--topology)
2. [สิทธิ์การใช้งานและความปลอดภัย (Roles & Security Permissions)](#2-สิทธิ์การใช้งานและความปลอดภัย-roles--security-permissions)
3. [ระบบโปรไฟล์และประวัติการทำงาน (Social Profile & Contribution Graph)](#3-ระบบโปรไฟล์และประวัติการทำงาน-social-profile--contribution-graph)
4. [ศูนย์ควบคุมและมอนิเตอร์ระบบ (System Monitor & Telemetry Command Center)](#4-ศูนย์ควบคุมและมอนิเตอร์ระบบ-system-monitor--telemetry-command-center)
5. [ระบบสำรองข้อมูลและ Snapshot (Database Backup & Restore System)](#5-ระบบสำรองข้อมูลและ-snapshot-database-backup--restore-system)
6. [โครงสร้างโค้ดและ API Endpoints (Codebase & API Reference)](#6-โครงสร้างโค้ดและ-api-endpoints-codebase--api-reference)
7. [ตัวแปรสภาพแวดล้อม (Environment Variables)](#7-ตัวแปรสภาพแวดล้อม-environment-variables)
8. [คู่มือการติดตั้งและรันระบบ (Setup & Deployment Guide)](#8-คู่มือการติดตั้งและรันระบบ-setup--deployment-guide)

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
   - เข้าถึงได้ทุกหน้าในระบบ รวมถึง **`/admin/system` (ศูนย์มอนิเตอร์และตั้งค่า)**
2. **สิทธิ์แบบกำหนดเอง (Custom Dynamic Roles)**:
   - ผู้ดูแลระบบสามารถสร้าง/แก้ไข/ลบ ยศ/สิทธิ์ได้เอง เช่น *อาจารย์ผู้ประเมิน, หัวหน้าสาขาวิชา, เจ้าหน้าที่ประกันคุณภาพ*
   - กำหนดสี Badge ได้ 5 เฉดสี (`rose`, `blue`, `emerald`, `purple`, `amber`)
   - กำหนดสิทธิ์การเข้าถึงหน้าระบบ (`permissions: string[]`) เช่น `["/dashboard", "/admin/users"]`
3. **การรักษาความปลอดภัย (Security Enforcement)**:
   - `NextAuth.js` ซิงก์ข้อมูลสิทธิ์ผู้ใช้งานสดจากฐานข้อมูล PostgreSQL เสมอ (Live DB Session Sync)
   - `middleware.ts` ตรวจจับและป้องกัน Route อัตโนมัติ (Unauthorized Redirect ไปหน้า `/dashboard` ทันที)

---

## 3. ระบบโปรไฟล์และประวัติการทำงาน (Social Profile & Contribution Graph)

หน้าโปรไฟล์ส่วนตัว (`/profile`) ได้รับการออกแบบตามมาตรฐาน Social Profile สากล (Twitter / LinkedIn Architecture):

- **Header Card**:
  - รูปโปรไฟล์ (Avatar) พร้อมระบบอัปโหลดลากวาง (Drag & Drop) บันทึกลง MinIO S3
  - ชื่อ-นามสกุล, Badge ยศ/สิทธิ์, ตำแหน่ง, และอีเมล แสดงในการ์ดสีขาวอย่างสมบูรณ์แบบโดยไม่เกยทับหน้าปก
- **Contribution Activity (ตารางกิจกรรม Real-Time)**:
  - เชื่อมต่อกับตาราง `ActivityLog` ใน PostgreSQL 100% (ไม่ใช่ข้อมูล Mock)
  - Responsive Heatmap แสดงผล 52 สัปดาห์เต็มความกว้างของการ์ด พร้อมสเกลชื่อเดือน ม.ค. - ธ.ค. แม่นยำ
- **5 Modular Section-Specific Edit Modals**:
  1. *แก้ไขข้อมูลพื้นฐาน (Basic Info)*: รูปโปรไฟล์, ชื่อ-นามสกุล, ตำแหน่ง, เบอร์โทร, วันเกิด, ประวัติย่อ
  2. *แก้ไขประวัติการศึกษา (Education)*: เพิ่ม/ลบ ระดับการศึกษา, สาขาวิชา, สถาบัน, ปีที่จบ
  3. *แก้ไขประวัติการทำงาน (Work Experience)*: เพิ่ม/ลบ ตำแหน่ง, องค์กร/หน่วยงาน, ระยะเวลา
  4. *แก้ไขทักษะความเชี่ยวชาญ (Skills)*: เพิ่ม/ลบ ทักษะความเชี่ยวชาญ
  5. *เปลี่ยนรหัสผ่าน (Password Change)*: เปลี่ยนรหัสผ่านใหม่พร้อมยืนยันความปลอดภัย
- **Mobile Mode**: แสดงผลเป็น Bottom Sheet ยกจากขอบล่าง พร้อมปุ่มบันทึก Sticky Footer

---

## 4. ศูนย์ควบคุมและมอนิเตอร์ระบบ (System Monitor & Telemetry Command Center)

หน้าศูนย์ควบคุมระบบ (`/admin/system`) สงวนสิทธิ์เฉพาะ **ROOT** เท่านั้น:

### 🌟 ฟีเจอร์หลัก:
1. **Dual-Node Real-Time Streaming (อัปเดตสดทุก 2.5 วินาที)**:
   - **Node 1: เครื่อง App Server (Web Host)**: สตรีม % CPU (จำนวน Core / รุ่น), การใช้งาน RAM (ใช้ไป / คงเหลือ / ทั้งหมด GB), Heap Used (MB), Node Version, และ Uptime
   - **Node 2: เครื่อง Database Server (Proxmox CT 102)**: สตรีม Query Load CPU บน 2 vCPUs, RAM ที่ใช้งานจริง (จาก 4.0 GB), พื้นที่ฮาร์ดดิสก์ (**ใช้ไป / คงเหลือจาก 32.0 GB**), สถานะ PostgreSQL (Port 5432 / Ping ms / Active Connections), และสถานะ MinIO S3 (Port 9000 / Ping ms / จำนวนไฟล์)
2. **วิเคราะห์ขนาดตารางใน Database (PostgreSQL Tables Breakdown)**:
   - แสดงรายการตาราง `User`, `RoleDefinition`, `ActivityLog` พร้อม **จำนวนแถวจริง (Row Count)** และ **ขนาดพื้นที่จริงบนดิสก์ (`pg_total_relation_size`)**
3. **Active SQL Queries Monitor (`pg_stat_activity`)**:
   - แสดงคำสั่ง SQL Query ที่กำลังทำงานสด, Process ID (PID), ผู้ใช้งาน และระยะเวลาที่ทำงาน
4. **Streaming Audit Logs**:
   - บันทึกกิจกรรมระบบสตรีมสดเข้าสู่หน้าจอทันที พร้อมระบบค้นหา Real-Time
5. **Environment Variables Inspector**:
   - ตรวจสอบค่าตัวแปร ENV ที่โหลดในระบบ พร้อมปุ่มกดแสดง/ซ่อนค่า Secret
6. **Clean Light Theme & 100% Mobile Responsive Mode**:
   - คุมโทนสีขาว สะอาดตา กลมกลืนกับทุกหน้า พร้อม Mobile Card View และ Horizontal Scroll Tabs

---

## 5. ระบบสำรองข้อมูลและ Snapshot (Database Backup & Restore System)

- **ปุ่มสร้าง Snapshot**: กดปุ่มเพื่อเปิด **Modal สร้าง Snapshot**
  - กำหนด **ชื่อ Snapshot (Name)**: เช่น *"สำรองข้อมูลก่อนเริ่มเทอมใหม่"*
  - กำหนด **คำอธิบายเพิ่มเติม (Description)**: บันทึกเหตุผลในการสำรองข้อมูล
  - แสดงกล่องสรุปข้อมูลผู้ใช้และยศ/สิทธิ์ที่จะถูกจัดเก็บ
- **การจัดเก็บข้อมูล**:
  - แปลงข้อมูล Users, Roles, ActivityLogs เป็น JSON Snapshot แล้วอัปโหลดไปยัง MinIO S3 Bucket `qa-evidences/system-backups/`
  - บันทึกลง `ActivityLog` พร้อมชื่อผู้สร้างและขนาดไฟล์
- **การดาวน์โหลด**:
  - รายการ Snapshot แสดงชื่อตัวหนา คำอธิบาย และปุ่มกด **ดาวน์โหลดไฟล์ JSON** ลงเครื่องได้ทันที

---

## 6. โครงสร้างโค้ดและ API Endpoints (Codebase & API Reference)

```
services/qa-web/
├── prisma/
│   └── schema.prisma                # PostgreSQL Database Schema (User, RoleDefinition, ActivityLog)
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   ├── admin/system/        # ศูนย์มอนิเตอร์และตั้งค่าโครงสร้างระบบ (ROOT Only)
│   │   │   └── admin/users/         # จัดการผู้ใช้งานและกำหนดสิทธิ์แบบไดนามิก
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/           # หน้าหลักแดชบอร์ดข้อมูลบุคลากร
│   │   │   └── profile/             # หน้าโปรไฟล์ส่วนตัว Social Style + Contribution Graph
│   │   ├── api/
│   │   │   ├── admin/roles/         # CRUD APIs สำหรับจัดการยศ/สิทธิ์
│   │   │   ├── admin/system/backup/ # GET/POST Snapshot สำรองข้อมูล S3
│   │   │   ├── admin/system/logs/   # GET ดึง System Audit Logs
│   │   │   ├── admin/system/metrics/# GET สตรีมมิ่ง Telemetry 2 Nodes สด
│   │   │   ├── admin/system/status/ # GET เช็กสถานะ Health Ping
│   │   │   ├── admin/users/         # CRUD APIs สำหรับจัดการบัญชีผู้ใช้
│   │   │   ├── auth/[...nextauth]/  # NextAuth.js Authentication Handlers
│   │   │   ├── files/[...key]/      # S3 File Stream & Download Proxy
│   │   │   ├── profile/             # GET/PUT อัปเดตโปรไฟล์และสถิติกิจกรรม
│   │   │   └── upload/              # อัปโหลดรูปภาพและไฟล์หลักฐานไปยัง MinIO S3
│   │   └── login/                   # หน้าเข้าสู่ระบบ
│   ├── components/
│   │   ├── layout/                  # AppShell, AppSidebar, Navbar, SidebarContext
│   │   └── profile/                 # ContributionGraph (Responsive 52-Week Heatmap)
│   ├── lib/
│   │   ├── activity.ts              # ฟังก์ชันบันทึก ActivityLog กลาง
│   │   ├── auth.ts                  # NextAuth Configuration & Live DB Callback
│   │   ├── prisma.ts                # Prisma Client Singleton
│   │   └── s3.ts                    # AWS SDK S3 Client สำหรับ MinIO
│   └── middleware.ts                # Route Protection & RBAC Guard
```

---

## 7. ตัวแปรสภาพแวดล้อม (Environment Variables)

สร้างไฟล์ `.env` ในโฟลเดอร์ `services/qa-web/`:

```env
# Database Connection (PostgreSQL 16 in CT 102)
DATABASE_URL="postgresql://postgres:password123@100.125.250.85:5432/qa_system_db?schema=public"

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

## 8. คู่มือการติดตั้งและรันระบบ (Setup & Deployment Guide)

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
  - สิทธิ์: `ROOT` (เข้าถึงทุกหน้า รวมถึง `/admin/system`)

---

*เอกสารฉบับนี้จัดทำขึ้นเพื่อใช้ส่งมอบงานและอ้างอิงการพัฒนาต่อยอดระบบ TechSAR อย่างสมบูรณ์*
