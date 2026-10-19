const app = require('../server/server');
const connectDB = require('../server/config/db');

// Handler for Vercel Serverless Function
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
