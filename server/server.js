const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from root or server directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const { initCron } = require('./cron/syncCron');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    // Allow in non-production, when origin matches allowedOrigins, or if origin is a vercel.app domain
    if (
      process.env.NODE_ENV !== 'production' ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      !process.env.CLIENT_URL
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB is connected before handling API requests
app.use(async (req, res, next) => {
  try {
    const conn = await connectDB();
    if (!conn && req.path.startsWith('/api/') && req.path !== '/api/health') {
      return res.status(503).json({
        error: 'Database not connected. Please verify your MONGODB_URI in .env',
        help: 'Ensure your MongoDB Atlas connection string is configured in .env'
      });
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Mount API routes
app.use('/api', apiRoutes);

// Serve static frontend in production if built
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>MyAnalyzer API Server</title></head>
        <body style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; text-align: center;">
          <h1>🚀 MyAnalyzer Competitive Programming API Server</h1>
          <p>Backend is running successfully on port ${PORT}.</p>
          <p>Access API endpoints at <a href="/api/health" style="color: #38bdf8;">/api/health</a> or <a href="/api/users" style="color: #38bdf8;">/api/users</a>.</p>
          <p>For the React frontend, run <code>npm run client</code> or build it with <code>npm run build:client</code>.</p>
        </body>
        </html>
      `);
    }
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start standalone server only when executed directly
if (require.main === module) {
  connectDB().then(() => {
    initCron();
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 MyAnalyzer Server running on http://localhost:${PORT}`);
      console.log(`📡 Healthcheck: http://localhost:${PORT}/api/health`);
      console.log(`👥 Users API:  http://localhost:${PORT}/api/users`);
      console.log(`======================================================\n`);
    });
  });
}

module.exports = app;
