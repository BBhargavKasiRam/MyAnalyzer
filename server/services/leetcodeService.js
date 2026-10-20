const axios = require('axios');
const { toISTDateString } = require('../utils/dateUtils');

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

// In-memory cache for LeetCode question difficulties to minimize API calls
const difficultyCache = new Map();

async function getQuestionDifficulty(titleSlug) {
  if (difficultyCache.has(titleSlug)) {
    return difficultyCache.get(titleSlug);
  }
  try {
    const qQuery = `query qDiff($titleSlug: String!) { question(titleSlug: $titleSlug) { difficulty } }`;
    const res = await axios.post(
      LEETCODE_GRAPHQL_URL,
      { query: qQuery, variables: { titleSlug } },
      {
        timeout: 6000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );
    const diff = res.data?.data?.question?.difficulty || 'Medium';
    difficultyCache.set(titleSlug, diff);
    return diff;
  } catch (err) {
    return 'Medium';
  }
}

/**
 * Fetches solved problems and historical calendar baseline from LeetCode
 * @param {string} handle - LeetCode username
 * @returns {Promise<{ success: boolean, problems: Array, baseline: Array, error?: string }>}
 */
async function fetchLeetCodeData(handle) {
  if (!handle || !handle.trim()) {
    return { success: true, problems: [], baseline: [] };
  }

  const cleanHandle = handle.trim();

  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
        userCalendar {
          submissionCalendar
        }
      }
      recentAcSubmissionList(username: $username, limit: 50) {
        id
        title
        titleSlug
        timestamp
      }
    }
  `;

  try {
    const response = await axios.post(
      LEETCODE_GRAPHQL_URL,
      {
        query,
        variables: { username: cleanHandle }
      },
      {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    const data = response.data?.data;
    if (!data || !data.matchedUser) {
      return {
        success: false,
        error: `LeetCode user "${cleanHandle}" not found`,
        problems: [],
        baseline: []
      };
    }

    // 1. Process recent AC submissions with real difficulty ratings
    const recentSubmissions = data.recentAcSubmissionList || [];
    const uniqueSlugs = [...new Set(recentSubmissions.map(s => s.titleSlug).filter(Boolean))];
    const difficultyMap = new Map();

    await Promise.all(
      uniqueSlugs.map(async (slug) => {
        const diff = await getQuestionDifficulty(slug);
        difficultyMap.set(slug, diff);
      })
    );

    const uniqueProblemsMap = new Map();

    for (const sub of recentSubmissions) {
      if (!sub.titleSlug) continue;
      const problemId = `LC-${sub.titleSlug}`;

      if (!uniqueProblemsMap.has(problemId)) {
        const timestampMs = Number(sub.timestamp) * 1000;
        const solvedAt = new Date(timestampMs);
        const dateString = toISTDateString(solvedAt);
        const difficulty = difficultyMap.get(sub.titleSlug) || 'Medium';

        uniqueProblemsMap.set(problemId, {
          platform: 'LeetCode',
          problemId,
          title: sub.title || sub.titleSlug,
          url: `https://leetcode.com/problems/${sub.titleSlug}/`,
          difficulty,
          solvedAt,
          dateString
        });
      }
    }

    const problems = Array.from(uniqueProblemsMap.values());

    // 2. Process submission calendar baseline
    const calendarRaw = data.matchedUser?.userCalendar?.submissionCalendar;
    const baselineMap = new Map(); // YYYY-MM-DD -> count

    if (calendarRaw) {
      try {
        const parsedCalendar = typeof calendarRaw === 'string' ? JSON.parse(calendarRaw) : calendarRaw;
        // Key is unix timestamp in seconds
        for (const [timestampSec, count] of Object.entries(parsedCalendar)) {
          const numSec = Number(timestampSec);
          if (isNaN(numSec)) continue;

          const date = new Date(numSec * 1000);
          const dateStr = toISTDateString(date);
          const currentCount = baselineMap.get(dateStr) || 0;
          baselineMap.set(dateStr, currentCount + Number(count));
        }
      } catch (err) {
        console.warn(`[LeetCode] Error parsing submissionCalendar for "${cleanHandle}":`, err.message);
      }
    }

    const baseline = Array.from(baselineMap.entries()).map(([date, count]) => ({
      date,
      count,
      platform: 'LeetCode'
    }));

    // 3. Extract all-time official total solved count from submitStatsGlobal
    const statsGlobal = data.matchedUser?.submitStatsGlobal?.acSubmissionNum || [];
    const allItem = statsGlobal.find(item => item.difficulty === 'All');
    const totalSolved = allItem ? Number(allItem.count) : problems.length;

    console.log(`[LeetCode] Fetched ${problems.length} recent AC problems, official all-time solved: ${totalSolved}, and ${baseline.length} calendar baseline days for "${cleanHandle}"`);

    return {
      success: true,
      problems,
      baseline,
      totalSolved
    };
  } catch (error) {
    const errMsg = error.response?.data?.errors?.[0]?.message || error.message;
    console.error(`[LeetCode] Error fetching handle "${cleanHandle}":`, errMsg);
    return {
      success: false,
      error: errMsg,
      problems: [],
      baseline: []
    };
  }
}

module.exports = {
  fetchLeetCodeData
};
