const express = require('express');
const router = express.Router();
const User = require('../models/User');
const SolvedProblem = require('../models/SolvedProblem');
const { syncUserData, getUserHeatmapData } = require('../services/syncService');
const { getTodayIST } = require('../utils/dateUtils');

/**
 * GET /api/health
 * Server and database health check
 */
router.get('/health', async (req, res) => {
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    todayIST: getTodayIST(),
    database: states[dbState] || 'unknown'
  });
});

/**
 * POST /api/users
 * Register a user and trigger initial sync
 */
router.post('/users', async (req, res) => {
  try {
    const { username, handles } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const cleanUsername = username.trim();

    // Check if user already exists
    const existing = await User.findOne({ username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') } });
    if (existing) {
      return res.status(409).json({ error: `User with username "${cleanUsername}" already exists` });
    }

    const user = new User({
      username: cleanUsername,
      handles: {
        codeforces: handles?.codeforces?.trim() || '',
        leetcode: handles?.leetcode?.trim() || '',
        codechef: handles?.codechef?.trim() || ''
      }
    });

    await user.save();

    // Trigger initial sync asynchronously or synchronously
    try {
      const syncResult = await syncUserData(user, true); // force=true for initial sync
      return res.status(201).json({
        message: 'User created and synchronized successfully',
        user: syncResult.user
      });
    } catch (syncErr) {
      console.warn(`[API] Initial sync warning for user "${user.username}":`, syncErr.message);
      return res.status(201).json({
        message: 'User created, but initial sync encountered an issue',
        user,
        syncWarning: syncErr.message
      });
    }
  } catch (error) {
    console.error('[API] Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/users
 * List all registered users with summary stats
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .sort({ 'stats.totalSolved': -1, createdAt: -1 })
      .lean();

    res.json(users);
  } catch (error) {
    console.error('[API] Error listing users:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/users/:id
 * Get single user profile
 */
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/users/:id
 * Update user handles and trigger sync
 */
router.put('/users/:id', async (req, res) => {
  try {
    const { username, handles, syncAfterUpdate } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username && username.trim()) {
      user.username = username.trim();
    }

    if (handles) {
      if (handles.codeforces !== undefined) user.handles.codeforces = handles.codeforces.trim();
      if (handles.leetcode !== undefined) user.handles.leetcode = handles.leetcode.trim();
      if (handles.codechef !== undefined) user.handles.codechef = handles.codechef.trim();
    }

    await user.save();

    if (syncAfterUpdate) {
      const syncResult = await syncUserData(user, true);
      return res.json({ message: 'User updated and synced', user: syncResult.user });
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/users/:id
 * Delete user and their solved problems
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const deleteRes = await SolvedProblem.deleteMany({ userId: user._id });
    console.log(`[API] Deleted user "${user.username}" and ${deleteRes.deletedCount} solved problems`);

    res.json({
      message: `User "${user.username}" and ${deleteRes.deletedCount} problems deleted successfully`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/users/:id/sync
 * Trigger a live fetch from all 3 platforms (5-min cooldown unless ?force=true)
 */
router.post('/users/:id/sync', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    const result = await syncUserData(req.params.id, force);

    if (result.cooldown) {
      return res.status(429).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('[API] Sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/users/:id/heatmap
 * Return unified 365-day array for the user
 */
router.get('/users/:id/heatmap', async (req, res) => {
  try {
    const heatmap = await getUserHeatmapData(req.params.id);
    res.json(heatmap);
  } catch (error) {
    console.error('[API] Heatmap error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/users/:id/problems
 * Query solved problems for a user with optional platform, search, and date filters
 */
router.get('/users/:id/problems', async (req, res) => {
  try {
    const { platform, date, search, page = 1, limit = 50 } = req.query;
    const query = { userId: req.params.id };

    if (platform && platform !== 'All') {
      query.platform = platform;
    }

    if (date) {
      query.dateString = date;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { problemId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [problems, total] = await Promise.all([
      SolvedProblem.find(query)
        .sort({ solvedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      SolvedProblem.countDocuments(query)
    ]);

    res.json({
      problems,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/leaderboard
 * Rank all registered users
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'totalSolved';
    const sortField = `stats.${sortBy}`;

    const users = await User.find()
      .sort({ [sortField]: -1, createdAt: 1 })
      .select('username handles stats createdAt')
      .lean();

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
