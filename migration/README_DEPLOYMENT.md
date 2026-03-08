# DigiWebDex VPS Deployment Guide

Complete guide for deploying DigiWebDex on a self-hosted VPS (Hostinger KVM) alongside existing websites.

## Directory Structure

```
/var/www/
├── rahe-kaba-journeys-72ccca69/     # Existing website (DO NOT MODIFY)
├── other-existing-site/              # Existing website (DO NOT MODIFY)
└── digiwebdex/                       # New DigiWebDex installation
    ├── backend/
    │   ├── src/
    │   ├── uploads/
    │   ├── package.json
    │   └── Dockerfile
    ├── frontend/
    │   └── dist/                     # Built React app
    ├── database/
    │   ├── enums.sql
    │   ├── schema.sql
    │   ├── functions.sql
    │   └── triggers.sql
    ├── nginx/
    │   ├── default.conf
    │   └── ssl/
    ├── scripts/
    │   ├── setup_database.sh
    │   ├── run_migration.sh
    │   └── seed_data.sh
    ├── logs/
    │   ├── backend/
    │   └── nginx/
    ├── .env
    ├── docker-compose.yml
    └── README_DEPLOYMENT.md
```

## Prerequisites

- Ubuntu 22.04 LTS VPS (Hostinger KVM)
- Root or sudo access
- Domain DNS pointing to VPS IP
- Docker & Docker Compose installed
- At least 2GB RAM, 20GB storage

## Quick Start

### 1. Create Project Directory (Isolated)

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Create new isolated directory (NEVER modify existing directories)
PROJECT_NAME="digiwebdex"
PROJECT_DIR="/var/www/${PROJECT_NAME}"

mkdir -p ${PROJECT_DIR}
cd ${PROJECT_DIR}

