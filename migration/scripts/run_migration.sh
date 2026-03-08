#!/bin/bash

# DigiWebDex Migration Script
# Runs all SQL migrations in the isolated project database

set -e

# Load environment variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "${PROJECT_DIR}/.env" ]; then
    export $(cat ${PROJECT_DIR}/.env | grep -v '^#' | xargs)
fi

# Default values
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
DB_NAME="${DB_NAME:-digiwebdex_db}"
DB_USER="${DB_USER:-digiwebdex_user}"
DB_PASSWORD="${DB_PASSWORD:-changeme}"

DATABASE_DIR="${PROJECT_DIR}/database"

echo "========================================"
echo "DigiWebDex Database Migration"
echo "========================================"
echo ""
echo "Project: ${PROJECT_DIR}"
echo "Database: $DB_NAME (Port: $DB_PORT)"
echo ""

# Function to run SQL file
run_sql_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo "Running: $description..."
        PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file" 2>&1 | grep -v "^NOTICE:" || true
        echo "✓ $description completed"
    else
        echo "⚠ File not found: $file"
    fi
}

# Run migrations in order
echo "Step 1/6: Creating enums..."
run_sql_file "$DATABASE_DIR/enums.sql" "Enum types"

echo ""
echo "Step 2/6: Creating schema (tables)..."
run_sql_file "$DATABASE_DIR/schema.sql" "Database schema"

echo ""
echo "Step 3/6: Creating functions..."
run_sql_file "$DATABASE_DIR/functions.sql" "Database functions"

echo ""
echo "Step 4/6: Creating triggers..."
run_sql_file "$DATABASE_DIR/triggers.sql" "Database triggers"

echo ""
echo "Step 5/6: Creating indexes..."
run_sql_file "$DATABASE_DIR/indexes.sql" "Database indexes"

echo ""
echo "Step 6/6: Creating constraints..."
run_sql_file "$DATABASE_DIR/constraints.sql" "Database constraints"

echo ""
echo "========================================"
echo "Migration complete!"
echo "========================================"
echo ""
echo "Run ./seed_data.sh to import data"
