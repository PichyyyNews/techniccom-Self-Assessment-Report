# คู่มือสรุปการติดตั้งระบบ ปัญหาที่พบ และข้อควรระวัง (System Setup & Postmortem Guide) 🛠️📘

เอกสารฉบับนี้สรุปรายละเอียดการติดตั้ง เชื่อมต่อ และแก้ปัญหาทั้งหมดในการเชื่อมระบบ **TechSAR (Next.js 15 + Prisma 6)** จากเครื่องคอมพิวเตอร์ Local เข้ากับ **Database & Storage Services (PostgreSQL 16 + MinIO)** บน **Proxmox VE (CT 102)** ผ่านเครือข่าย **Tailscale VPN**

---

## 🏛️ 1. สถาปัตยกรรมการเชื่อมต่อจริง (Live Architecture)

```
[ เครื่องพัฒนา Local (Windows) ] (Tailscale: 100.71.127.118)
  ├── Next.js 15 (App Router, Tailwind CSS, NextAuth, Prisma 6)
  └── ชี้ไปยัง: 100.125.250.85:5432 (PostgreSQL) และ 100.125.250.85:9000 (MinIO)
          │
          ▼ (เข้ารหัสผ่าน Tailscale Network)
[ Proxmox Host: techniccom ] (Debian 12 - Tailscale: 100.125.250.85)
  ├── iptables NAT Port Forwarding:
  │     • 100.125.250.85:5432 ➔ 10.10.10.102:5432 (PostgreSQL)
  │     • 100.125.250.85:9000 ➔ 10.10.10.102:9000 (MinIO API)
  │     • 100.125.250.85:9001 ➔ 10.10.10.102:9001 (MinIO Console)
  └── Private Host-Only Bridge (vmbr1: 10.10.10.1/24)
          │
          ▼
[ CT 102: database-server ] (Debian 12 LXC - IP: 10.10.10.102)
  ├── Docker CE & Docker Compose Plugin
  ├── Container: qa_postgres (PostgreSQL 16 Alpine - Port 5432)
  ├── Container: qa_minio (MinIO S3 Server - Port 9000 / Console 9001)
  └── Container: qa_minio_init (Auto-create Bucket: 'qa-evidences')
```

---

## 📋 2. ขั้นตอนทั้งหมดที่ได้ดำเนินการจนสำเร็จ (What Was Done)

1. **คอนฟิกเครื่องย่อย CT 102 บน Proxmox Host**:
   - เปิดฟีเจอร์ Nesting: `pct set 102 -features nesting=1,keyctl=1` เพื่อให้รัน Docker ใน LXC ได้
   - ขยาย RAM เป็น 2048 MB และ Swap 1024 MB เพื่อรองรับทั้ง PostgreSQL และ MinIO
   - ตั้งค่า DNS Nameserver: `pct set 102 -nameserver "8.8.8.8 1.1.1.1"`
2. **ติดตั้ง Docker และ Service ใน CT 102**:
   - ติดตั้ง Docker CE และ Compose Plugin ผ่าน official Debian repository
   - สร้างไฟล์ `/opt/techsar-services/docker-compose.yml`
   - รัน Container: `qa_postgres`, `qa_minio`, `qa_minio_init`
3. **ตั้งค่า Port Forwarding บน Proxmox Host**:
   - เปิด IP forwarding: `sysctl -w net.ipv4.ip_forward=1`
   - ตั้งค่า iptables DNAT ส่งพอร์ต 5432, 9000, 9001 ไปยัง `10.10.10.102`
   - ตั้งค่า iptables MASQUERADE
