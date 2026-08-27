#!/usr/bin/env bash
# ==============================================================================
# Create CT 104 (techsar-web) on Proxmox Host
# รันคำสั่งนี้บน Proxmox Host (Node: Techniccom) เพื่อสร้าง Web Server LXC
# ==============================================================================

set -e

CT_ID="104"
CT_NAME="techsar-web"
CT_IP="10.10.10.104/24"
CT_GW="10.10.10.1"
TEMPLATE="local:vztmpl/debian-12-standard_12.7-1_amd64.tar.zst"

echo "=== Creating CT $CT_ID ($CT_NAME) on Proxmox ==="

# ค้นหา Template Debian 12 ถ้าไม่มีให้ดาวน์โหลด
if ! pveam list local | grep -q "debian-12"; then
    echo "Downloading Debian 12 LXC template..."
    pveam update
    pveam download local debian-12-standard_12.7-1_amd64.tar.zst || pveam download local $(pveam available | grep debian-12 | head -n 1 | awk "{print \$2}")
fi

TEMPLATE_FILE=$(pveam list local | grep debian-12 | tail -n 1 | awk "{print \$2}")

pct create $CT_ID $TEMPLATE_FILE \
  --hostname $CT_NAME \
  --cores 2 \
  --memory 2048 \
  --swap 1024 \
  --rootfs local-lvm:16 \
  --net0 name=eth0,bridge=vmbr1,ip=$CT_IP,gw=$CT_GW \
  --features nesting=1,keyctl=1 \
  --onboot 1 \
  --start 1

echo "=== CT $CT_ID created and started! ==="
echo "IP Address: $CT_IP"
echo "To access terminal: pct enter $CT_ID"
