const axios = require('axios');
const cheerio = require('cheerio');
const { toISTDateString } = require('../utils/dateUtils');

/**
 * Parses CodeChef formatted timestamp e.g. "11:30 PM 21/11/09"
 * CodeChef displays timestamps in IST (Asia/Kolkata +05:30)
 */
function parseCodeChefTime(timeStr) {
  if (!timeStr) return null;
  const m = timeStr.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})/i);
  if (m) {
    let [_, hourStr, minStr, ampm, dayStr, monStr, yrStr] = m;
    let hour = parseInt(hourStr, 10);
    const min = parseInt(minStr, 10);
    const day = parseInt(dayStr, 10);
    const month = parseInt(monStr, 10) - 1;
    let year = parseInt(yrStr, 10);
    if (year < 100) year += 2000;
    if (ampm.toUpperCase() === 'PM' && hour < 12) hour += 12;
    if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;

    const pad = n => String(n).padStart(2, '0');
    const isoStr = `${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(min)}:00+05:30`;
    const date = new Date(isoStr);
    return isNaN(date.getTime()) ? null : date;
  }

  const d = new Date(timeStr);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Fetches solved problems and historical calendar baseline from CodeChef
 * @param {string} handle - CodeChef username
 * @returns {Promise<{ success: boolean, problems: Array, baseline: Array, error?: string }>}
 */
async function fetchCodeChefData(handle) {
  if (!handle || !handle.trim()) {
    return { success: true, problems: [], baseline: [] };
  }

  const cleanHandle = handle.trim();
  const problemsMap = new Map();
  const baselineList = [];

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
  };

  try {
    // 1. Fetch user public profile page for baseline and profile problems
    const profileUrl = `https://www.codechef.com/users/${encodeURIComponent(cleanHandle)}`;
    const profileRes = await axios.get(profileUrl, { headers, timeout: 15000 });
    const profileHtml = profileRes.data || '';

    // Extract userDailySubmissionsStats from script tag
    const heatmapMatch = profileHtml.match(/var\s+userDailySubmissionsStats\s*=\s*(\[[\s\S]*?\]);/);
    if (heatmapMatch) {
      try {
        const stats = JSON.parse(heatmapMatch[1]);
        if (Array.isArray(stats)) {
          for (const item of stats) {
            const dateStr = item.date || item.submission_date;
            const count = Number(item.value || item.count || item.submissions || 0);
            if (dateStr && count > 0) {
              const formattedDate = dateStr.replace(/\//g, '-');
              baselineList.push({
                date: formattedDate,
                count,
                platform: 'CodeChef'
              });
            }
          }
        }
      } catch (err) {
        console.warn(`[CodeChef] Error parsing userDailySubmissionsStats for "${cleanHandle}":`, err.message);
      }
    }

    // Parse problem codes from profile solved section using Cheerio
    const $ = cheerio.load(profileHtml);
    $('section.problems-solved a[href*="/problems/"]').each((_, elem) => {
      const href = $(elem).attr('href') || '';
      const text = $(elem).text().trim();
      const codeMatch = href.match(/\/problems\/([A-Za-z0-9_]+)/);
      const code = codeMatch ? codeMatch[1] : text;

      if (code && !['IDE', 'easy', 'medium', 'hard', 'challenge'].includes(code)) {
        const problemId = `CC-${code}`;
        if (!problemsMap.has(problemId)) {
          // Solved on CodeChef profile
          problemsMap.set(problemId, {
            platform: 'CodeChef',
            problemId,
            title: text || code,
            url: `https://www.codechef.com/problems/${code}`,
            difficulty: 'CodeChef',
            solvedAt: new Date(), // Fallback timestamp if exact submission time not in profile
            dateString: toISTDateString(new Date())
          });
        }
      }
    });

    // 2. Fetch recent submissions table
    try {
      const recentUrl = `https://www.codechef.com/recent/user?page=0&user_handle=${encodeURIComponent(cleanHandle)}`;
      const recentRes = await axios.get(recentUrl, { headers, timeout: 10000 });
      const recentData = recentRes.data;

      if (recentData && recentData.content) {
        const $recent = cheerio.load(recentData.content);
        $recent('table.dataTable tbody tr').each((_, row) => {
          const resultCol = $recent(row).find('td:nth-child(3)');
          const isAccepted =
            resultCol.find('img[src*="tick-icon"]').length > 0 ||
            resultCol.find('span[title*="accepted"]').length > 0 ||
            resultCol.text().toLowerCase().includes('accepted');

          if (isAccepted) {
            const timeCol = $recent(row).find('td:nth-child(1)');
            const timeTooltip = timeCol.find('.tooltiptext').text().trim() || timeCol.attr('title') || timeCol.text().trim();
            const solvedDate = parseCodeChefTime(timeTooltip) || new Date();
            const dateString = toISTDateString(solvedDate);

            const probCol = $recent(row).find('td:nth-child(2)');
            const link = probCol.find('a');
            const href = link.attr('href') || '';
            const code = link.text().trim() || probCol.attr('title') || '';

            if (code) {
              const problemId = `CC-${code}`;
              // Update with exact submission time and URL
              problemsMap.set(problemId, {
                platform: 'CodeChef',
                problemId,
                title: code,
                url: href.startsWith('http') ? href : `https://www.codechef.com${href}`,
                difficulty: 'CodeChef',
                solvedAt: solvedDate,
                dateString
              });
            }
          }
        });
      }
    } catch (recentErr) {
      console.warn(`[CodeChef] Recent submissions fetch notice for "${cleanHandle}":`, recentErr.message);
    }

    const problems = Array.from(problemsMap.values());
    console.log(`[CodeChef] Fetched ${problems.length} solved problems and ${baselineList.length} baseline days for "${cleanHandle}"`);

    return {
      success: true,
      problems,
      baseline: baselineList
    };
  } catch (error) {
    const errMsg = error.message;
    console.error(`[CodeChef] Error fetching handle "${cleanHandle}":`, errMsg);
    return {
      success: false,
      error: errMsg,
      problems: [],
      baseline: []
    };
  }
}

module.exports = {
  fetchCodeChefData
};
