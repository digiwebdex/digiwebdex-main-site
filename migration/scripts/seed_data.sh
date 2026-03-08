#!/bin/bash

# DigiWebDex Data Seeding Script
# This script imports data from CSV or SQL files

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
DATA_DIR="$SCRIPT_DIR/../data"

echo "========================================"
echo "DigiWebDex Data Seeding"
echo "========================================"
echo ""

# Check if data directory exists
if [ ! -d "$DATA_DIR" ]; then
    echo "Creating data directory..."
    mkdir -p "$DATA_DIR"
    echo "Data directory created at: $DATA_DIR"
    echo ""
    echo "To import data:"
    echo "1. Export data from Supabase dashboard as CSV"
    echo "2. Place CSV files in: $DATA_DIR"
    echo "3. Run this script again"
    echo ""
    exit 0
fi

# Import CSV files if they exist
import_csv() {
    local table=$1
    local csv_file="$DATA_DIR/${table}.csv"
    
    if [ -f "$csv_file" ]; then
        echo "Importing $table..."
        PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
            -c "\COPY $table FROM '$csv_file' WITH (FORMAT csv, HEADER true, NULL 'NULL')"
        echo "✓ $table imported"
    fi
}

# Import data.sql if exists
if [ -f "$DATA_DIR/data.sql" ]; then
    echo "Importing data from data.sql..."
    PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$DATA_DIR/data.sql"
    echo "✓ Data imported from SQL file"
    echo ""
fi

# Import CSV files for each table
echo "Checking for CSV data files..."
echo ""

# Core tables - import in dependency order
TABLES=(
    "users"
    "profiles"
    "user_roles"
    "services"
    "service_packages"
    "domain_pricing"
    "hosting_packages"
    "hosting_servers"
    "orders"
    "order_items"
    "invoices"
    "payments"
    "manual_payments"
    "domains"
    "hosting_accounts"
    "leads"
    "contact_messages"
    "support_tickets"
    "ticket_messages"
    "notifications"
    "proposals"
    "proposal_templates"
    "project_milestones"
    "affiliates"
    "affiliate_clicks"
    "affiliate_commissions"
    "affiliate_withdrawals"
    "blog_categories"
    "blog_tags"
    "blog_posts"
    "blog_post_tags"
    "case_studies"
    "coupons"
    "landing_pages"
    "location_pages"
    "subscriptions"
    "subscription_items"
    "homepage_sections"
    "system_settings"
    "audit_logs"
)

imported=0
for table in "${TABLES[@]}"; do
    if [ -f "$DATA_DIR/${table}.csv" ]; then
        import_csv "$table"
        ((imported++))
    fi
done

echo ""
if [ $imported -eq 0 ]; then
    echo "No CSV files found in $DATA_DIR"
    echo ""
    echo "To export data from Supabase:"
    echo "1. Go to Supabase Dashboard > Table Editor"
    echo "2. Select each table and click 'Export to CSV'"
    echo "3. Save files as: tablename.csv"
    echo "4. Place in: $DATA_DIR"
    echo "5. Run this script again"
else
    echo "========================================"
    echo "Data seeding complete!"
    echo "Imported $imported tables"
    echo "========================================"
fi

# Verify row counts
echo ""
echo "Verifying data..."
echo ""
PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF
SELECT 
    schemaname,
    relname as table_name,
    n_tup_ins as rows
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY relname;
EOF
