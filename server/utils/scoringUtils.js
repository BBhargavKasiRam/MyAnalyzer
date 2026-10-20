/**
 * Competitive Programming Scoring System
 * 
 * Rules:
 * 
 * 1. LeetCode:
 *    - Easy: 10 points
 *    - Medium: 25 points
 *    - Hard: 50 points
 *    - Default / Baseline: 15 points
 * 
 * 2. Codeforces (by rating):
 *    - Rating < 1000: 10 points (Div. 2 A/B beginner)
 *    - Rating 1000 - 1399: 20 points (Div. 2 B/C)
 *    - Rating 1400 - 1699: 35 points (Div. 2 C/D)
 *    - Rating 1700 - 1999: 55 points (Div. 2 D/E / Div. 1 A/B)
 *    - Rating 2000+: 80 points (Div. 1 advanced)
 *    - Unrated: 15 points
 * 
 * 3. CodeChef:
 *    - Rating < 1200 / School / Easy: 15 points
 *    - Rating 1200 - 1599 / Medium: 30 points
 *    - Rating 1600+ / Hard: 50 points
 *    - Default: 20 points
 */

function calculateProblemPoints(platform, difficulty) {
  const diffStr = String(difficulty || '').trim().toLowerCase();

  if (platform === 'LeetCode') {
    if (diffStr.includes('easy')) return 10;
    if (diffStr.includes('medium')) return 25;
    if (diffStr.includes('hard')) return 50;
    return 15;
  }

  if (platform === 'Codeforces') {
    const rating = parseInt(diffStr, 10);
    if (!isNaN(rating)) {
      if (rating < 1000) return 10;
      if (rating < 1400) return 20;
      if (rating < 1700) return 35;
      if (rating < 2000) return 55;
      return 80;
    }
    return 15;
  }

  if (platform === 'CodeChef') {
    const rating = parseInt(diffStr, 10);
    if (!isNaN(rating)) {
      if (rating < 1200) return 15;
      if (rating < 1600) return 30;
      return 50;
    }
    if (diffStr.includes('easy') || diffStr.includes('school')) return 15;
    if (diffStr.includes('medium')) return 30;
    if (diffStr.includes('hard')) return 50;
    return 20;
  }

  return 15;
}

/**
 * Categorizes a problem into 'Easy', 'Medium', or 'Hard' tier for standardized breakdown
 */
function getDifficultyTier(platform, difficulty) {
  const diffStr = String(difficulty || '').trim().toLowerCase();

  if (platform === 'LeetCode') {
    if (diffStr.includes('easy')) return 'Easy';
    if (diffStr.includes('medium')) return 'Medium';
    if (diffStr.includes('hard')) return 'Hard';
    return 'Medium';
  }

  if (platform === 'Codeforces') {
    const rating = parseInt(diffStr, 10);
    if (!isNaN(rating)) {
      if (rating < 1300) return 'Easy';
      if (rating < 1800) return 'Medium';
      return 'Hard';
    }
    return 'Medium';
  }

  if (platform === 'CodeChef') {
    const rating = parseInt(diffStr, 10);
    if (!isNaN(rating)) {
      if (rating < 1300) return 'Easy';
      if (rating < 1700) return 'Medium';
      return 'Hard';
    }
    if (diffStr.includes('easy') || diffStr.includes('school')) return 'Easy';
    if (diffStr.includes('medium')) return 'Medium';
    if (diffStr.includes('hard')) return 'Hard';
    return 'Medium';
  }

  return 'Medium';
}

module.exports = {
  calculateProblemPoints,
  getDifficultyTier
};
