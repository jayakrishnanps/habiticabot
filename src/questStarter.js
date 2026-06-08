const habiticaClient = require('./habiticaClient');

async function checkAndStartQuest() {
    try {
        console.log('🔍 Checking quest status...');

        const partyInfo = await habiticaClient.getPartyInfo();
        const quest = partyInfo.quest;

        if (!quest || !quest.key) {
            console.log('ℹ️  No quest is currently active or pending');
            return;
        }

        if (!quest.active) {
            console.log('⏳ Quest is pending, checking how long...');

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
    }
}

async function isQuestPendingTooLong(quest) {
    const members = quest.members || {};
    const memberIds = Object.keys(members);

    if (memberIds.length === 0) {
        console.log('⚠️  No members in quest data');
        return false;
    }

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

    if (acceptedCount > 0 && responseRate > 0.5) {
        console.log('   ✅ Sufficient responses to start quest');
        return true;
    }

    console.log('   ⏳ Waiting for more responses');
    return false;
}

async function startQuest(quest) {
    try {
        await habiticaClient.forceStartQuest();

        console.log('✅ Quest started successfully!');

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
