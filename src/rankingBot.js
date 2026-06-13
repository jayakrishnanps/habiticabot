const fs = require('fs');
const path = require('path');
const habiticaClient = require('./habiticaClient');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'damageData.json');

function loadData() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        } catch (error) {
            console.error('Error reading damageData.json, starting fresh:', error.message);
        }
    }
    return { weeklyData: {}, lastResetDate: null };
}

function saveData(data) {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

let isUpdating = false;

async function updateDailyRankings() {
    if (isUpdating) {
        console.log('Ranking update already in progress, skipping...');
        return;
    }
    
    isUpdating = true;
    try {
        console.log('Starting daily ranking update...');
        console.log('Fetching party members...');
        const members = await habiticaClient.getPartyMembers();
        console.log(`   Found ${members.length} members`);

        console.log('Calculating cumulative rankings...');
        const rankings = calculateRankings(members);

        console.log('Generating leaderboard...');
        const leaderboard = generateLeaderboard(rankings);

        console.log('Updating party description...');
        await habiticaClient.updatePartyDescription(leaderboard);

        console.log('Daily rankings updated successfully!');

        await habiticaClient.sendChatMessage(
            'Cumulative weekly quest damage rankings have been updated. Check the party description.'
        );

    } catch (error) {
        console.error('Error updating daily rankings:', error.message);
        throw error;
    } finally {
        isUpdating = false;
    }
}

function calculateRankings(members) {
    const data = loadData();
    let weeklyData = data.weeklyData || {};
    let lastResetDate = data.lastResetDate || null;

    const rankings = [];
    const now = new Date();
    
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    const istDateString = dateFormatter.format(now);
    
    const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short'
    });
    const weekday = weekdayFormatter.format(now);
    const isSunday = (weekday === 'Sun');

    if (isSunday && lastResetDate !== istDateString) {
        console.log(`Sunday detected. Resetting weekly totals before building the leaderboard...`);
        for (const userId in weeklyData) {
            weeklyData[userId].weeklyTotal = 0;
        }
        data.lastResetDate = istDateString;
    }

    const activeMemberIds = members.map(m => m._id || m.id);
    for (const userId in weeklyData) {
        if (!activeMemberIds.includes(userId)) {
            console.log(`Member ${weeklyData[userId].username} left the party. Removing from weekly data.`);
            delete weeklyData[userId];
        }
    }

    members.forEach(member => {
        const userId = member._id || member.id;
        const currentDamage = member.party?.quest?.progress?.up || 0;
        
        if (!weeklyData[userId]) {
            weeklyData[userId] = {
                username: member.profile?.name || member.auth?.local?.username || 'Unknown',
                weeklyTotal: 0,
                previousSnapshot: 0
            };
        }

        weeklyData[userId].username = member.profile?.name || member.auth?.local?.username || 'Unknown';

        let previous = weeklyData[userId].previousSnapshot;
        let delta = 0;

        if (currentDamage >= previous) {
            delta = currentDamage - previous;
        } else {
            delta = currentDamage;
        }

        weeklyData[userId].weeklyTotal += delta;
        weeklyData[userId].previousSnapshot = currentDamage;

        rankings.push({
            username: weeklyData[userId].username,
            damage: weeklyData[userId].weeklyTotal
        });
    });

    data.weeklyData = weeklyData;
    saveData(data);

    rankings.sort((a, b) => b.damage - a.damage);

    return rankings;
}

function generateLeaderboard(rankings) {
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let leaderboard = `Cumulative Weekly Quest Damage Leaderboard\n`;
    leaderboard += `Updated: ${dateString}\n\n`;

    if (rankings.length === 0) {
        leaderboard += `No damage dealt so far this week.\n`;
        return leaderboard;
    }

    leaderboard += `Rank | Player | Weekly Damage Dealt\n`;
    leaderboard += `---|---|---\n`;

    rankings.forEach((member, index) => {
        const rank = index + 1;
        const damageString = Number.isInteger(member.damage) ? member.damage.toString() : member.damage.toFixed(1);
        leaderboard += `${rank} | ${member.username} | ${damageString}\n`;
    });

    return leaderboard;
}

module.exports = {
    updateDailyRankings,
    calculateRankings,
    generateLeaderboard
};
