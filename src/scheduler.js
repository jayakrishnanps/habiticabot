const cron = require('node-cron');
const { updateDailyRankings } = require('./rankingBot');
const { checkAndStartQuest } = require('./questStarter');

function initializeScheduler() {
    console.log('Initializing task scheduler...');

    cron.schedule('0 0 * * *', async () => {
        console.log('\nScheduled task triggered: Daily Rankings Update');
        console.log(`   Time: ${new Date().toLocaleString()}`);

        try {
            await updateDailyRankings();
            console.log('Daily rankings task completed\n');
        } catch (error) {
            console.error('Daily rankings task failed:', error.message, '\n');
        }
    }, {
        timezone: 'Asia/Kolkata'
    });

    console.log('Scheduled: Daily rankings (Daily at 12:00 AM IST)');

    cron.schedule('0 */6 * * *', async () => {
        console.log('\nScheduled task triggered: Quest Auto-Starter Check');
        console.log(`   Time: ${new Date().toLocaleString()}`);

        try {
            await checkAndStartQuest();
            console.log('Quest check task completed\n');
        } catch (error) {
            console.error('Quest check task failed:', error.message, '\n');
        }
    }, {
        timezone: 'UTC'
    });

    console.log('Scheduled: Quest auto-starter (every 6 hours)');
    console.log('\nAll scheduled tasks initialized successfully!\n');
}

module.exports = {
    initializeScheduler
};
