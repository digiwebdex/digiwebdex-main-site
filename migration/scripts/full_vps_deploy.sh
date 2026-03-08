#!/bin/bash
# ============================================================
# DigiWebDex COMPLETE VPS Deployment Script
# Run on LOCAL machine - handles everything automatically
# ============================================================

set -e

VPS_IP="187.77.144.38"
VPS_USER="root"
PROJECT_DIR="/var/www/digiwebdex"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

echo "=========================================="
echo "DigiWebDex COMPLETE VPS Migration"
echo "=========================================="
echo ""

# ---- Step 1: Build frontend ----
echo "[1/6] Building frontend..."
cd "$ROOT_DIR"

# Create production env
cat > .env.production << 'EOF'
VITE_API_URL=https://digiwebdex.com/api
VITE_WS_URL=wss://digiwebdex.com
VITE_SITE_URL=https://digiwebdex.com
EOF

npm install --legacy-peer-deps 2>/dev/null || true
npx vite build

if [ ! -d "dist" ]; then
    echo "ERROR: Build failed"
    exit 1
fi
echo "✅ Frontend built"

# ---- Step 2: Prepare VPS directories ----
echo ""
echo "[2/6] Preparing VPS..."
ssh ${VPS_USER}@${VPS_IP} << 'REMOTE'
mkdir -p /var/www/digiwebdex/{frontend/dist,backend,database,logs/nginx}
REMOTE
echo "✅ VPS directories ready"

# ---- Step 3: Upload frontend ----
echo ""
echo "[3/6] Uploading frontend..."
scp -r dist/* ${VPS_USER}@${VPS_IP}:${PROJECT_DIR}/frontend/dist/
echo "✅ Frontend uploaded"

# ---- Step 4: Upload backend + database ----
echo ""
echo "[4/6] Uploading backend & database..."
scp -r "$ROOT_DIR/migration/backend/"* ${VPS_USER}@${VPS_IP}:${PROJECT_DIR}/backend/
scp -r "$ROOT_DIR/migration/database/"* ${VPS_USER}@${VPS_IP}:${PROJECT_DIR}/database/
scp "$ROOT_DIR/migration/docker-compose.yml" ${VPS_USER}@${VPS_IP}:${PROJECT_DIR}/
echo "✅ Backend & database uploaded"

# ---- Step 5: Setup database + import data ----
echo ""
echo "[5/6] Setting up database & importing data..."
ssh ${VPS_USER}@${VPS_IP} << 'REMOTE_SETUP'
cd /var/www/digiwebdex

# Install backend dependencies
cd backend && npm install --production && cd ..

# Start docker services if not running
docker compose up -d postgres 2>/dev/null || true
sleep 5

# Run database migrations
echo "Running migrations..."
docker compose exec -T postgres psql -U digiwebdex_user -d digiwebdex_db -f /docker-entrypoint-initdb.d/enums.sql 2>/dev/null || true
docker compose exec -T postgres psql -U digiwebdex_user -d digiwebdex_db -f /docker-entrypoint-initdb.d/schema.sql 2>/dev/null || true
docker compose exec -T postgres psql -U digiwebdex_user -d digiwebdex_db -f /docker-entrypoint-initdb.d/functions.sql 2>/dev/null || true
docker compose exec -T postgres psql -U digiwebdex_user -d digiwebdex_db -f /docker-entrypoint-initdb.d/triggers.sql 2>/dev/null || true
docker compose exec -T postgres psql -U digiwebdex_user -d digiwebdex_db -f /docker-entrypoint-initdb.d/indexes.sql 2>/dev/null || true
docker compose exec -T postgres psql -U digiwebdex_user -d digiwebdex_db -f /docker-entrypoint-initdb.d/constraints.sql 2>/dev/null || true

# Import seed data
echo "Importing data..."
cat database/complete_data_export.sql | docker compose exec -T postgres psql -U digiwebdex_user -d digiwebdex_db

# Restart all services
docker compose up -d
sleep 3

echo "✅ Database setup complete"
REMOTE_SETUP

# ---- Step 6: Nginx + restart ----
echo ""
echo "[6/6] Configuring nginx & restarting..."
ssh ${VPS_USER}@${VPS_IP} << 'NGINX_SETUP'
# Create/update nginx config for digiwebdex
cat > /etc/nginx/sites-available/digiwebdex << 'NGINX'
server {
    listen 80;
    server_name digiwebdex.com www.digiwebdex.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name digiwebdex.com www.digiwebdex.com;

    ssl_certificate /etc/letsencrypt/live/digiwebdex.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/digiwebdex.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend (SPA)
    root /var/www/digiwebdex/frontend/dist;
    index index.html;

    # API proxy to backend
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
        client_max_body_size 50M;
    }

    # WebSocket proxy
    location /ws {
        proxy_pass http://127.0.0.1:3001/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # File uploads
    location /uploads/ {
        alias /var/www/digiwebdex/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Error & access logs
    access_log /var/www/digiwebdex/logs/nginx/access.log;
    error_log /var/www/digiwebdex/logs/nginx/error.log;
}
NGINX

# Enable site
ln -sf /etc/nginx/sites-available/digiwebdex /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "✅ Nginx configured"
NGINX_SETUP

echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "Site: https://digiwebdex.com"
echo ""
echo "Verify:"
echo "  1. curl https://digiwebdex.com"
echo "  2. curl https://digiwebdex.com/api/health"
echo "  3. Login at https://digiwebdex.com/bn/auth/login"
echo ""
echo "⚠️  IMPORTANT: Create admin user on VPS:"
echo "  ssh ${VPS_USER}@${VPS_IP}"
echo "  cd ${PROJECT_DIR}"
echo "  node -e \"const bcrypt=require('bcryptjs'); bcrypt.hash('YOUR_PASSWORD',12).then(h=>console.log(h))\""
echo "  Then insert into users table with the hashed password"
echo ""
