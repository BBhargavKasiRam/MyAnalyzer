const User = require('../models/User');
const SolvedProblem = require('../models/SolvedProblem');
const { fetchCodeforcesProblems } = require('./codeforcesService');
const { fetchLeetCodeData } = require('./leetcodeService');
const { fetchCodeChefData } = require('./codechefService');
const { toISTDateString, getPastDaysIST, calculateStreaks } = require('../utils/dateUtils');
const { calculateProblemPoints } = require('../utils/scoringUtils');

const COOLDOWN_MS = 30 * 1000; // 30 seconds cooldown for automated calls

/**
 * Synchronizes competitive programming data for a given user from all platforms
 * @param {string|Object} userOrId - User Mongoose document or user ID
 * @param {boolean} force - Bypass 5-minute cooldown check
 * @returns {Promise<{ success: boolean, message: string, user: Object, stats: Object }>}
 */
async function syncUserData(userOrId, force = false) {
  let user = typeof userOrId === 'string' ? await User.findById(userOrId) : userOrId;
  if (!user) {
    throw new Error('User not found');
  }

  // 1. Check cooldown
  const now = new Date();
  if (!force && user.stats?.lastSyncedAt) {
    const elapsed = now.getTime() - new Date(user.stats.lastSyncedAt).getTime();
    if (elapsed < COOLDOWN_MS) {
      const waitRemainingSec = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
      return {
        success: false,
        cooldown: true,
        waitRemainingSec,
        message: `Sync cooldown active. Please wait ${waitRemainingSec} seconds or pass ?force=true`,
        user
      };
    }
  }

  console.log(`\n[Sync] Starting sync for user "${user.username}" (${user._id})...`);

  // 2. Concurrently fetch data with Promise.allSettled for fault tolerance
  const [cfResult, lcResult, ccResult] = await Promise.allSettled([
    fetchCodeforcesProblems(user.handles?.codeforces),
    fetchLeetCodeData(user.handles?.leetcode),
    fetchCodeChefData(user.handles?.codechef)
  ]);

  const allProblems = [];
  const newBaselineMap = new Map(); // date -> { count, platform }

  // Merge existing user baseline
  if (Array.isArray(user.heatmapBaseline)) {
    for (const b of user.heatmapBaseline) {
      if (b.date && b.count > 0) {
        newBaselineMap.set(b.date, { count: b.count, platform: b.platform || 'Combined' });
      }
    }
  }

  let lcOfficialTotal = 0;
  let ccOfficialTotal = 0;

  // Process Codeforces
  if (cfResult.status === 'fulfilled' && cfResult.value.success) {
    allProblems.push(...cfResult.value.problems);
  } else {
    console.warn(`[Sync] Codeforces sync failed or skipped:`, cfResult.reason || cfResult.value?.error);
  }

  // Process LeetCode
  if (lcResult.status === 'fulfilled' && lcResult.value.success) {
    allProblems.push(...lcResult.value.problems);
    lcOfficialTotal = lcResult.value.totalSolved || 0;
    // Merge LeetCode baseline
    for (const item of lcResult.value.baseline) {
      const existing = newBaselineMap.get(item.date);
      const combinedCount = Math.max(existing ? existing.count : 0, item.count);
      newBaselineMap.set(item.date, { count: combinedCount, platform: 'LeetCode' });
    }
  } else {
    console.warn(`[Sync] LeetCode sync failed or skipped:`, lcResult.reason || lcResult.value?.error);
  }

  // Process CodeChef
  if (ccResult.status === 'fulfilled' && ccResult.value.success) {
    allProblems.push(...ccResult.value.problems);
    ccOfficialTotal = ccResult.value.totalSolved || 0;
    // Merge CodeChef baseline
    for (const item of ccResult.value.baseline) {
      const existing = newBaselineMap.get(item.date);
      const combinedCount = Math.max(existing ? existing.count : 0, item.count);
      newBaselineMap.set(item.date, { count: combinedCount, platform: 'CodeChef' });
    }
  } else {
    console.warn(`[Sync] CodeChef sync failed or skipped:`, ccResult.reason || ccResult.value?.error);
  }

  // 3. Upsert solved problems using bulkWrite with upsert: true
  if (allProblems.length > 0) {
    const bulkOps = allProblems.map(prob => ({
      updateOne: {
        filter: {
          userId: user._id,
          platform: prob.platform,
          problemId: prob.problemId
        },
        update: {
          $setOnInsert: {
            userId: user._id,
            platform: prob.platform,
            problemId: prob.problemId,
            title: prob.title,
            url: prob.url,
            solvedAt: prob.solvedAt,
            dateString: prob.dateString
          },
          $set: {
            difficulty: prob.difficulty || 'Unrated',
            points: calculateProblemPoints(prob.platform, prob.difficulty || 'Unrated')
          }
        },
        upsert: true
      }
    }));

    try {
      const bulkRes = await SolvedProblem.bulkWrite(bulkOps, { ordered: false });
      console.log(`[Sync] SolvedProblem bulkWrite: ${bulkRes.upsertedCount} inserted, ${bulkRes.matchedCount} already existed.`);
    } catch (bulkErr) {
      console.error(`[Sync] Bulk write error (handled):`, bulkErr.message);
    }
  }

  // 4. Update user baseline
  user.heatmapBaseline = Array.from(newBaselineMap.entries()).map(([date, data]) => ({
    date,
    count: data.count,
    platform: data.platform
  }));

  // 5. Calculate platform counts and streak stats
  const [cfCount, lcCount, ccCount] = await Promise.all([
    SolvedProblem.countDocuments({ userId: user._id, platform: 'Codeforces' }),
    SolvedProblem.countDocuments({ userId: user._id, platform: 'LeetCode' }),
    SolvedProblem.countDocuments({ userId: user._id, platform: 'CodeChef' })
  ]);

  // Aggregate daily counts from SolvedProblem
  const dailyAgg = await SolvedProblem.aggregate([
    { $match: { userId: user._id } },
    { $group: { _id: '$dateString', count: { $sum: 1 } } }
  ]);

  const dailyCountMap = new Map();
  for (const item of dailyAgg) {
    dailyCountMap.set(item._id, item.count);
  }

  // Merge with baseline for days with baseline counts
  for (const [date, baselineData] of newBaselineMap.entries()) {
    const recordedCount = dailyCountMap.get(date) || 0;
    if (baselineData.count > recordedCount) {
      dailyCountMap.set(date, baselineData.count);
    }
  }

  // Calculate streaks
  const { currentStreak, longestStreak } = calculateStreaks(dailyCountMap);

  // Reconcile official all-time platform totals with indexed counts
  const cfFinal = cfCount;
  const lcFinal = Math.max(lcOfficialTotal, lcCount, user.stats?.leetcodeSolved || 0);
  const ccFinal = Math.max(ccOfficialTotal, ccCount, user.stats?.codechefSolved || 0);

  // Total unique problems solved
  const totalSolved = cfFinal + lcFinal + ccFinal;

  // Aggregate total points from SolvedProblem
  const pointsAgg = await SolvedProblem.aggregate([
    { $match: { userId: user._id } },
    { $group: { _id: null, totalPoints: { $sum: '$points' } } }
  ]);
  const indexedPoints = pointsAgg[0]?.totalPoints || 0;

  // Account for baseline questions (estimated 15 pts each)
  let baselineBonusPoints = 0;
  if (lcFinal > lcCount) {
    baselineBonusPoints += (lcFinal - lcCount) * 15;
  }
  if (ccFinal > ccCount) {
    baselineBonusPoints += (ccFinal - ccCount) * 15;
  }
  const totalPoints = indexedPoints + baselineBonusPoints;

  user.stats = {
    totalPoints,
    totalSolved,
    codeforcesSolved: cfFinal,
    leetcodeSolved: lcFinal,
    codechefSolved: ccFinal,
    currentStreak,
    longestStreak,
    lastSyncedAt: now
  };

  await user.save();
  console.log(`[Sync] Sync complete for "${user.username}". Total solved: ${totalSolved}, Streak: ${currentStreak} days.`);

  return {
    success: true,
    message: 'User synchronized successfully',
    user
  };
}

