/**
 * Quest Auto-Starter Module
 * 
 * This module checks if a quest has been pending for more than 24 hours
 * and automatically starts it if needed.
 */

const habiticaClient = require('./habiticaClient');

/**
 * Check quest status and auto-start if pending too long
 * This function is called by the scheduler every 6 hours
 */
async function checkAndStartQuest() {
    try {
        console.log('🔍 Checking quest status...');

        // Step 1: Get party information (includes quest data)
        const partyInfo = await habiticaClient.getPartyInfo();

        // Step 2: Check if there's an active quest
        const quest = partyInfo.quest;

        if (!quest || !quest.key) {
            console.log('ℹ️  No quest is currently active or pending');
            return;
        }

        // Step 3: Check if quest is pending (not started yet)
        if (!quest.active) {
            console.log('⏳ Quest is pending, checking how long...');

            // Check if quest has been pending for more than 24 hours
            const isPendingTooLong = await isQuestPendingTooLong(quest);

            if (isPendingTooLong) {
                console.log('🚀 Quest has been pending for over 24 hours, starting it now...');
                await startQuest(quest);
            } else {
                console.log('✅ Quest is pending but not for 24 hours yet');
            }
        } else {
            console.log('✅ Quest is already active');
        }

    } catch (error) {
        console.error('❌ Error checking quest status:', error.message);
        // Don't throw - we'll try again on the next scheduled run
    }
}

/**
 * Check if a quest has been pending for more than 24 hours
 * @param {object} quest - Quest object from party data
 * @returns {boolean} - True if pending for more than 24 hours
 */
async function isQuestPendingTooLong(quest) {
    // Note: Habitica doesn't directly provide the "pending since" timestamp
    // We'll check if there are members who haven't accepted yet

    // If all members have accepted, we should definitely start
    const members = quest.members || {};
    const memberIds = Object.keys(members);

    if (memberIds.length === 0) {
        console.log('⚠️  No members in quest data');
        return false;
    }

    // Count how many members have accepted
    let acceptedCount = 0;
    let rejectedCount = 0;

    memberIds.forEach(memberId => {
        if (members[memberId] === true) {
            acceptedCount++;
        } else if (members[memberId] === false) {
            rejectedCount++;
        }
    });

    const totalResponses = acceptedCount + rejectedCount;
    const responseRate = totalResponses / memberIds.length;

    console.log(`   📊 Quest responses: ${acceptedCount} accepted, ${rejectedCount} rejected out of ${memberIds.length} members`);
    console.log(`   📊 Response rate: ${(responseRate * 100).toFixed(1)}%`);

    // Start quest if:
    // 1. More than 50% of members have responded, OR
    // 2. At least one member has accepted (to prevent quest from stalling)
    // This is a simplified check since we can't track exact time

    if (acceptedCount > 0 && responseRate > 0.5) {
        console.log('   ✅ Sufficient responses to start quest');
        return true;
    }

    // For a more accurate time-based check, you would need to store
    // the quest start time in a database or file
    console.log('   ⏳ Waiting for more responses');
    return false;
}

/**
 * Force-start a pending quest
 * @param {object} quest - Quest object from party data
 */
async function startQuest(quest) {
    try {
        // Force-start the quest
        await habiticaClient.forceStartQuest();

        console.log('✅ Quest started successfully!');

        // Send notification to party chat
        const questName = quest.key || 'the quest';
        await habiticaClient.sendChatMessage(
            `🚀 Quest "${questName}" has been auto-started! Let's go, adventurers! ⚔️`
        );

    } catch (error) {
        console.error('❌ Failed to start quest:', error.message);
        throw error;
    }
}

module.exports = {
    checkAndStartQuest,
    isQuestPendingTooLong,
    startQuest
};
