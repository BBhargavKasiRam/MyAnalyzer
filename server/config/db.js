const mongoose = require('mongoose');
const dns = require('dns');

// On Windows, Node's c-ares DNS resolver can fail with querySrv ECONNREFUSED on local ISP/router DNS.
// Setting public DNS fallbacks (Google/Cloudflare) resolves MongoDB Atlas SRV records reliably.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (dnsErr) {
  // Graceful fallback if restricted in certain sandboxed environments
}

let cachedConnection = null;

async function connectDB() {
  if (cachedConnection && mongoose.connection.readyState >= 1) {
    return cachedConnection;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('\n⚠️ [Database] MONGODB_URI is not set in environment variables.');
    console.warn('⚠️ Please add your MongoDB Atlas connection string in the .env file.\n');
    return null;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: true
    });

    cachedConnection = conn;
    console.log(`✅ [Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ [Database] Connection Error: ${error.message}`);
    // Do not terminate process in serverless / dev so informative error responses can be returned
    return null;
  }
}

module.exports = connectDB;
