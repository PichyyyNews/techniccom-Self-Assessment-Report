# ผังโครงสร้างเซิร์ฟเวอร์และการเชื่อมต่อ (Server & Network Architecture)

ระบบประกันคุณภาพการศึกษาและรายงานการประเมินตนเอง (TechSAR) แบ่งการทำงานออกเป็น Service ย่อย โดยเชื่อมต่อกับ Proxmox Server (`Techniccom`) ดังนี้:

```mermaid
flowchart TB
    subgraph Local_Dev["💻 เครื่องคอมพิวเตอร์ Local Developer (Windows)"]
        LocalWeb["Next.js 15 Web & API\n(services/qa-web)\nlocalhost:3000"]
        LocalEnv["ไฟล์ .env.local\n- DATABASE_URL\n- S3_ENDPOINT"]
    end

    subgraph Tailscale["🔒 โครงข่าย Tailscale VPN (100.125.250.85)"]
        TS["Subnet Router / Direct Connection\n(เข้าถึง IP วง 10.10.10.0/24)"]
    end

    subgraph Proxmox_Host["🖥️ Proxmox Host (Techniccom - 10.10.10.1)"]
        subgraph CT102["📦 CT 102: database-server (10.10.10.102)"]
            PG["🐘 PostgreSQL 16 Container\n(Port 5432)"]
            MINIO["🪣 MinIO S3 Storage Container\n(API: 9000 / Console: 9001)"]
            MINIO_INIT["MinIO Auto-Init Bucket\n(qa-evidences)"]
        end

        subgraph CT104["📦 CT 104: techsar-web (10.10.10.104) [เตรียมไว้สำหรับ Deploy ภายหลัง]"]
            DOCKER_WEB["Next.js Web Container (Port 3000)"]
            NGINX["Nginx Reverse Proxy (Port 80)"]
        end
    end

    LocalWeb --> TS
    TS -->|"Port 5432"| PG
    TS -->|"Port 9000/9001"| MINIO
```

## สรุปตาราง IP และพอร์ตเชื่อมต่อ

| Service | ที่อยู่ของระบบ (Location) | IP / Hostname | พอร์ต | หน้าที่หลัก |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL 16** | CT 102 (`database-server`) | `10.10.10.102` | `5432` | ฐานข้อมูลหลัก (Prisma ORM) |
| **MinIO API** | CT 102 (`database-server`) | `10.10.10.102` | `9000` | S3-Compatible Object Storage สำหรับเก็บเอกสารร่องรอย SAR |
| **MinIO Console** | CT 102 (`database-server`) | `10.10.10.102` | `9001` | แผงควบคุม MinIO Web UI |
| **Next.js Web App** | Local Machine (ช่วง Dev) | `localhost` | `3000` | เว็บแอปพลิเคชันและ API Routes |
| **Web Server (Prod)**| CT 104 (`techsar-web`) | `10.10.10.104` | `80, 3000` | รองรับการ Deploy ในอนาคต |
