// Functions routes - replaces Supabase Edge Functions
const express = require('express');
const { pool } = require('../db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

// Email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'resend',
    pass: process.env.RESEND_API_KEY,
  },
});

// Send Email function
router.post('/send-email', authenticateToken, async (req, res) => {
  try {
    const { to, subject, html, from } = req.body;

    await emailTransporter.sendMail({
      from: from || process.env.EMAIL_FROM || 'DigiWebDex <noreply@digiwebdex.com>',
      to,
      subject,
      html,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Contact notification
router.post('/contact-notification', optionalAuth, async (req, res) => {
  try {
    const { type, name, email, phone, subject, message } = req.body;

    // Send notification email to admin
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'DigiWebDex <noreply@digiwebdex.com>',
      to: process.env.ADMIN_EMAIL || 'digiwebdex@gmail.com',
      subject: `New ${type}: ${subject || 'Contact Form'}`,
      html: `
        <h2>New ${type} Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Contact notification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Lead notification
router.post('/lead-notification', optionalAuth, async (req, res) => {
  try {
    const { name, email, phone, service, source, message } = req.body;

    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'DigiWebDex <noreply@digiwebdex.com>',
      to: process.env.ADMIN_EMAIL || 'digiwebdex@gmail.com',
      subject: `New Lead: ${name} - ${service}`,
      html: `
        <h2>New Lead Captured</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Service Interest:</strong> ${service}</p>
        <p><strong>Source:</strong> ${source}</p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Lead notification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Proposal notification
router.post('/proposal-notification', authenticateToken, async (req, res) => {
  try {
    const { proposalId, recipientEmail, recipientName, type } = req.body;

    // Get proposal details
    const { rows } = await pool.query('SELECT * FROM proposals WHERE id = $1', [proposalId]);
    const proposal = rows[0];

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const subject = type === 'new' ? `প্রপোজাল: ${proposal.proposal_number}` : `প্রপোজাল আপডেট: ${proposal.proposal_number}`;
    const viewUrl = `${process.env.FRONTEND_URL || 'https://digiwebdex.com'}/proposal/${proposalId}`;

    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'DigiWebDex <noreply@digiwebdex.com>',
      to: recipientEmail,
      subject,
      html: `
        <h2>প্রিয় ${recipientName},</h2>
        <p>আপনার জন্য একটি নতুন প্রপোজাল তৈরি করা হয়েছে।</p>
        <p><strong>প্রপোজাল নম্বর:</strong> ${proposal.proposal_number}</p>
        <p><strong>মোট মূল্য:</strong> ৳${proposal.total}</p>
        <p><a href="${viewUrl}">প্রপোজাল দেখুন</a></p>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Proposal notification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ticket notification
router.post('/ticket-notification', authenticateToken, async (req, res) => {
  try {
    const { ticketId, type, recipientEmail, recipientName } = req.body;

    const { rows } = await pool.query('SELECT * FROM support_tickets WHERE id = $1', [ticketId]);
    const ticket = rows[0];

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const subject = type === 'new' ? `New Ticket: ${ticket.ticket_number}` : `Ticket Update: ${ticket.ticket_number}`;

    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'DigiWebDex <noreply@digiwebdex.com>',
      to: recipientEmail,
      subject,
      html: `
        <h2>Support Ticket ${type === 'new' ? 'Created' : 'Updated'}</h2>
        <p><strong>Ticket:</strong> ${ticket.ticket_number}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Status:</strong> ${ticket.status}</p>
        <p><strong>Priority:</strong> ${ticket.priority}</p>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Ticket notification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Onboarding chat (AI)
router.post('/onboarding-chat', optionalAuth, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    // Use Lovable AI or fallback to basic responses
    const aiResponse = await generateAIResponse(message, conversationHistory);

    // Log conversation
    await pool.query(
      `INSERT INTO chatbot_conversations (sender_id, message_in, message_out, platform)
       VALUES ($1, $2, $3, $4)`,
      [req.user?.userId || 'anonymous', message, aiResponse, 'website']
    );

    res.json({ success: true, response: aiResponse });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

async function generateAIResponse(message, history) {
  // Basic keyword-based responses
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('দাম')) {
    return 'আমাদের ওয়েবসাইট ডেভেলপমেন্ট প্যাকেজ শুরু হয় ৳১৫,০০০ থেকে। বিস্তারিত জানতে /pricing পেজ দেখুন অথবা আমাদের সাথে যোগাযোগ করুন।';
  }

  if (lowerMessage.includes('domain') || lowerMessage.includes('ডোমেইন')) {
    return '.com ডোমেইন বার্ষিক ৳১,২০০ থেকে। .com.bd ডোমেইন বার্ষিক ৳১,৫০০। ডোমেইন সার্চ করতে /domains পেজ ভিজিট করুন।';
  }

  if (lowerMessage.includes('hosting') || lowerMessage.includes('হোস্টিং')) {
    return 'আমরা shared, VPS এবং dedicated হোস্টিং সেবা প্রদান করি। Shared হোস্টিং শুরু হয় মাসিক ৳২৫০ থেকে।';
  }

  if (lowerMessage.includes('contact') || lowerMessage.includes('যোগাযোগ')) {
    return 'আমাদের সাথে যোগাযোগ করুন: ফোন: +8801674533303, ইমেইল: digiwebdex@gmail.com';
  }

  return 'ধন্যবাদ আপনার মেসেজের জন্য। আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে। জরুরি প্রয়োজনে কল করুন: +8801674533303';
}

// WHOIS lookup
router.post('/whois-lookup', optionalAuth, async (req, res) => {
  try {
    const { domain } = req.body;
    // Mock WHOIS response - implement actual WHOIS lookup
    res.json({
      available: Math.random() > 0.3,
      domain,
      registrar: 'Unknown',
      expiryDate: null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
router.post('/health-check', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Daily CSV backup
router.post('/daily-csv-backup', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get all tables
    const { rows: tables } = await pool.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `);

    const backupData = {};
    for (const { tablename } of tables) {
      const { rows } = await pool.query(`SELECT * FROM "${tablename}"`);
      backupData[tablename] = rows;
    }

    res.json({
      success: true,
      tables: tables.length,
      timestamp: new Date().toISOString(),
      data: backupData,
    });
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sitemap XML
router.get('/sitemap-xml', async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://digiwebdex.com';

    // Static pages
    const staticPages = [
      { url: '/', priority: 1.0 },
      { url: '/about', priority: 0.8 },
      { url: '/services/web-development', priority: 0.9 },
      { url: '/services/software-development', priority: 0.9 },
      { url: '/services/digital-marketing', priority: 0.8 },
      { url: '/services/domain-hosting', priority: 0.8 },
      { url: '/pricing', priority: 0.9 },
      { url: '/domains', priority: 0.8 },
      { url: '/contact', priority: 0.7 },
      { url: '/blog', priority: 0.7 },
    ];

    // Dynamic pages
    const { rows: blogPosts } = await pool.query(`
      SELECT slug, updated_at FROM blog_posts WHERE is_published = true
    `);

    const { rows: caseStudies } = await pool.query(`
      SELECT slug, updated_at FROM case_studies WHERE is_published = true
    `);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach((page) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `  </url>\n`;
    });

    // Add blog posts
    blogPosts.forEach((post) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${post.updated_at}</lastmod>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `  </url>\n`;
    });

    // Add case studies
    caseStudies.forEach((cs) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/case-studies/${cs.slug}</loc>\n`;
      xml += `    <lastmod>${cs.updated_at}</lastmod>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `  </url>\n`;
    });

    xml += '</urlset>';

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Robots.txt
router.get('/robots-txt', (req, res) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://digiwebdex.com';
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Disallow: /api/
Sitemap: ${baseUrl}/sitemap.xml
`;
  res.set('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

module.exports = router;
