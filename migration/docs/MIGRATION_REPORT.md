# DigiWebDex Complete Migration Report

## Migration Summary

This document provides a complete overview of the migration from Supabase to self-hosted VPS infrastructure.

## Architecture Changes

### Before (Supabase)
- Database: Supabase PostgreSQL
- Auth: Supabase Auth
- Edge Functions: Deno-based serverless
- Storage: Supabase Storage
- Realtime: Supabase Realtime

### After (Self-Hosted)
- Database: PostgreSQL 15+
- Auth: JWT + bcrypt (Express middleware)
- API: Node.js + Express
- Storage: Local filesystem with Multer
- Realtime: WebSocket (ws library)

## File Structure

```
migration/
├── database/
│   ├── enums.sql          # Custom PostgreSQL enum types
│   ├── schema.sql         # All table definitions
│   ├── functions.sql      # Database functions
│   └── triggers.sql       # Database triggers
│
├── backend/
│   ├── src/
│   │   ├── index.js       # Express server entry point
│   │   ├── db.js          # PostgreSQL connection pool
│   │   ├── cron.js        # Scheduled jobs
│   │   ├── middleware/
│   │   │   └── auth.js    # JWT authentication middleware
│   │   └── routes/
│   │       ├── auth.js    # Authentication endpoints
│   │       ├── data.js    # Generic CRUD operations
│   │       ├── functions.js # Edge function replacements
│   │       ├── storage.js # File upload/download
│   │       └── ...        # Other route handlers
│   ├── package.json
│   ├── Dockerfile
│   └── .env.production
│
├── scripts/
│   ├── setup_database.sh      # Create DB and user
│   ├── run_migration.sh       # Run SQL migrations
│   ├── seed_data.sh           # Import data from CSV
│   ├── export_supabase_data.sh # Export from Supabase
│   └── verify_migration.sh    # Verify migration success
│
├── docker-compose.yml
└── README_DEPLOYMENT.md
```

## API Endpoints

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/auth/register | POST | User registration |
| /api/auth/login | POST | User login |
| /api/auth/logout | POST | User logout |
| /api/auth/me | GET | Get current user |
| /api/auth/forgot-password | POST | Password reset request |
| /api/auth/reset-password | POST | Set new password |

### Data Operations
| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/data/:table | GET | Select with filters |
| /api/data/:table | POST | Insert records |
| /api/data/:table | PATCH | Update records |
| /api/data/:table | PUT | Upsert records |
| /api/data/:table | DELETE | Delete records |

### Storage
| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/storage/:bucket/upload | POST | Upload file |
| /api/storage/:bucket/public/:file | GET | Get public file |
| /api/storage/:bucket/:file | GET | Get private file |
| /api/storage/:bucket | DELETE | Delete files |

### Functions (Edge Function Replacements)
| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/functions/send-email | POST | Send email |
| /api/functions/contact-notification | POST | Contact form notification |
| /api/functions/lead-notification | POST | Lead capture notification |
| /api/functions/proposal-notification | POST | Proposal notification |
| /api/functions/ticket-notification | POST | Support ticket notification |
| /api/functions/onboarding-chat | POST | AI chat response |
| /api/functions/whois-lookup | POST | Domain WHOIS lookup |
| /api/functions/daily-csv-backup | POST | Database backup |
| /api/functions/sitemap-xml | GET | Generate sitemap |
| /api/functions/robots-txt | GET | Robots.txt |

## Database Tables (70+)

### Core Tables
- users, profiles, user_roles
- orders, order_items, invoices, payments
- services, service_packages
- domains, hosting_accounts

### CRM Tables
- leads, contact_messages
- support_tickets, ticket_messages
- proposals, proposal_templates

### Content Tables
- blog_posts, blog_categories, blog_tags
- case_studies, landing_pages, location_pages

### Financial Tables
- affiliate_commissions, affiliate_withdrawals
- subscriptions, subscription_items
- coupons, bundle_discounts

## Migration Steps

### 1. Export Data from Supabase
```bash
cd migration/scripts
SUPABASE_PASSWORD='your-password' ./export_supabase_data.sh
```

### 2. Setup PostgreSQL on VPS
```bash
./setup_database.sh
```

### 3. Run Migrations
```bash
./run_migration.sh
```

### 4. Import Data
```bash
./seed_data.sh
```

### 5. Verify Migration
```bash
./verify_migration.sh
```

### 6. Deploy Backend
```bash
cd ../backend
npm install
npm start
```

### 7. Update Frontend
Update `.env` to point to new API:
```
VITE_API_URL=https://api.digiwebdex.com
VITE_WS_URL=wss://api.digiwebdex.com
```

## Security Considerations

1. **JWT Tokens**: 7-day expiration, stored in localStorage
2. **Password Hashing**: bcrypt with salt rounds = 12
3. **Rate Limiting**: 500 req/15min general, 20 req/15min auth
4. **CORS**: Configured for specific frontend URL
5. **Helmet**: Security headers enabled
6. **File Upload**: Type validation, 10MB limit

## WebSocket Events

```javascript
// Subscribe to realtime updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'orders'
}));

// Receive updates
ws.onmessage = (event) => {
  const { event, schema, table, new, old } = JSON.parse(event.data);
  // Handle INSERT, UPDATE, DELETE events
};
```

## Rollback Plan

If migration fails:
1. Keep Supabase project active during migration
2. Frontend can switch back by changing VITE_SUPABASE_URL
3. Data can be re-exported from Supabase at any time

## Post-Migration Checklist

- [ ] All tables created successfully
- [ ] All data imported with correct row counts
- [ ] User authentication working
- [ ] File uploads working
- [ ] Email notifications sending
- [ ] WebSocket realtime working
- [ ] All admin functions accessible
- [ ] SSL certificates configured
- [ ] DNS records updated
- [ ] Monitoring/logging setup
- [ ] Backup schedule configured
