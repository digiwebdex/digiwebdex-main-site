#!/bin/bash

# DigiWebDex Database Setup Script
# This script creates the PostgreSQL database and user for the application

set -e

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Default values
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-digiwebdex}"
DB_USER="${DB_USER:-digiwebdex_user}"
DB_PASSWORD="${DB_PASSWORD:-changeme}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"

echo "========================================"
echo "DigiWebDex Database Setup"
echo "========================================"
echo ""
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql command not found. Please install PostgreSQL client."
    exit 1
fi

# Create database and user
echo "Creating database and user..."
PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" <<EOF
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

echo "Database and user created successfully!"

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

echo "Extensions enabled successfully!"
echo ""
echo "========================================"
echo "Database setup complete!"
echo "========================================"
echo ""
echo "Next step: Run ./run_migration.sh to create tables"
