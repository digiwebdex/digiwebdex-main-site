require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { WebSocketServer } = require('ws');
const http = require('http');

// Import routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');
const invoicesRoutes = require('./routes/invoices');
const servicesRoutes = require('./routes/services');
const domainsRoutes = require('./routes/domains');
const leadsRoutes = require('./routes/leads');
const contactRoutes = require('./routes/contact');
const ticketsRoutes = require('./routes/tickets');
const notificationsRoutes = require('./routes/notifications');
const proposalsRoutes = require('./routes/proposals');
const affiliatesRoutes = require('./routes/affiliates');
const blogRoutes = require('./routes/blog');
const adminRoutes = require('./routes/admin');
const backupRoutes = require('./routes/backup');
const healthRoutes = require('./routes/health');
const sitemapRoutes = require('./routes/sitemap');
const storageRoutes = require('./routes/storage');
const dataRoutes = require('./routes/data');
const functionsRoutes = require('./routes/functions');
const cronJobs = require('./cron');

const app = express();
const server = http.createServer(app);

// WebSocket server for realtime
const wss = new WebSocketServer({ server, path: '/ws' });
const wsClients = new Map();

wss.on('connection', (ws, req) => {
  const id = require('crypto').randomUUID();
  wsClients.set(id, { ws, subscriptions: [] });
  
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'subscribe') {
        const client = wsClients.get(id);
        if (client && !client.subscriptions.includes(msg.channel)) {
          client.subscriptions.push(msg.channel);
        }
      }
    } catch (e) {
      console.error('WebSocket message error:', e);
    }
  });
  
  ws.on('close', () => wsClients.delete(id));
  ws.on('error', () => wsClients.delete(id));
});

// Broadcast to all WebSocket clients
function broadcast(event, data) {
  const message = JSON.stringify({ event, ...data, timestamp: new Date().toISOString() });
  wsClients.forEach((client) => {
    if (client.ws.readyState === 1) {
      client.ws.send(message);
    }
  });
}

// Make broadcast available to routes
app.set('broadcast', broadcast);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later' },
});

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/domains', domainsRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/proposals', proposalsRoutes);
app.use('/api/affiliates', affiliatesRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/sitemap', sitemapRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/functions', functionsRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start cron jobs
cronJobs.start();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`DigiWebDex API server running on port ${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}/ws`);
});

module.exports = { app, server, broadcast };
