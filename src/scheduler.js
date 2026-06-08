const cron = require('node-cron');
const { updateWeeklyRankings } = require('./rankingBot');
const { checkAndStartQuest } = require('./questStarter');

function initializeScheduler() {
    console.log('⏰ Initializing task scheduler...');

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
        timezone: 'UTC'
    });

    console.log('✅ Scheduled: Weekly rankings (Sundays at 9:00 AM UTC)');

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
