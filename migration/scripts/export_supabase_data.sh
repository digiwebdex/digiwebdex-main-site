#!/bin/bash

# DigiWebDex Supabase Data Export Script
# This script exports all data from Supabase using pg_dump

set -e

# Supabase connection details (get from Supabase Dashboard > Settings > Database)
SUPABASE_HOST="${SUPABASE_HOST:-db.qszmmysnwjvywpsofbgs.supabase.co}"
SUPABASE_PORT="${SUPABASE_PORT:-5432}"
SUPABASE_DB="${SUPABASE_DB:-postgres}"
SUPABASE_USER="${SUPABASE_USER:-postgres}"
# SUPABASE_PASSWORD should be set in environment or .env file

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$SCRIPT_DIR/../backup/$(date +%Y%m%d_%H%M%S)"

echo "========================================"
echo "DigiWebDex Supabase Data Export"
echo "========================================"
echo ""

if [ -z "$SUPABASE_PASSWORD" ]; then
    echo "Error: SUPABASE_PASSWORD environment variable not set"
    echo ""
    echo "Get your database password from:"
    echo "Supabase Dashboard > Settings > Database > Connection string"
    echo ""
    echo "Then run: SUPABASE_PASSWORD='your-password' ./export_supabase_data.sh"
    exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"
echo "Backup directory: $BACKUP_DIR"
echo ""

# Export schema only
echo "Exporting schema..."
PGPASSWORD="${SUPABASE_PASSWORD}" pg_dump \
    -h "$SUPABASE_HOST" \
    -p "$SUPABASE_PORT" \
    -U "$SUPABASE_USER" \
    -d "$SUPABASE_DB" \
    --schema=public \
    --schema-only \
    --no-owner \
    --no-privileges \
    -f "$BACKUP_DIR/schema_export.sql"
echo "✓ Schema exported"

# Export data only
echo "Exporting data..."
PGPASSWORD="${SUPABASE_PASSWORD}" pg_dump \
    -h "$SUPABASE_HOST" \
    -p "$SUPABASE_PORT" \
    -U "$SUPABASE_USER" \
    -d "$SUPABASE_DB" \
    --schema=public \
    --data-only \
    --no-owner \
    --no-privileges \
    --inserts \
    -f "$BACKUP_DIR/data_export.sql"
echo "✓ Data exported"

# Export full backup
echo "Creating full backup..."
PGPASSWORD="${SUPABASE_PASSWORD}" pg_dump \
    -h "$SUPABASE_HOST" \
    -p "$SUPABASE_PORT" \
    -U "$SUPABASE_USER" \
    -d "$SUPABASE_DB" \
    --schema=public \
    --no-owner \
    --no-privileges \
    -f "$BACKUP_DIR/full_backup.sql"
echo "✓ Full backup created"

# Export to CSV for each table
echo ""
echo "Exporting tables to CSV..."
DATA_DIR="$SCRIPT_DIR/../data"
mkdir -p "$DATA_DIR"

TABLES=$(PGPASSWORD="${SUPABASE_PASSWORD}" psql \
    -h "$SUPABASE_HOST" \
    -p "$SUPABASE_PORT" \
    -U "$SUPABASE_USER" \
    -d "$SUPABASE_DB" \
    -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public'")

for table in $TABLES; do
    table=$(echo $table | xargs) # trim whitespace
    if [ -n "$table" ]; then
        echo "  Exporting $table..."
        PGPASSWORD="${SUPABASE_PASSWORD}" psql \
            -h "$SUPABASE_HOST" \
            -p "$SUPABASE_PORT" \
            -U "$SUPABASE_USER" \
            -d "$SUPABASE_DB" \
            -c "\COPY (SELECT * FROM public.$table) TO '$DATA_DIR/${table}.csv' WITH (FORMAT csv, HEADER true)"
    fi
done

echo ""
echo "========================================"
echo "Export Complete!"
echo "========================================"
echo ""
echo "Files created:"
echo "  Schema: $BACKUP_DIR/schema_export.sql"
echo "  Data:   $BACKUP_DIR/data_export.sql"
echo "  Full:   $BACKUP_DIR/full_backup.sql"
echo "  CSV:    $DATA_DIR/*.csv"
echo ""
echo "Copy data_export.sql to migration/data/data.sql"
echo "Then run ./seed_data.sh to import"
