#!/bin/bash

# DigiWebDex Migration Verification Script
# This script verifies that the migration was successful

set -e

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-digiwebdex}"
DB_USER="${DB_USER:-digiwebdex_user}"
DB_PASSWORD="${DB_PASSWORD:-changeme}"

echo "========================================"
echo "DigiWebDex Migration Verification"
echo "========================================"
echo ""

# Check connection
echo "Testing database connection..."
if PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
    echo "✓ Database connection successful"
else
    echo "✗ Database connection failed"
    exit 1
fi

echo ""
echo "Checking tables..."
echo ""

# Count tables
TABLE_COUNT=$(PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'")
echo "Tables found: $TABLE_COUNT"

# List all tables with row counts
echo ""
echo "Table row counts:"
echo "-----------------"
PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF
SELECT 
    t.table_name,
    (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') as columns,
    pg_stat_get_tuples_inserted(c.oid) as rows
FROM information_schema.tables t
JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;
EOF

# Check functions
echo ""
echo "Checking functions..."
FUNC_COUNT=$(PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public'")
echo "Functions found: $FUNC_COUNT"

# Check triggers
echo ""
echo "Checking triggers..."
TRIGGER_COUNT=$(PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public'")
echo "Triggers found: $TRIGGER_COUNT"

# Check indexes
echo ""
echo "Checking indexes..."
INDEX_COUNT=$(PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public'")
echo "Indexes found: $INDEX_COUNT"

# Check foreign keys
echo ""
echo "Checking foreign keys..."
FK_COUNT=$(PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY' AND constraint_schema = 'public'")
echo "Foreign keys found: $FK_COUNT"

# Verify critical tables exist
echo ""
echo "Verifying critical tables..."
CRITICAL_TABLES=("users" "profiles" "user_roles" "orders" "invoices" "services" "domains" "hosting_accounts")
all_present=true

for table in "${CRITICAL_TABLES[@]}"; do
    exists=$(PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table')")
    exists=$(echo $exists | xargs)
    if [ "$exists" = "t" ]; then
        echo "  ✓ $table"
    else
        echo "  ✗ $table (MISSING)"
        all_present=false
    fi
done

echo ""
echo "========================================"
if [ "$all_present" = true ]; then
    echo "Migration verification: PASSED ✓"
else
    echo "Migration verification: FAILED ✗"
    echo "Some critical tables are missing!"
fi
echo "========================================"