/**
 * Builds the 365-day unified heatmap data for a user
 * @param {string} userId
 * @returns {Promise<Array>} Unified 365-day array
 */
async function getUserHeatmapData(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Fetch all solved problems for this user
  const solvedProblems = await SolvedProblem.find({ userId })
    .sort({ solvedAt: -1 })
    .lean();

  // Group problems by dateString
  const problemsByDate = new Map();
  for (const prob of solvedProblems) {
    const d = prob.dateString;
    if (!problemsByDate.has(d)) {
      problemsByDate.set(d, []);
    }
    problemsByDate.get(d).push(prob);
  }

  // Map baseline entries
  const baselineByDate = new Map();
  if (Array.isArray(user.heatmapBaseline)) {
    for (const b of user.heatmapBaseline) {
      baselineByDate.set(b.date, b);
    }
  }

  // Generate 365 past days in IST
  const past365Days = getPastDaysIST(365);

  const heatmapArray = past365Days.map(dateStr => {
    const problems = problemsByDate.get(dateStr) || [];
    const baseline = baselineByDate.get(dateStr);

    const platformBreakdown = {
      Codeforces: 0,
      LeetCode: 0,
      CodeChef: 0
    };

    for (const p of problems) {
      if (platformBreakdown[p.platform] !== undefined) {
        platformBreakdown[p.platform]++;
      }
    }

    // Determine total count for this day
    let totalCount = problems.length;

    // If baseline has historical count higher than recorded individual problems
    if (baseline && baseline.count > totalCount) {
      const extraBaseline = baseline.count - totalCount;
      const bPlatform = baseline.platform || 'LeetCode';
      if (platformBreakdown[bPlatform] !== undefined) {
        platformBreakdown[bPlatform] += extraBaseline;
      }
      totalCount = baseline.count;
    }

    return {
      date: dateStr,
      count: totalCount,
      platformBreakdown,
      problems: problems.map(p => ({
        _id: p._id,
        platform: p.platform,
        title: p.title,
        problemId: p.problemId,
        difficulty: p.difficulty,
        points: p.points || calculateProblemPoints(p.platform, p.difficulty),
        url: p.url,
        solvedAt: p.solvedAt
      }))
    };
  });

  return heatmapArray;
}

module.exports = {
  syncUserData,
  getUserHeatmapData
};
