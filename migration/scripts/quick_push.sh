#!/bin/bash
# ============================================================
# Quick VPS Push — build locally + upload frontend only
# Run from your LOCAL machine inside the project root
# ============================================================

set -e

VPS_IP="187.77.144.38"
VPS_USER="root"
PROJECT_DIR="/var/www/digiwebdex"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  DigiWebDex Quick VPS Push${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# --- 1. Ensure production env exists ---
if [ ! -f ".env.production" ]; then
  cat > .env.production << 'EOF'
VITE_API_URL=https://digiwebdex.com/api
VITE_WS_URL=wss://digiwebdex.com
VITE_SITE_URL=https://digiwebdex.com
EOF
  echo -e "${YELLOW}⚠ Created .env.production${NC}"
fi

# --- 2. Build ---
echo "[1/3] Building frontend..."
npm install --legacy-peer-deps 2>/dev/null || true
npx vite build

if [ ! -d "dist" ]; then
  echo "❌ Build failed — dist/ not found"
  exit 1
fi
echo -e "${GREEN}✅ Build complete${NC}"

# --- 3. Upload frontend ---
echo ""
echo "[2/3] Uploading to VPS..."
ssh ${VPS_USER}@${VPS_IP} "mkdir -p ${PROJECT_DIR}/frontend/dist"
scp -r dist/* ${VPS_USER}@${VPS_IP}:${PROJECT_DIR}/frontend/dist/
echo -e "${GREEN}✅ Frontend uploaded${NC}"

# --- 4. Reload nginx (clear cache) ---
echo ""
echo "[3/3] Reloading nginx..."
ssh ${VPS_USER}@${VPS_IP} "sudo nginx -t && sudo systemctl reload nginx"
echo -e "${GREEN}✅ Nginx reloaded${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  🚀 Push complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Verify:  https://digiwebdex.com"
echo ""
