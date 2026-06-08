/**
 * Task Scheduler Module
 * 
 * This module sets up cron jobs for automated tasks:
 * - Weekly ranking updates (every Sunday at 9 AM)
 * - Quest auto-starter checks (every 6 hours)
 */

const cron = require('node-cron');
const { updateWeeklyRankings } = require('./rankingBot');
const { checkAndStartQuest } = require('./questStarter');

/**
 * Initialize all scheduled tasks
 */
function initializeScheduler() {
    console.log('⏰ Initializing task scheduler...');

    // Schedule weekly ranking updates
    // Cron format: minute hour day-of-month month day-of-week
    // '0 9 * * 0' = Every Sunday at 9:00 AM
    cron.schedule('0 9 * * 0', async () => {
        console.log('\n🔔 Scheduled task triggered: Weekly Rankings Update');
        console.log(`   Time: ${new Date().toLocaleString()}`);

        try {
            await updateWeeklyRankings();
            console.log('✅ Weekly rankings task completed\n');
        } catch (error) {
            console.error('❌ Weekly rankings task failed:', error.message, '\n');
        }
    }, {
        timezone: 'UTC' // You can change this to your timezone (e.g., 'America/New_York')
    });

    console.log('✅ Scheduled: Weekly rankings (Sundays at 9:00 AM UTC)');

    // Schedule quest auto-starter checks
    // '0 */6 * * *' = Every 6 hours (at minute 0)
    cron.schedule('0 */6 * * *', async () => {
        console.log('\n🔔 Scheduled task triggered: Quest Auto-Starter Check');
        console.log(`   Time: ${new Date().toLocaleString()}`);

        try {
            await checkAndStartQuest();
            console.log('✅ Quest check task completed\n');
        } catch (error) {
            console.error('❌ Quest check task failed:', error.message, '\n');
        }
    }, {
        timezone: 'UTC'
    });

    console.log('✅ Scheduled: Quest auto-starter (every 6 hours)');

    console.log('\n📅 All scheduled tasks initialized successfully!\n');
}

module.exports = {
    initializeScheduler
};
