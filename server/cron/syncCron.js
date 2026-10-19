const cron = require('node-cron');
const User = require('../models/User');
const { syncUserData } = require('../services/syncService');

/**
 * Initializes the background cron job for periodic synchronization
 */
function initCron() {
  // Default: every 6 hours ("0 */6 * * *")
  const schedule = process.env.SYNC_CRON_SCHEDULE || '0 */6 * * *';

  if (!cron.validate(schedule)) {
    console.error(`[Cron] Invalid cron expression: "${schedule}". Using default "0 */6 * * *"`);
    return;
  }

  console.log(`[Cron] Background sync job scheduled with pattern: "${schedule}"`);

  cron.schedule(schedule, async () => {
    console.log(`\n⏰ [Cron] Starting scheduled background sync at ${new Date().toISOString()}`);

    try {
      const users = await User.find({});
      console.log(`[Cron] Found ${users.length} users to synchronize`);

      for (const user of users) {
        try {
          // Delay 2 seconds between users to be gentle on external platform APIs
          await new Promise(resolve => setTimeout(resolve, 2000));
          await syncUserData(user, true);
        } catch (err) {
          console.error(`[Cron] Sync failed for user "${user.username}":`, err.message);
        }
      }

      console.log(`✅ [Cron] Scheduled background sync completed\n`);
    } catch (error) {
      console.error(`[Cron] Error during scheduled sync:`, error.message);
    }
  });
}

module.exports = {
  initCron
};
