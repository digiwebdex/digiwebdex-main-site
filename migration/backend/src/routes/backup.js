const express = require('express');
const { pool, queryAll } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

const BACKUP_TABLES = [
  'users', 'profiles', 'user_roles', 'role_permissions',
  'services', 'service_packages', 'service_categories',
  'orders', 'order_items', 'order_meta', 'invoices', 'invoice_items',
  'payments', 'manual_payments',
  'domains', 'domain_pricing', 'domain_logs', 'domain_search_logs',
  'hosting_accounts', 'servers',
  'leads', 'lead_logs', 'contact_messages', 'consultation_bookings',
  'support_tickets', 'ticket_messages', 'ticket_logs',
  'projects', 'project_files', 'milestones',
  'subscriptions', 'subscription_billing_history', 'subscription_logs',
  'proposals', 'proposal_templates', 'proposal_logs',
  'affiliates', 'affiliate_clicks', 'affiliate_commissions', 'affiliate_withdrawals',
  'resellers', 'reseller_clients', 'reseller_earnings', 'reseller_withdrawals', 'reseller_logs',
  'coupons', 'bundle_discounts', 'cart_items',
  'notifications', 'notification_templates', 'phone_otps',
  'blog_categories', 'blog_tags', 'blog_posts', 'blog_post_tags', 'blog_related_posts',
  'case_studies', 'landing_pages', 'location_pages', 'homepage_sections',
  'seo_settings', 'sitemap_entries',
  'custom_fields', 'custom_field_values',
  'audit_logs', 'automation_logs', 'tracking_event_logs', 'renewal_logs',
  'system_settings', 'chatbot_conversations', 'revenue_summary'
];

// Convert rows to CSV
function toCSV(rows) {
  if (!rows || rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of rows) {
    const values = headers.map(h => {
      let val = row[h];
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') val = JSON.stringify(val);
      val = String(val).replace(/"/g, '""');
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val}"`;
      }
      return val;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// POST /api/backup/run - Trigger backup
router.post('/run', authenticate, requireAdmin, async (req, res) => {
  try {
    const startTime = Date.now();
    const attachments = [];
    const summary = [];

    for (const table of BACKUP_TABLES) {
      try {
        const rows = await queryAll(`SELECT * FROM ${table} ORDER BY created_at DESC NULLS LAST`);
        if (rows.length > 0) {
          const csv = toCSV(rows);
          attachments.push({
            filename: `${table}.csv`,
            content: csv,
          });
          summary.push({ table, rows: rows.length, status: 'success' });
        } else {
          summary.push({ table, rows: 0, status: 'empty' });
        }
      } catch (err) {
        summary.push({ table, rows: 0, status: 'error', error: err.message });
      }
    }

    // Send email with attachments
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.resend.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'resend',
        pass: process.env.SMTP_PASS || process.env.RESEND_API_KEY,
      },
    });

    const backupEmail = process.env.BACKUP_EMAIL || 'digiwebdex@gmail.com';
    const duration = Date.now() - startTime;

    await transporter.sendMail({
      from: 'DigiWebDex Backup <noreply@digiwebdex.com>',
      to: backupEmail,
      subject: `DigiWebDex Daily Backup - ${new Date().toISOString().split('T')[0]}`,
      html: `
        <h2>DigiWebDex Database Backup</h2>
        <p>Backup completed in ${duration}ms</p>
        <h3>Summary:</h3>
        <table border="1" cellpadding="5">
          <tr><th>Table</th><th>Rows</th><th>Status</th></tr>
          ${summary.map(s => `<tr><td>${s.table}</td><td>${s.rows}</td><td>${s.status}</td></tr>`).join('')}
        </table>
      `,
      attachments,
    });

    // Log backup
    await pool.query(
      `INSERT INTO audit_logs (action, entity_type, new_values)
       VALUES ('database_backup', 'backup', $1)`,
      [JSON.stringify({ duration, tables: summary.length, timestamp: new Date().toISOString() })]
    );

    res.json({ success: true, duration, summary });
  } catch (err) {
    console.error('Backup error:', err);
    res.status(500).json({ error: 'Backup failed' });
  }
});

// GET /api/backup/history
router.get('/history', authenticate, requireAdmin, async (req, res) => {
  try {
    const logs = await queryAll(
      `SELECT * FROM audit_logs WHERE action = 'database_backup' ORDER BY created_at DESC LIMIT 30`
    );
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch backup history' });
  }
});

// POST /api/backup/restore/:table
router.post('/restore/:table', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, mode } = req.body; // data = array of rows, mode = 'merge' | 'replace'
    const table = req.params.table;

    if (!BACKUP_TABLES.includes(table)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    if (mode === 'replace') {
      await pool.query(`DELETE FROM ${table}`);
    }

    let inserted = 0;
    const batchSize = 100;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      for (const row of batch) {
        try {
          const keys = Object.keys(row);
          const values = keys.map((_, idx) => `$${idx + 1}`);
          const conflictUpdate = keys.map(k => `${k} = EXCLUDED.${k}`).join(', ');

          await pool.query(
            `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${values.join(', ')})
             ON CONFLICT (id) DO UPDATE SET ${conflictUpdate}`,
            keys.map(k => row[k])
          );
          inserted++;
        } catch (err) {
          console.error(`Restore row error:`, err.message);
        }
      }
    }

    // Log restore
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, new_values)
       VALUES ($1, 'database_restore', $2, $3)`,
      [req.user.id, table, JSON.stringify({ rows: inserted, mode })]
    );

    res.json({ success: true, inserted });
  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ error: 'Restore failed' });
  }
});

module.exports = router;