# Create subdirectories
mkdir -p backend frontend database nginx/ssl scripts logs/backend logs/nginx
```

### 2. Upload Project Files

```bash
# From your LOCAL machine - upload migration folder
scp -r ./migration/* root@your-vps-ip:/var/www/digiwebdex/

# Build frontend locally first
npm run build

# Upload built frontend
scp -r ./dist root@your-vps-ip:/var/www/digiwebdex/frontend/
```

### 3. Configure Environment (Isolated)

```bash
cd /var/www/digiwebdex

# Create isolated environment file
cat > .env << 'EOF'
# Project Identification
PROJECT_NAME=digiwebdex
PROJECT_DIR=/var/www/digiwebdex

# Database (unique to this project)
DB_NAME=digiwebdex_db
DB_USER=digiwebdex_user
DB_PASSWORD=YOUR_UNIQUE_STRONG_PASSWORD
DB_PORT=5433  # Different port to avoid conflicts

# Backend (unique port)
BACKEND_PORT=3001
NODE_ENV=production

# Authentication
JWT_SECRET=YOUR_JWT_SECRET_MIN_32_CHARS
JWT_EXPIRES_IN=7d

# Email
RESEND_API_KEY=re_YOUR_RESEND_KEY
ADMIN_EMAIL=digiwebdex@gmail.com

# URLs
FRONTEND_URL=https://digiwebdex.com
API_URL=https://digiwebdex.com/api

# Logging (isolated)
LOG_DIR=/var/www/digiwebdex/logs
EOF
```

### 4. SSL Certificate (Project-Specific)

```bash
# Install certbot if not already installed
apt install certbot -y

# Get SSL certificate for this domain only
certbot certonly --standalone -d digiwebdex.com -d www.digiwebdex.com

# Copy to project's nginx/ssl folder
cp /etc/letsencrypt/live/digiwebdex.com/fullchain.pem /var/www/digiwebdex/nginx/ssl/
cp /etc/letsencrypt/live/digiwebdex.com/privkey.pem /var/www/digiwebdex/nginx/ssl/
```

### 5. Deploy with Docker (Isolated Containers)

```bash
cd /var/www/digiwebdex

# Start all services (isolated network)
docker compose up -d

# Verify containers are running
docker compose ps

# Check logs
docker compose logs -f
```

## Port Allocation Strategy

To avoid conflicts with existing websites, use unique ports:

| Service | DigiWebDex Port | Notes |
|---------|-----------------|-------|
| PostgreSQL | 5433 | Internal only (127.0.0.1) |
| Backend API | 3001 | Internal only (127.0.0.1) |
| Frontend Dev | 8080 | Internal only |

**Important:** All external traffic should go through the main Nginx proxy on ports 80/443.

## Nginx Configuration for Multi-Site VPS

If you have an existing Nginx installation managing multiple sites, add a new server block:

```bash
# Create site config for DigiWebDex
cat > /etc/nginx/sites-available/digiwebdex << 'EOF'
server {
    listen 80;
    server_name digiwebdex.com www.digiwebdex.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name digiwebdex.com www.digiwebdex.com;
    
    ssl_certificate /var/www/digiwebdex/nginx/ssl/fullchain.pem;
    ssl_certificate_key /var/www/digiwebdex/nginx/ssl/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Logs (isolated to project)
    access_log /var/www/digiwebdex/logs/nginx/access.log;
    error_log /var/www/digiwebdex/logs/nginx/error.log;
    
    # API proxy to backend container
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket proxy
    location /ws {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
    
    # Frontend static files
    location / {
        root /var/www/digiwebdex/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/digiwebdex /etc/nginx/sites-enabled/

# Test and reload Nginx
nginx -t && systemctl reload nginx
```

## Database Isolation

Each project has its own database:

```bash
# DigiWebDex uses:
# - Database: digiwebdex_db
# - User: digiwebdex_user
# - Port: 5433 (mapped from container's 5432)

# Existing projects are unaffected as they use different databases/ports
```

## Data Migration

### Export from Supabase

```bash
cd /var/www/digiwebdex

# Set Supabase credentials
export SUPABASE_PASSWORD='your-supabase-password'

# Run export script
./scripts/export_supabase_data.sh
```

### Import to VPS

```bash
# Data is automatically imported when containers start
# Or manually import:
docker compose exec -T postgres psql -U digiwebdex_user -d digiwebdex_db < database/data_export.sql
```

## Maintenance Commands

```bash
cd /var/www/digiwebdex

# View logs (project-specific)
docker compose logs -f backend
tail -f logs/nginx/access.log

# Restart services (only this project)
docker compose restart

# Stop services (only this project)
docker compose down

# Database backup (project-specific)
docker compose exec postgres pg_dump -U digiwebdex_user digiwebdex_db > backups/backup_$(date +%Y%m%d).sql

# Update application
git pull  # if using git
docker compose build
docker compose up -d
```

## SSL Auto-Renewal (Project-Specific)

```bash
# Add to crontab
crontab -e

# Add this line (project-specific renewal)
0 0 * * * certbot renew --quiet --deploy-hook "cp /etc/letsencrypt/live/digiwebdex.com/*.pem /var/www/digiwebdex/nginx/ssl/ && systemctl reload nginx"
```

## Troubleshooting

### Check Project Isolation
```bash
# Verify containers are using correct network
docker network ls | grep digiwebdex

# Check no port conflicts
netstat -tlnp | grep -E '3001|5433|8080'
```

### Database Issues
```bash
cd /var/www/digiwebdex
docker compose logs postgres
docker compose exec postgres psql -U digiwebdex_user -d digiwebdex_db -c "SELECT 1"
```

### Backend Issues
```bash
cd /var/www/digiwebdex
docker compose logs backend
docker compose exec backend env | grep DB_
```

## Security Checklist

- [ ] Unique database password for this project
- [ ] Unique JWT secret (32+ characters)
- [ ] All ports bound to 127.0.0.1 (not 0.0.0.0)
- [ ] Isolated log directories
- [ ] Separate SSL certificates
- [ ] UFW firewall rules updated
- [ ] Project-specific fail2ban jail (optional)
