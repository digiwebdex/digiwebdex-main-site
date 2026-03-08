#!/bin/bash

# DigiWebDex Database Setup Script
# Creates isolated database for this project only
# Does NOT affect other databases on the server

set -e

# Load environment variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "${PROJECT_DIR}/.env" ]; then
    export $(cat ${PROJECT_DIR}/.env | grep -v '^#' | xargs)
fi

# Default values (unique to this project)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
DB_NAME="${DB_NAME:-digiwebdex_db}"
DB_USER="${DB_USER:-digiwebdex_user}"
DB_PASSWORD="${DB_PASSWORD:-changeme}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"

echo "========================================"
echo "DigiWebDex Database Setup (Isolated)"
echo "========================================"
echo ""
echo "Project: ${PROJECT_NAME:-digiwebdex}"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Port: $DB_PORT"
echo ""
echo "This will create a NEW database without"
echo "affecting any existing databases."
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql command not found."
    echo "If using Docker, run inside container:"
    echo "  docker compose exec postgres psql -U ${DB_USER} -d ${DB_NAME}"
    exit 1
fi

# Create database and user
echo "Creating isolated database and user..."
PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" <<EOF
-- Create user if not exists (unique to this project)
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASSWORD';
        RAISE NOTICE 'User $DB_USER created';
    ELSE
        RAISE NOTICE 'User $DB_USER already exists';
    END IF;
END
\$\$;

-- Create database if not exists (unique to this project)
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

echo "✓ Database and user created"

# Connect to the new database and enable extensions
echo ""
echo "Enabling required extensions..."
PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enable citext for case-insensitive text
CREATE EXTENSION IF NOT EXISTS citext;
EOF

echo "✓ Extensions enabled"
echo ""
echo "========================================"
echo "Database setup complete!"
echo "========================================"
echo ""
echo "Database: $DB_NAME (Port: $DB_PORT)"
echo "User: $DB_USER"
echo ""
echo "Next step: Run ./run_migration.sh"
