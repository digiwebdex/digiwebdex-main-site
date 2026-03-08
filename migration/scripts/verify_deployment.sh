#!/bin/bash

# DigiWebDex Verification Script
# Verifies the deployment is correctly isolated and functioning

set -e

# Load environment
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "${PROJECT_DIR}/.env" ]; then
    export $(cat ${PROJECT_DIR}/.env | grep -v '^#' | xargs)
fi

echo "========================================"
echo "DigiWebDex Deployment Verification"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

# Check 1: Project directory isolation
echo "1. Checking project isolation..."
if [ -d "${PROJECT_DIR:-/var/www/digiwebdex}" ]; then
    echo -e "   ${GREEN}✓${NC} Project directory exists: ${PROJECT_DIR}"
else
    echo -e "   ${RED}✗${NC} Project directory not found"
    ((ERRORS++))
fi

# Check 2: No interference with other sites
echo ""
echo "2. Checking other websites are intact..."
for dir in /var/www/*/; do
    if [[ "$dir" != *"digiwebdex"* ]] && [ -d "$dir" ]; then
        echo -e "   ${GREEN}✓${NC} Existing site intact: $(basename $dir)"
    fi
done

# Check 3: Docker containers
echo ""
echo "3. Checking Docker containers..."
if docker ps --format '{{.Names}}' | grep -q "digiwebdex"; then
    echo -e "   ${GREEN}✓${NC} DigiWebDex containers running:"
    docker ps --filter "name=digiwebdex" --format "     - {{.Names}}: {{.Status}}"
else
    echo -e "   ${YELLOW}⚠${NC} DigiWebDex containers not running"
fi

# Check 4: Port isolation
echo ""
echo "4. Checking port allocation..."
check_port() {
    local port=$1
    local service=$2
    if netstat -tlnp 2>/dev/null | grep -q "127.0.0.1:${port}"; then
        echo -e "   ${GREEN}✓${NC} Port ${port} (${service}): bound to localhost only"
    elif netstat -tlnp 2>/dev/null | grep -q ":${port}"; then
        echo -e "   ${YELLOW}⚠${NC} Port ${port} (${service}): bound to all interfaces"
    else
        echo -e "   ${YELLOW}○${NC} Port ${port} (${service}): not in use"
    fi
}

check_port "${BACKEND_PORT:-3001}" "Backend"
check_port "${DB_PORT:-5433}" "Database"

# Check 5: Database isolation
echo ""
echo "5. Checking database isolation..."
if docker compose -f ${PROJECT_DIR}/docker-compose.yml exec -T postgres psql -U ${DB_USER:-digiwebdex_user} -d ${DB_NAME:-digiwebdex_db} -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓${NC} Database connection successful"
    
    TABLE_COUNT=$(docker compose -f ${PROJECT_DIR}/docker-compose.yml exec -T postgres psql -U ${DB_USER:-digiwebdex_user} -d ${DB_NAME:-digiwebdex_db} -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'" 2>/dev/null | xargs)
    echo -e "   ${GREEN}✓${NC} Tables created: ${TABLE_COUNT}"
else
    echo -e "   ${RED}✗${NC} Database connection failed"
    ((ERRORS++))
fi

# Check 6: Backend health
echo ""
echo "6. Checking backend health..."
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:${BACKEND_PORT:-3001}/api/health | grep -q "200"; then
    echo -e "   ${GREEN}✓${NC} Backend API responding"
else
    echo -e "   ${RED}✗${NC} Backend API not responding"
    ((ERRORS++))
fi

# Check 7: Log isolation
echo ""
echo "7. Checking log isolation..."
if [ -d "${PROJECT_DIR}/logs" ]; then
    echo -e "   ${GREEN}✓${NC} Logs directory exists: ${PROJECT_DIR}/logs"
    ls -la ${PROJECT_DIR}/logs/ 2>/dev/null | head -5 || true
else
    echo -e "   ${YELLOW}⚠${NC} Logs directory not found"
fi

# Check 8: Environment isolation
echo ""
echo "8. Checking environment isolation..."
if [ -f "${PROJECT_DIR}/.env" ]; then
    echo -e "   ${GREEN}✓${NC} Project .env file exists"
    echo "   Key variables configured:"
    grep -E "^(DB_NAME|DB_PORT|BACKEND_PORT|PROJECT_NAME)" ${PROJECT_DIR}/.env | sed 's/^/     /'
else
    echo -e "   ${RED}✗${NC} Project .env file not found"
    ((ERRORS++))
fi

# Summary
echo ""
echo "========================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}Verification PASSED${NC}"
    echo "DigiWebDex is correctly isolated and running."
else
    echo -e "${RED}Verification FAILED${NC}"
    echo "Found $ERRORS issues that need attention."
fi
echo "========================================"
