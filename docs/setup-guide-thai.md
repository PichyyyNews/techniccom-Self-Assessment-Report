# คู่มือการติดตั้งและเชื่อมต่อระบบ (Step-by-Step Setup Guide)

คู่มือนี้สำหรับเตรียมระบบฐานข้อมูลบน Proxmox CT 102 และรัน Next.js บนเครื่อง Local

---

## ขั้นตอนที่ 1: ติดตั้ง PostgreSQL และ MinIO บน Proxmox CT 102

1. เข้า Proxmox Host ผ่าน SSH:
   ```bash
   ssh tc-admin@100.125.250.85
   # หรือเข้าผ่าน Console ของ Proxmox WebUI
   ```

2. รันสคริปต์อัตโนมัติ `setup-proxmox-ct102-db.sh`:
   ```bash
   # คัดลอกเนื้อหาจาก scripts/setup-proxmox-ct102-db.sh มารัน หรือสั่ง:
   curl -sSL https://raw.githubusercontent.com/PichyyyNews/techniccom-Self-Assessment-Report/main/scripts/setup-proxmox-ct102-db.sh | bash
   ```

3. ทดสอบการทำงานบน CT 102:
   - PostgreSQL จะเปิดพอร์ต `10.10.10.102:5432`
   - MinIO S3 Console เข้าได้ที่ `http://10.10.10.102:9001` (User: `minioadmin` / Password: `miniopassword123`)

---

## ขั้นตอนที่ 2: เตรียมเครื่อง Container CT 104 (สำหรับ Web Server ในอนาคต)

รันคำสั่งบน Proxmox Host:
```bash
curl -sSL https://raw.githubusercontent.com/PichyyyNews/techniccom-Self-Assessment-Report/main/scripts/setup-proxmox-ct104-web.sh | bash
```

---

## ขั้นตอนที่ 3: เริ่มต้นรันและพัฒนา Next.js บนเครื่อง Local

1. เข้าไปที่โฟลเดอร์ Web Service:
   ```bash
   cd services/qa-web
   ```

2. ตั้งค่าไฟล์ Environment:
   ```bash
   cp .env.example .env.local
   ```
   *(ตรวจสอบค่า `DATABASE_URL` และ `S3_ENDPOINT` ให้ชี้ไปยัง `10.10.10.102` ผ่าน Tailscale)*

3. รัน Migration / Prisma Generate:
   ```bash
   npx prisma generate
   # เมื่อเชื่อมต่อฐานข้อมูลบน CT 102 แล้ว ให้รัน:
   # npx prisma db push
   ```

4. สั่งรัน Development Server:
   ```bash
   npm run dev
   ```
   เปิดเบราว์เซอร์เข้าใช้งานที่ `http://localhost:3000`
