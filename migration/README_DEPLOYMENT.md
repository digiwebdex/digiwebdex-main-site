# DigiWebDex VPS Deployment Guide

Complete guide for deploying DigiWebDex on a self-hosted VPS (Hostinger KVM).

## Prerequisites

- Ubuntu 22.04 LTS VPS
- Root or sudo access
- Domain pointing to VPS IP
- At least 2GB RAM, 20GB storage

## Quick Start

### 1. Server Setup

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin -y

# Create project directory
mkdir -p /var/www/digiwebdex
cd /var/www/digiwebdex
```

### 2. Upload Files

```bash
# From your local machine
scp -r ./migration root@your-vps-ip:/var/www/digiwebdex/

# Build and upload frontend
npm run build
scp -r ./dist root@your-vps-ip:/var/www/digiwebdex/
```

### 3. Configure Environment

```bash
cd /var/www/digiwebdex/migration

# Create .env file
cat > .env << 'EOF'
DB_NAME=digiwebdex
DB_USER=digiwebdex_user
DB_PASSWORD=YOUR_STRONG_PASSWORD
JWT_SECRET=YOUR_JWT_SECRET_MIN_32_CHARS
RESEND_API_KEY=re_YOUR_RESEND_KEY
FRONTEND_URL=https://digiwebdex.com
ADMIN_EMAIL=digiwebdex@gmail.com
EOF
```

### 4. SSL Certificate

```bash
apt install certbot -y
certbot certonly --standalone -d digiwebdex.com -d www.digiwebdex.com

mkdir -p nginx/ssl
cp /etc/letsencrypt/live/digiwebdex.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/digiwebdex.com/privkey.pem nginx/ssl/
```

### 5. Deploy

```bash
docker compose up -d

# Verify
docker compose ps
curl http://localhost:3001/api/health
```

## Data Migration

### Export from Supabase

```bash
# Set your Supabase password
export SUPABASE_PASSWORD='your-supabase-db-password'

# Run export script
./scripts/export_supabase_data.sh
```

### Import to VPS

```bash
# Copy data files to VPS
scp -r ./data root@your-vps-ip:/var/www/digiwebdex/migration/

# Import data
docker compose exec -T postgres psql -U digiwebdex_user -d digiwebdex < data/data_export.sql
```

## Port Configuration

| Service | Internal | External |
|---------|----------|----------|
| PostgreSQL | 5432 | 5433 (localhost) |
| Backend | 3001 | 3001 (localhost) |
| Frontend | 80 | 8080 |

## Maintenance

```bash
# View logs
docker compose logs -f backend

# Restart service
docker compose restart backend

# Database backup
docker compose exec postgres pg_dump -U digiwebdex_user digiwebdex > backup_$(date +%Y%m%d).sql

# Update application
cd /var/www/digiwebdex
git pull
docker compose build
docker compose up -d
```

## SSL Auto-Renewal

```bash
crontab -e
# Add:
0 0 * * * certbot renew --quiet && docker compose -f /var/www/digiwebdex/migration/docker-compose.yml restart frontend
```

## Troubleshooting

### Database Issues
```bash
docker compose logs postgres
docker compose exec postgres psql -U digiwebdex_user -d digiwebdex -c "SELECT 1"
```

### Backend Issues
```bash
docker compose logs backend
docker compose exec backend env | grep DB_
```

### Frontend 404
```bash
ls -la /var/www/digiwebdex/dist
docker compose exec frontend nginx -t
```
