# ระบบประกันคุณภาพการศึกษาและรายงานการประเมินตนเองระดับแผนกวิชา
### Department Self-Assessment Report & Quality Assurance System (TechSAR)
> **ระบบบริหารจัดการงานประกันคุณภาพการศึกษาและจัดทำรายงานการประเมินตนเอง (SAR) สำหรับแผนกวิชาในวิทยาลัยเทคนิค สังกัดสำนักงานคณะกรรมการการอาชีวศึกษา (สอศ.)**

---

## 🏛️ โครงสร้างสถาปัตยกรรมระบบ (Modular Architecture)

ระบบได้รับการออกแบบเป็น Modular / Microservices Architecture เพื่อความยืดหยุ่นและการขยายตัว:

```
techniccom-Self-Assessment-Report/
├── services/
│   ├── qa-web/                     # Next.js 15+ (App Router, TypeScript, Tailwind, Prisma, NextAuth)
│   ├── database/                   # PostgreSQL 16 Service สำหรับ Proxmox CT 102 (Port 5432)
│   └── storage/                    # MinIO S3 Object Storage สำหรับ Proxmox CT 102 (Port 9000/9001)
├── deploy/                         # Docker Compose สำหรับ Production & Nginx Configuration
│   ├── nginx/default.conf
│   └── docker-compose.prod.yml
├── scripts/                        # สคริปต์อัตโนมัติสำหรับ Proxmox และ Local Development
│   ├── setup-proxmox-ct102-db.sh   # สคริปต์ติดตั้ง Docker + PostgreSQL + MinIO บน CT 102
│   ├── setup-proxmox-ct104-web.sh  # สคริปต์สร้าง CT 104 (techsar-web) สำหรับ Deploy ภายหลัง
│   └── start-local-dev.bat         # สคริปต์เริ่มรัน Local Dev Server
├── docs/                           # เอกสารสถาปัตยกรรมและคู่มือการติดตั้ง
│   ├── server-architecture.md      # แผนผังเชื่อมโยง Local Dev <-> Proxmox
│   ├── setup-guide-thai.md         # คู่มือการติดตั้งทีละขั้นตอน (Step-by-Step)
│   └── standards-kpi.md            # รายละเอียดเกณฑ์มาตรฐาน 5 ด้านและตัวบ่งชี้ สอศ.
└── README.md
```

---

## ⚡ เริ่มต้นติดตั้งและใช้งาน (Quick Start)

### 1. ติดตั้ง Database & MinIO บน Proxmox CT 102 (10.10.10.102)
เข้า SSH ไปที่ Proxmox Host แล้วรันคำสั่ง:
```bash
bash scripts/setup-proxmox-ct102-db.sh
```
- **PostgreSQL 16**: รันที่ `10.10.10.102:5432` (User: `qa_admin`, DB: `qa_system_db`)
- **MinIO S3**: รันที่ `10.10.10.102:9000` (Console UI: `http://10.10.10.102:9001`)

### 2. รัน Next.js บนเครื่อง Local Developer (เชื่อมต่อไปยัง CT 102 ผ่าน Tailscale)
```bash
cd services/qa-web
cp .env.example .env.local
npm install
npx prisma generate
npm run dev
```
เข้าใช้งานผ่านเบราว์เซอร์: `http://localhost:3000`

---

## 👥 บทบาทผู้ใช้งานในระบบ (Roles & Permissions)

- **SUPER_ADMIN**: ผู้ดูแลระบบระดับวิทยาลัย / งานประกันคุณภาพ
- **EXECUTIVE**: ผู้บริหารวิทยาลัย
- **DEPARTMENT_HEAD**: หัวหน้าแผนกวิชา
- **FACULTY**: ครูผู้รับผิดชอบตัวบ่งชี้ / ครูในแผนก
- **AUDITOR**: คณะกรรมการประเมินคุณภาพภายใน

---

## 📋 อ้างอิงมาตรฐานการประกันคุณภาพ สอศ. 5 ด้าน
1. **มาตรฐานที่ 1**: คุณลักษณะของผู้สำเร็จการศึกษาอาชีวศึกษาที่พึงประสงค์
2. **มาตรฐานที่ 2**: การจัดการอาชีวศึกษา
3. **มาตรฐานที่ 3**: การสร้างสังคมแห่งการเรียนรู้
4. **มาตรฐานที่ 4**: การบริการวิชาชีพและจิตอาสา
5. **มาตรฐานที่ 5**: การบริหารจัดการและภาวะผู้นำ

อ่านรายละเอียดเพิ่มเติมใน [docs/SYSTEM_SETUP_AND_TROUBLESHOOTING.md](docs/SYSTEM_SETUP_AND_TROUBLESHOOTING.md) (สรุปปัญหาที่พบและวิธีแก้ไข) และ [docs/server_infrastructure.md](docs/server_infrastructure.md)

---

## 📄 ลิขสิทธิ์และการพัฒนา
© 2026 Technical College Department QA System (TechSAR). All rights reserved.
