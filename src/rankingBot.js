/**
 * Ranking Bot Module
 * 
 * This module generates weekly leaderboards based on member stats
 * and updates the party description with the rankings.
 */

const habiticaClient = require('./habiticaClient');

/**
 * Generate and update weekly rankings
 * This function is called by the scheduler every Sunday
 */
async function updateWeeklyRankings() {
    try {
        console.log('📊 Starting weekly ranking update...');

        // Step 1: Fetch all party members
        console.log('👥 Fetching party members...');
        const members = await habiticaClient.getPartyMembers();
        console.log(`   Found ${members.length} members`);

        // Step 2: Calculate rankings based on total experience
        console.log('🧮 Calculating rankings...');
        const rankings = calculateRankings(members);

        // Step 3: Generate leaderboard markdown
        console.log('📝 Generating leaderboard...');
        const leaderboard = generateLeaderboard(rankings);

        // Step 4: Update party description
        console.log('💾 Updating party description...');
        await habiticaClient.updatePartyDescription(leaderboard);

        console.log('✅ Weekly rankings updated successfully!');

        // Also send a notification to chat
        await habiticaClient.sendChatMessage(
            '📊 Weekly rankings have been updated! Check the party description to see the leaderboard. 🏆'
        );

    } catch (error) {
        console.error('❌ Error updating weekly rankings:', error.message);
        throw error;
    }
}

/**
 * Calculate rankings for all members
 * @param {Array} members - Array of member objects from Habitica API
 * @returns {Array} - Sorted array of member rankings
 */
function calculateRankings(members) {
    // Map members to a simpler ranking object
    const rankings = members.map(member => {
        // Get stats from member data
        const stats = member.stats || {};
        const experience = stats.exp || 0;
        const level = stats.lvl || 1;
        const health = stats.hp || 50;

        // Calculate total score (you can customize this formula)
        // Using experience as the primary ranking metric
        const totalScore = experience + (level * 100);

        return {
            username: member.profile?.name || member.auth?.local?.username || 'Unknown',
            level: level,
            experience: Math.floor(experience),
            health: Math.floor(health),
            totalScore: totalScore
        };
    });

    // Sort by total score (highest first)
    rankings.sort((a, b) => b.totalScore - a.totalScore);

    return rankings;
}

/**
 * Generate a Markdown-formatted leaderboard
 * @param {Array} rankings - Sorted array of member rankings
 * @returns {string} - Markdown formatted leaderboard
 */
function generateLeaderboard(rankings) {
    // Get current date for the leaderboard header
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Start building the leaderboard
    let leaderboard = `# 🏆 Weekly Leaderboard\n\n`;
    leaderboard += `**Updated:** ${dateString}\n\n`;
    leaderboard += `---\n\n`;

    // Add top 10 members (or fewer if party is smaller)
    const topMembers = rankings.slice(0, 10);

    // Create table header
    leaderboard += `| Rank | Player | Level | Experience | HP |\n`;
    leaderboard += `|------|--------|-------|------------|----|\n`;

    // Add each member to the table
    topMembers.forEach((member, index) => {
        const rank = index + 1;

        // Add medal emoji for top 3
        let rankDisplay = `${rank}`;
        if (rank === 1) rankDisplay = '🥇 1';
        else if (rank === 2) rankDisplay = '🥈 2';
        else if (rank === 3) rankDisplay = '🥉 3';

        leaderboard += `| ${rankDisplay} | ${member.username} | ${member.level} | ${member.experience} | ${member.health} |\n`;
    });

    leaderboard += `\n---\n\n`;
    leaderboard += `*Rankings based on total experience. Keep up the great work! 💪*\n`;

    return leaderboard;
}

module.exports = {
    updateWeeklyRankings,
    calculateRankings,
    generateLeaderboard
};
