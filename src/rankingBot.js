const habiticaClient = require('./habiticaClient');

async function updateWeeklyRankings() {
    try {
        console.log('📊 Starting weekly ranking update...');
        console.log('👥 Fetching party members...');
        const members = await habiticaClient.getPartyMembers();
        console.log(`   Found ${members.length} members`);

        console.log('🧮 Calculating rankings...');
        const rankings = calculateRankings(members);

        console.log('📝 Generating leaderboard...');
        const leaderboard = generateLeaderboard(rankings);

        console.log('💾 Updating party description...');
        await habiticaClient.updatePartyDescription(leaderboard);

        console.log('✅ Weekly rankings updated successfully!');

        await habiticaClient.sendChatMessage(
            '📊 Weekly rankings have been updated! Check the party description to see the leaderboard. 🏆'
        );

    } catch (error) {
        console.error('❌ Error updating weekly rankings:', error.message);
        throw error;
    }
}

function calculateRankings(members) {
    const rankings = members.map(member => {
        const stats = member.stats || {};
        const experience = stats.exp || 0;
        const level = stats.lvl || 1;
        const health = stats.hp || 50;

        const totalScore = experience + (level * 100);

        return {
            username: member.profile?.name || member.auth?.local?.username || 'Unknown',
            level: level,
            experience: Math.floor(experience),
            health: Math.floor(health),
            totalScore: totalScore
        };
    });

    rankings.sort((a, b) => b.totalScore - a.totalScore);

    return rankings;
}

function generateLeaderboard(rankings) {
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let leaderboard = `# 🏆 Weekly Leaderboard\n\n`;
    leaderboard += `**Updated:** ${dateString}\n\n`;
    leaderboard += `---\n\n`;

    const topMembers = rankings.slice(0, 10);

    leaderboard += `| Rank | Player | Level | Experience | HP |\n`;
    leaderboard += `|------|--------|-------|------------|----|\n`;

    topMembers.forEach((member, index) => {
        const rank = index + 1;

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
