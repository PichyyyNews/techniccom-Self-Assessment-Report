# 📘 TechSAR System Documentation & Project Handoff

> **TechSAR: ระบบงานประกันคุณภาพการศึกษาและรายงานการประเมินตนเอง (Self-Assessment Report)**  
> วิทยาลัยเทคนิคคอมพิวเตอร์ | Computer Technical College  
> **Repository:** [https://github.com/PichyyyNews/techniccom-Self-Assessment-Report](https://github.com/PichyyyNews/techniccom-Self-Assessment-Report)  
> **Infrastructure Docs:** [https://github.com/PichyyyNews/LBtech-Techniccom-server-proxmox](https://github.com/PichyyyNews/LBtech-Techniccom-server-proxmox)  
> **วันที่จัดทำเอกสาร (Date):** 28 สิงหาคม 2026  
> **เวอร์ชัน (Version):** 1.3.0 (Dynamic License Configuration, Preset Chips & Social Profile Edition)

---

## 📑 สารบัญ (Table of Contents)
1. [ภาพรวมสถาปัตยกรรมระบบ (System Architecture & Topology)](#1-ภาพรวมสถาปัตยกรรมระบบ-system-architecture--topology)
2. [สิทธิ์การใช้งานและความปลอดภัย (Roles & Security Permissions)](#2-สิทธิ์การใช้งานและความปลอดภัย-roles--security-permissions)
3. [ระบบโปรไฟล์บุคลากรและดูโปรไฟล์บุคคลอื่น (Social Profile & Permissions)](#3-ระบบโปรไฟล์บุคลากรและดูโปรไฟล์บุคคลอื่น-social-profile--permissions)
4. [ระบบใบอนุญาตประกอบวิชาชีพและคุณวุฒิสายอาชีพ (Teacher & Vocational Licenses)](#4-ระบบใบอนุญาตประกอบวิชาชีพและคุณวุฒิสายอาชีพ-teacher--vocational-licenses)
5. [ระบบจัดการประเภทใบอนุญาตและตัวเลือกแนะนำสำหรับ Admin (License Config & Preset Chips)](#5-ระบบจัดการประเภทใบอนุญาตและตัวเลือกแนะนำสำหรับ-admin-license-config--preset-chips)
6. [ศูนย์ควบคุมและมอนิเตอร์ระบบ (System Monitor & Telemetry Command Center)](#6-ศูนย์ควบคุมและมอนิเตอร์ระบบ-system-monitor--telemetry-command-center)
7. [ระบบสำรองข้อมูลและ Snapshot (Database Backup & Restore System)](#7-ระบบสำรองข้อมูลและ-snapshot-database-backup--restore-system)
8. [โครงสร้างโค้ดและ API Endpoints (Codebase & API Reference)](#8-โครงสร้างโค้ดและ-api-endpoints-codebase--api-reference)
9. [ตัวแปรสภาพแวดล้อม (Environment Variables)](#9-ตัวแปรสภาพแวดล้อม-environment-variables)
10. [คู่มือการติดตั้งและรันระบบ (Setup & Deployment Guide)](#10-คู่มือการติดตั้งและรันระบบ-setup--deployment-guide)

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
   - กำหนดสิทธิ์การเข้าถึงหน้าระบบ (`permissions: string[]`) เช่น `["/dashboard", "/admin/users"]`
   - กำหนดสิทธิ์การดูหรือแก้ไขโปรไฟล์ผู้อื่น (`/profile:view_others`, `/profile:edit_others`)
3. **การรักษาความปลอดภัย (Security Enforcement)**:
   - `NextAuth.js` ซิงก์ข้อมูลสิทธิ์ผู้ใช้งานสดจากฐานข้อมูล PostgreSQL เสมอ (Live DB Session Sync)
   - `middleware.ts` ตรวจจับและป้องกัน Route อัตโนมัติ (Unauthorized Redirect ไปหน้า `/dashboard` ทันที)

---

## 3. ระบบโปรไฟล์บุคลากรและดูโปรไฟล์บุคคลอื่น (Social Profile & Permissions)

หน้าโปรไฟล์ (`/profile` และ `/profile/[id]`) ได้รับการออกแบบตามมาตรฐาน Social Profile สากล (Twitter / LinkedIn Architecture):

- **Header Card & Identity**:
  - รูปโปรไฟล์ (Avatar) พร้อมระบบอัปโหลดลากวาง (Drag & Drop) บันทึกลง MinIO S3 มี Fallback ตัวอักษรย่อเมื่อรูปยังไม่โหลด
  - ชื่อ-นามสกุล, Badge ยศ/สิทธิ์, ตำแหน่ง, วันเกิด (คำนวณเลขอายุอัตโนมัติ), เบอร์โทร, และอีเมล
  - ปุ่ม **คัดลอกลิงก์โปรไฟล์ (Share Profile Link)** เพื่อส่งต่อให้ผู้อื่นดูข้อมูล
- **การเข้าดูโปรไฟล์ผู้อื่น (Social Profile View - `/profile/[id]`)**:
  - ผู้ดูแลระบบหรือผู้มียศที่มีสิทธิ์ สามารถคลิกไอคอนดวงตา (👁️) จากหน้ารายชื่อผู้ใช้ เพื่อเปิดดูโปรไฟล์ของบุคลากรท่านนั้นๆ
  - ระบบตรวจสอบสิทธิ์: หากมียศที่อนุญาตให้แก้ไขได้ (หรือเป็น ROOT) จะแสดงปุ่มแก้ไขตามปกติ หากมียศที่ดูได้อย่างเดียว ระบบจะซ่อนปุ่มแก้ไขเพื่อป้องกันการดัดแปลงข้อมูล
- **Contribution Activity (ตารางกิจกรรม Real-Time)**:
  - Responsive Heatmap แสดงผล 52 สัปดาห์เต็มความกว้างของการ์ด เชื่อมต่อกับตาราง `ActivityLog` ใน PostgreSQL 100%
- **Modular Section-Specific Edit Modals**:
  1. *ข้อมูลพื้นฐาน (Basic Info)*: รูปโปรไฟล์, ชื่อ-นามสกุล, ตำแหน่ง, เบอร์โทร, วันเกิด, ประวัติย่อ
  2. *ประวัติการศึกษา (Education)*: เพิ่ม/ลบ ระดับการศึกษา, สาขาวิชา, สถาบัน, ปีที่จบ
  3. *ประวัติการทำงาน (Work Experience)*: เพิ่ม/ลบ ตำแหน่ง, องค์กร/หน่วยงาน, ระยะเวลา
  4. *ข้อมูลใบอนุญาตประกอบวิชาชีพ / คุณวุฒิวิชาชีพ (Teacher Licenses)*: บันทึกข้อมูลใบอนุญาตแบบละเอียด
  5. *ทักษะความเชี่ยวชาญ (Skills)*: เพิ่ม/ลบ แท็กทักษะ
  6. *เปลี่ยนรหัสผ่าน (Password Change)*: เปลี่ยนรหัสผ่านใหม่

---

## 4. ระบบใบอนุญาตประกอบวิชาชีพและคุณวุฒิสายอาชีพ (Teacher & Vocational Licenses)

ออกแบบรองรับบริบทจริงของวิทยาลัยเทคนิคสังกัด สอศ. และมาตรฐานวิชาชีพครู (คุรุสภา) โดยแยกจัดเก็บในตาราง `TeacherLicense`:

1. **ใบอนุญาตประกอบวิชาชีพครู (คุรุสภา)**:
   - **B-License (ชั้นต้น)**: อายุ 5 ปี (มาตรฐานสำหรับครูจบ ป.ตรีครุศาสตร์/ศึกษาศาสตร์ หรือ ป.บัณฑิต)
   - **A-License (ชั้นสูง)**: อายุ 7 ปี (มาตรฐานขั้นสูง มีผลงานประเมินระดับเชี่ยวชาญ)
   - **P-License (ปฏิบัติหน้าที่ครู)**: อายุ 2 ปี (ผู้ผ่านเกณฑ์ทดสอบรับรองความรู้คุรุสภา)
2. **หนังสืออนุญาตปฏิบัติการสอนโดยไม่มีใบประกอบฯ (ผ่อนผันคุรุสภา สอศ.)**:
   - สำหรับ **ครูพิเศษสอน / ครูจ้างสอนสายช่าง** ที่จบ ป.ตรี วิศวกรรมศาสตร์/เทคโนโลยี แต่ยังไม่มีใบประกอบวิชาชีพครู
   - บันทึกการขอรับการผ่อนผัน **ครั้งที่ 1, ครั้งที่ 2, ครั้งที่ 3** (คราวละ 2 ปี รวมไม่เกิน 6 ปี)
   - **ระบบแจ้งเตือนรอบที่ 3**: แสดงกล่องเตือนสีแดงแจ้งเตือนว่าเป็นการผ่อนผันครั้งสุดท้าย ต้องเร่งพัฒนาวุฒิครูก่อนหมดอายุ
3. **คุณวุฒิวิชาชีพและมาตรฐานฝีมือแรงงานเฉพาะทางสายอาชีวะ**:
   - **คุณวุฒิวิชาชีพ (TPQI)**: สถาบันคุณวุฒิวิชาชีพ เช่น สาขา IT, นักพัฒนาระบบ, ดิจิทัลคอนเทนต์
   - **มาตรฐานฝีมือแรงงานแห่งชาติ (DSD)**: กรมพัฒนาฝีมือแรงงาน เช่น ช่างซ่อมไมโครคอมพิวเตอร์, ช่างติดตั้งเครือข่าย
   - **ใบประกอบวิชาชีพวิศวกรรมควบคุม (กว.)**: สภาวิศวกร เช่น วิศวกรรมคอมพิวเตอร์, วิศวกรรมไฟฟ้า
   - **ใบรับรองมาตรฐานวิชาชีพสากล (International Certifications)**: เช่น Cisco CCNA, CompTIA Security+, Microsoft Certified
4. **ระบบแจ้งเตือนวันหมดอายุ (Expiration Badges & Days Counter)**:
   - คำนวณวันหมดอายุอัตโนมัติตามอายุเริ่มต้นของใบอนุญาตประเภทนั้นๆ
   - Badge สถานะ: `ปกติ (Active)`, `กำลังจะหมดอายุ (Expiring Soon - ภายใน 90 วัน)`, `หมดอายุแล้ว (Expired)`, และ `อยู่ระหว่างยื่นคำขอต่ออายุ (In Renewal)`
   - รองรับการแนบไฟล์หลักฐานเอกสาร (PDF/PNG/JPG) ผ่าน MinIO S3 พร้อมปุ่มดู/ดาวน์โหลดไฟล์

---

## 5. ระบบจัดการประเภทใบอนุญาตและตัวเลือกแนะนำสำหรับ Admin (Dedicated Page: `/admin/licenses`)

ระบบได้แยกหน้าสำหรับบริหารจัดการประเภทใบอนุญาตและมาตรฐานวิชาชีพออกมาเป็นหน้าเฉพาะ (**`/admin/licenses`**) พร้อมเพิ่มเข้าแถบเมนู Sidebar ในหมวดการบริหารข้อมูลบุคลากร:

- **การตั้งค่าประเภทใบอนุญาต (License Configurations CRUD)**:
  - เพิ่ม/แก้ไข/ลบ ประเภทใบอนุญาตได้เองโดยไม่ต้องแก้ไขโค้ด
  - กำหนด รหัสประเภท (Code), ชื่อภาษาไทย (Title), คำอธิบาย (Description), หมวดหมู่ (KSP / Vocational / Other)
  - กำหนด **อายุใช้งานเริ่มต้น (defaultYears)**, หน่วยงานผู้ออก (Issuer), โทนสี และไอคอน
  - เปิด/ปิดตัวเลือก: **รอบผ่อนผัน (requiresProvisionalRound)** และ **ให้ระบุสาขา/ระดับ (requiresTitle)**
  - ป้องกันการลบประเภทใบอนุญาตหากมีบุคลากรในระบบกำลังใช้งานอยู่
- **ระบบจัดการตัวเลือกแนะนำแบบไดนามิก (Dynamic Preset Chips Manager)**:
  - Admin สามารถเพิ่มหรือลบตัวเลือกแนะนำ (Preset Chips) ได้แบบ Inline บนการ์ด หรือใน Modal (เช่น `+ สาขาวิชาชีพ AI และ Data`, `+ ช่างซ่อมไมโครคอมพิวเตอร์ ระดับ 2`)
  - เมื่อผู้ใช้งานเปิด Modal เพิ่มใบอนุญาตในหน้า `/profile` ชิปเหล่านี้จะปรากฏให้ผู้ใช้คลิกเลือกเพื่อเติมข้อความลงในช่องสาขา/ระดับได้ทันที
- **ปุ่มคืนค่าเริ่มต้นมาตรฐาน (Reset Defaults)**:
  - 1-Click Reset กู้คืนประเภทใบอนุญาตและชิปตัวเลือกแนะนำมาตรฐานของ สอศ., คุรุสภา, TPQI, DSD, กว. และสากล กลับสู่ค่าตั้งต้น

---

## 6. ศูนย์ควบคุมและมอนิเตอร์ระบบ (System Monitor & Telemetry Command Center)

หน้าศูนย์ควบคุมระบบ (`/admin/system`) สงวนสิทธิ์เฉพาะ **ROOT** เท่านั้น:

1. **Dual-Node Real-Time Streaming (อัปเดตสดทุก 2.5 วินาที)**:
   - **Node 1: เครื่อง App Server (Web Host)**: สตรีม % CPU (จำนวน Core / รุ่น), การใช้งาน RAM (ใช้ไป / คงเหลือ / ทั้งหมด GB), Heap Used (MB), Node Version, และ Uptime
   - **Node 2: เครื่อง Database Server (Proxmox CT 102)**: สตรีม Query Load CPU บน 2 vCPUs, RAM ที่ใช้งานจริง (จาก 4.0 GB), พื้นที่ฮาร์ดดิสก์ (**ใช้ไป / คงเหลือจาก 32.0 GB**), สถานะ PostgreSQL (Port 5432 / Ping ms / Active Connections), และสถานะ MinIO S3 (Port 9000 / Ping ms / จำนวนไฟล์)
2. **วิเคราะห์ขนาดตารางใน Database (PostgreSQL Tables Breakdown)**:
   - แสดงรายการตาราง `User`, `RoleDefinition`, `TeacherLicense`, `LicenseTypeConfig`, `ActivityLog` พร้อม **จำนวนแถวจริง (Row Count)** และ **ขนาดพื้นที่จริงบนดิสก์ (`pg_total_relation_size`)**
3. **Active SQL Queries Monitor (`pg_stat_activity`)**:
   - แสดงคำสั่ง SQL Query ที่กำลังทำงานสด, Process ID (PID), ผู้ใช้งาน และระยะเวลาที่ทำงาน
4. **Streaming Audit Logs**:
   - บันทึกกิจกรรมระบบสตรีมสดเข้าสู่หน้าจอทันที พร้อมระบบค้นหา Real-Time
5. **Environment Variables Inspector**:
   - ตรวจสอบค่าตัวแปร ENV ที่โหลดในระบบ พร้อมปุ่มกดแสดง/ซ่อนค่า Secret

---

## 7. ระบบสำรองข้อมูลและ Snapshot (Database Backup & Restore System)

- **ปุ่มสร้าง Snapshot**: กดปุ่มเพื่อเปิด **Modal สร้าง Snapshot**
  - กำหนด **ชื่อ Snapshot (Name)**: เช่น *"สำรองข้อมูลก่อนเริ่มปีการศึกษาใหม่"*
  - กำหนด **คำอธิบายเพิ่มเติม (Description)**: บันทึกเหตุผลในการสำรองข้อมูล
  - แสดงกล่องสรุปข้อมูลผู้ใช้, ยศ/สิทธิ์, และใบอนุญาตที่จะถูกจัดเก็บ
- **การจัดเก็บข้อมูล**:
  - แปลงข้อมูล Users, Roles, TeacherLicenses, LicenseConfigs, ActivityLogs เป็น JSON Snapshot แล้วอัปโหลดไปยัง MinIO S3 Bucket `qa-evidences/system-backups/`
  - บันทึกลง `ActivityLog` พร้อมชื่อผู้สร้างและขนาดไฟล์
- **การดาวน์โหลด**:
  - รายการ Snapshot แสดงชื่อตัวหนา คำอธิบาย และปุ่มกด **ดาวน์โหลดไฟล์ JSON** ลงเครื่องได้ทันที

---

## 8. โครงสร้างโค้ดและ API Endpoints (Codebase & API Reference)

```
services/qa-web/
├── prisma/
│   └── schema.prisma                  # PostgreSQL Schema (User, RoleDefinition, TeacherLicense, LicenseTypeConfig, ActivityLog)
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   ├── admin/licenses/        # ตั้งค่าประเภทใบอนุญาต & มาตรฐานวิชาชีพ (แยกหน้าเดี่ยว)
│   │   │   ├── admin/system/          # ศูนย์มอนิเตอร์และตั้งค่าโครงสร้างระบบ (ROOT Only)
│   │   │   └── admin/users/           # จัดการผู้ใช้งานและยศ/สิทธิ์การใช้งาน (2 Tabs: Users & Roles)
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/             # หน้าหลักแดชบอร์ดข้อมูลบุคลากร
│   │   │   └── profile/               # หน้าโปรไฟล์ส่วนตัว และ Social Profile View (/profile/[id])
│   │   ├── api/
│   │   │   ├── admin/license-categories/ # CRUD APIs สำหรับหมวดหมู่ใบอนุญาต
│   │   │   ├── admin/license-configs/ # CRUD APIs + Reset Defaults + Preset Chips Manager
│   │   │   ├── admin/roles/           # CRUD APIs สำหรับจัดการยศ/สิทธิ์
│   │   │   ├── admin/system/backup/   # GET/POST Snapshot สำรองข้อมูล S3
│   │   │   ├── admin/system/logs/     # GET ดึง System Audit Logs
│   │   │   ├── admin/system/metrics/  # GET สตรีมมิ่ง Telemetry 2 Nodes สด
│   │   │   ├── admin/system/status/   # GET เช็กสถานะ Health Ping
│   │   │   ├── admin/users/           # CRUD APIs สำหรับจัดการบัญชีผู้ใช้
│   │   │   ├── auth/[...nextauth]/    # NextAuth.js Authentication Handlers
│   │   │   ├── files/[...key]/        # S3 File Stream & Download Proxy
│   │   │   ├── license-categories/    # GET ดึงหมวดหมู่ใบอนุญาตที่ Active
│   │   │   ├── license-configs/       # GET ดึงประเภทใบอนุญาตที่ Active สำหรับหน้าโปรไฟล์
│   │   │   ├── profile/               # GET/PUT อัปเดตโปรไฟล์ตนเองและประวัติใบอนุญาต
│   │   │   ├── profile/[id]/          # GET/PUT ดูและแก้ไขโปรไฟล์ผู้อื่น (ตามสิทธิ์ RBAC)
│   │   │   └── upload/                # อัปโหลดรูปภาพและไฟล์หลักฐานไปยัง MinIO S3
│   │   └── login/                     # หน้าเข้าสู่ระบบ
│   ├── components/
│   │   ├── layout/                    # AppShell, AppSidebar (Grouped Nav), Navbar, SidebarContext
│   │   ├── profile/                   # ContributionGraph (Responsive 52-Week Heatmap)
│   │   └── ui/                        # ImageUpload, DocumentUpload
│   ├── lib/
│   │   ├── activity.ts                # ฟังก์ชันบันทึก ActivityLog กลาง
│   │   ├── auth.ts                    # NextAuth Configuration & Live DB Callback
│   │   ├── license-defaults.ts        # รายการค่าตั้งต้นใบอนุญาตและ Auto-Seed Helper
│   │   ├── prisma.ts                  # Prisma Client Singleton
│   │   └── s3.ts                      # AWS SDK S3 Client สำหรับ MinIO
│   └── middleware.ts                  # Route Protection & RBAC Guard
```

---

## 9. ตัวแปรสภาพแวดล้อม (Environment Variables)

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

## 10. คู่มือการติดตั้งและรันระบบ (Setup & Deployment Guide)

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
  - สิทธิ์: `ROOT` (เข้าถึงทุกหน้า รวมถึง `/admin/system` และ `/admin/users`)

---

*เอกสารฉบับนี้จัดทำขึ้นเพื่อใช้ส่งมอบงานและอ้างอิงการพัฒนาต่อยอดระบบ TechSAR อย่างสมบูรณ์*
