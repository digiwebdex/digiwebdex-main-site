#!/bin/bash

# DigiWebDex Migration Script
# This script runs all SQL migrations to create tables, functions, and triggers

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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATABASE_DIR="$SCRIPT_DIR/../database"

echo "========================================"
echo "DigiWebDex Database Migration"
echo "========================================"
echo ""
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Host: $DB_HOST"
echo ""

# Function to run SQL file
run_sql_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo "Running: $description..."
        PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file"
        echo "✓ $description completed"
    else
        echo "⚠ File not found: $file"
    fi
}

# Run migrations in order
echo ""
echo "Step 1/4: Creating enums..."
run_sql_file "$DATABASE_DIR/enums.sql" "Enum types"

echo ""
echo "Step 2/4: Creating schema (tables)..."
run_sql_file "$DATABASE_DIR/schema.sql" "Database schema"

echo ""
echo "Step 3/4: Creating functions..."
run_sql_file "$DATABASE_DIR/functions.sql" "Database functions"

echo ""
echo "Step 4/4: Creating triggers..."
run_sql_file "$DATABASE_DIR/triggers.sql" "Database triggers"

echo ""
echo "========================================"
echo "Migration complete!"
echo "========================================"
echo ""
echo "Tables created. Run ./seed_data.sh to import data."
