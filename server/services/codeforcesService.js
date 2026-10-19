const axios = require('axios');
const { toISTDateString } = require('../utils/dateUtils');

/**
 * Fetches solved problems for a Codeforces handle
 * @param {string} handle - Codeforces username
 * @returns {Promise<{ success: boolean, problems: Array, error?: string }>}
 */
async function fetchCodeforcesProblems(handle) {
  if (!handle || !handle.trim()) {
    return { success: true, problems: [] };
  }

  const cleanHandle = handle.trim();
  const url = `https://codeforces.com/api/user.status?handle=${encodeURIComponent(cleanHandle)}`;

  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CP-Activity-Tracker/1.0'
      }
    });

    if (response.data.status !== 'OK') {
      return {
        success: false,
        error: response.data.comment || 'Codeforces API returned non-OK status',
        problems: []
      };
    }

    const submissions = response.data.result || [];

    // Filter only accepted submissions
    const okSubmissions = submissions.filter(sub => sub.verdict === 'OK' && sub.problem && sub.problem.contestId);

    // Sort ascending by creation time to find earliest accepted submission per problem
    okSubmissions.sort((a, b) => a.creationTimeSeconds - b.creationTimeSeconds);

    // Deduplicate by problemId
    const uniqueProblemsMap = new Map();

    for (const sub of okSubmissions) {
      const contestId = sub.problem.contestId;
      const index = sub.problem.index;
      const problemId = `CF-${contestId}${index}`;

      if (!uniqueProblemsMap.has(problemId)) {
        const solvedAt = new Date(sub.creationTimeSeconds * 1000);
        const dateString = toISTDateString(solvedAt);
        const difficulty = sub.problem.rating ? String(sub.problem.rating) : 'Unrated';

        uniqueProblemsMap.set(problemId, {
          platform: 'Codeforces',
          problemId,
          title: sub.problem.name || `${contestId}${index}`,
          url: `https://codeforces.com/problemset/problem/${contestId}/${index}`,
          difficulty,
          solvedAt,
          dateString
        });
      }
    }

    const problems = Array.from(uniqueProblemsMap.values());
    console.log(`[Codeforces] Fetched ${problems.length} unique solved problems for handle "${cleanHandle}"`);

    return {
      success: true,
      problems
    };
  } catch (error) {
    const errMsg = error.response?.data?.comment || error.message;
    console.error(`[Codeforces] Error fetching handle "${cleanHandle}":`, errMsg);
    return {
      success: false,
      error: errMsg,
      problems: []
    };
  }
}

module.exports = {
  fetchCodeforcesProblems
};
