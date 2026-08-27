#!/usr/bin/env bash
# ==============================================================================
# Setup PostgreSQL 16 & MinIO on Proxmox CT 102 (database-server)
# รันคำสั่งนี้บน Proxmox Host (Node: Techniccom - 100.125.250.85)
# ==============================================================================

set -e

echo "=== [1/5] Configuring CT 102 on Proxmox Host ==="
# เปิด Nesting และ Keyctl เพื่อให้รัน Docker ใน LXC ได้
pct set 102 -features nesting=1,keyctl=1
# ปรับ RAM ให้เหมาะสม
pct set 102 -memory 2048 -swap 1024

echo "=== [2/5] Starting CT 102 if not running ==="
pct status 102 | grep -q "status: running" || pct start 102
sleep 3

echo "=== [3/5] Installing Docker inside CT 102 ==="
pct exec 102 -- bash -c '
set -e
apt update && apt install -y ca-certificates curl gnupg lsb-release git

if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update && apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable --now docker
else
    echo "Docker is already installed."
fi

mkdir -p /opt/techsar-services
'

echo "=== [4/5] Deploying PostgreSQL & MinIO Docker Compose into CT 102 ==="
pct exec 102 -- bash -c '
cat << "EOF" > /opt/techsar-services/docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    container_name: qa_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: qa_admin
      POSTGRES_PASSWORD: SuperSecretPassword123
      POSTGRES_DB: qa_system_db
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  minio:
    image: minio/minio:latest
    container_name: qa_minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: miniopassword123
    volumes:
      - miniodata:/data
    ports:
      - "9000:9000"
      - "9001:9001"

  minio-init:
    image: minio/mc:latest
    container_name: qa_minio_init
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      sleep 3;
      /usr/bin/mc alias set myminio http://minio:9000 minioadmin miniopassword123;
      /usr/bin/mc mb --ignore-existing myminio/qa-evidences;
      /usr/bin/mc anonymous set download myminio/qa-evidences;
      exit 0;
      "

volumes:
  pgdata:
  miniodata:
EOF

cd /opt/techsar-services
docker compose up -d
docker ps
'

echo "=== [5/5] Setting up Port Forwarding from Tailscale (100.125.250.85) to CT 102 ==="
sysctl -w net.ipv4.ip_forward=1 > /dev/null

# Forward PostgreSQL (5432)
iptables -t nat -C PREROUTING -p tcp --dport 5432 -j DNAT --to-destination 10.10.10.102:5432 2>/dev/null || \
iptables -t nat -A PREROUTING -p tcp --dport 5432 -j DNAT --to-destination 10.10.10.102:5432

# Forward MinIO API (9000)
iptables -t nat -C PREROUTING -p tcp --dport 9000 -j DNAT --to-destination 10.10.10.102:9000 2>/dev/null || \
iptables -t nat -A PREROUTING -p tcp --dport 9000 -j DNAT --to-destination 10.10.10.102:9000

# Forward MinIO Console (9001)
iptables -t nat -C PREROUTING -p tcp --dport 9001 -j DNAT --to-destination 10.10.10.102:9001 2>/dev/null || \
iptables -t nat -A PREROUTING -p tcp --dport 9001 -j DNAT --to-destination 10.10.10.102:9001

iptables -t nat -C POSTROUTING -j MASQUERADE 2>/dev/null || \
iptables -t nat -A POSTROUTING -j MASQUERADE

echo "=== Setup Completed Successfully! ==="
echo "✅ PostgreSQL is now accessible at 100.125.250.85:5432 (and 10.10.10.102:5432)"
echo "✅ MinIO S3 is now accessible at 100.125.250.85:9000"
echo "✅ MinIO Console UI is at http://100.125.250.85:9001 (User: minioadmin, Pass: miniopassword123)"