4. **ตั้งค่าฝั่ง Next.js Web App (เครื่อง Local)**:
   - อัปเดตไฟล์ `.env` และ `.env.local` ชี้ไปยัง `100.125.250.85`
   - รัน Migration: `npx prisma db push` สร้าง Schema ตารางข้อมูลใน PostgreSQL สำเร็จ
   - รัน Seeding: `npx tsx prisma/seed.ts` นำเข้าปีการศึกษา 2569, แผนกวิชา 5 แผนก, เกณฑ์มาตรฐาน สอศ. 5 ด้าน 21 ตัวบ่งชี้ และผู้ใช้ตัวอย่าง 5 บทบาท
   - หน้าเว็บ [http://localhost:3000](http://localhost:3000) แสดงสถานะ **"เชื่อมต่อแล้ว" (สีเขียว)**

---

## ⚠️ 3. ปัญหาที่พบ สาเหตุ และวิธีแก้ไข (Root Causes & Lessons Learned)

### 🔴 ปัญหาที่ 1: CT 102 ออกอินเทอร์เน็ตไม่ได้ (`Temporary failure resolving deb.debian.org`)
* **อาการ:** รัน `apt update` ภายใน CT 102 แล้วติด Error ไม่สามารถ Resolve Domain ของ Debian Repository ได้
* **สาเหตุ:** CT 102 ผูกอยู่กับ Private Bridge `vmbr1` (`10.10.10.102`) โดยไม่มี DNS Nameserver เริ่มต้น ทำให้ไม่รู้จัก DNS ภายนอก
* **วิธีแก้:** ต้องกำหนด Nameserver ให้ CT 102 ชี้ไปที่ `8.8.8.8` และ `1.1.1.1`:
  ```bash
  pct set 102 -nameserver "8.8.8.8 1.1.1.1"
  pct exec 102 -- bash -c 'echo "nameserver 8.8.8.8" > /etc/resolv.conf'
  ```
* **ข้อควรระวังในอนาคต:** คอนเทนเนอร์ LXC ทุกตัวที่สร้างใหม่บน `vmbr1` จะต้องตั้งค่า DNS และ Gateway ให้ถูกต้องก่อนสั่งติดตั้งแพ็กเกจเสมอ

---

### 🔴 ปัญหาที่ 2: Build Error บน Next.js (`Export NextResponse doesn't exist in target module`)
* **อาการ:** หน้าเว็บ Crash หรือ Build Error ในไฟล์ `src/middleware.ts`
* **สาเหตุ:** มีการเขียน Import ผิดเป็น `import { NextResponse } from "next/navigation"`
* **วิธีแก้:** ใน Next.js 14/15/16 App Router ออบเจกต์ `NextResponse` ต้องนำเข้าจาก `"next/server"` เท่านั้น:
  ```typescript
  // ❌ ผิด
  import { NextResponse } from "next/navigation";
  
  // ✅ ถูกต้อง
  import { NextResponse } from "next/server";
  ```

---

### 🔴 ปัญหาที่ 3: Prisma Schema Validation Error เนื่องจาก UTF-8 BOM
* **อาการ:** `npx prisma generate` ฟ้อง Error ว่าบรรทัดแรกของไฟล์ `schema.prisma` มี Syntax ผิดพลาด ทั้งที่มองด้วยตาเปล่าดูปกติ
* **สาเหตุ:** การใช้คำสั่ง `Out-File -Encoding UTF8` บน Windows PowerShell จะแนบอักขระ **Byte Order Mark (BOM: `\uFEFF`)** ไว้ที่ไบต์แรกของไฟล์ ซึ่งทำให้ Compiler และ Prisma Parser เกิดข้อผิดพลาด
* **วิธีแก้:** ต้องบันทึกไฟล์เป็น **UTF-8 (Without BOM)** เสมอ หรือตัดอักขระ `\uFEFF` ออกก่อนใช้งาน

---

### 🔴 ปัญหาที่ 4: SSH Sudo Password Rejected เมื่อเปิด Pseudo-Terminal (PTY)
* **อาการ:** ส่งคำสั่งผ่าน Paramiko SSH ด้วย `echo password | sudo -S ...` แล้วขึ้น `sudo: 3 incorrect password attempts` จนโดน Lockout
* **สาเหตุ:** การเรียกใช้ `client.exec_command(..., get_pty=True)` จะทำให้เซสชันกลายเป็น Interactive Terminal ซึ่งคำสั่ง `sudo` จะไม่ยอมอ่านรหัสผ่านจาก Standard Input Pipe
* **วิธีแก้:** เมื่อต้องการ Pipe รหัสผ่านเข้า `sudo -S` ต้องตั้งค่า `get_pty=False` เสมอ

---

### 🔴 ปัญหาที่ 5: Prisma CLI บนเครื่อง Local หา `DATABASE_URL` ไม่พบ
* **อาการ:** หน้าเว็บ Next.js รันได้ปกติ แต่เมื่อสั่ง `npx prisma db push` ผ่าน Terminal กลับฟ้องว่า `Environment variable not found: DATABASE_URL`
* **สาเหตุ:** Next.js จะโหลดไฟล์ `.env.local` ให้อัตโนมัติ แต่ Prisma CLI แบบ Standalone จะอ่านเฉพาะไฟล์ `.env` เป็นค่าเริ่มต้น
* **วิธีแก้:** ต้องมีไฟล์ `.env` ควบคู่กับ `.env.local` เพื่อให้ทั้ง Next.js และ Prisma CLI ทำงานได้ถูกต้อง

---

## 🔒 4. ข้อควรระวังสำหรับระบบความปลอดภัยและการดูแลรักษา (Operations Best Practices)

1. **การรีสตาร์ท Proxmox Host**:
   - กฎ iptables NAT ที่ตั้งค่าไว้ หากเครื่อง Proxmox ถูก Reboot อาจหลุดได้ แนะนำให้บันทึกกฎไว้ถาวรด้วย `iptables-persistent` บน Host:
     ```bash
     apt install -y iptables-persistent
     netfilter-persistent save
     ```
2. **การสำรองข้อมูล Database & MinIO**:
   - ข้อมูล PostgreSQL เก็บอยู่ใน Docker Volume `qa_postgres_data`
   - ข้อมูล MinIO S3 เก็บอยู่ใน Docker Volume `qa_minio_data`
   - สามารถใช้คำสั่งสำรองข้อมูลผ่าน Proxmox Backup หรือคำสั่ง `docker exec qa_postgres pg_dump -U qa_admin qa_system_db > backup.sql`
3. **การเข้าใช้งาน MinIO Console**:
   - แผงควบคุม MinIO Web UI เข้าได้ที่: `http://100.125.250.85:9001`
   - User: `minioadmin` / Password: `miniopassword123`

---

*จัดทำเอกสารและปรับปรุงล่าสุด: สิงหาคม 2569*
