const habiticaClient = require('./habiticaClient');

async function handleWebhook(webhookData) {
    try {
        console.log('🔔 Webhook received:', JSON.stringify(webhookData, null, 2));

        if (!webhookData || !webhookData.chat) {
            console.log('ℹ️  Not a chat message event, ignoring');
            return;
        }

        const chatMessage = webhookData.chat;
        const messageText = chatMessage.text || '';

        const joinPattern = /has joined the party/i;

        if (joinPattern.test(messageText)) {
            console.log('🎉 New member detected!');

            const usernameMatch = messageText.match(/^(.+?)\s+has joined the party/i);

            if (usernameMatch && usernameMatch[1]) {
                const username = usernameMatch[1].trim();
                await sendWelcomeMessage(username);
            } else {
                console.log('⚠️  Could not extract username from join message');
            }
        } else {
            console.log('ℹ️  Not a join message, ignoring');
        }

    } catch (error) {
        console.error('❌ Error in welcome bot:', error.message);
    }
}

async function sendWelcomeMessage(username) {
    try {
        const welcomeMessage = `🎉 Welcome to the party, @${username}! 🎉\n\n` +
            `We're so glad to have you here! Feel free to join in on quests, ` +
            `chat with the group, and let us know if you have any questions. ` +
            `Happy adventuring! 🗡️✨`;

        console.log(`💬 Sending welcome message to ${username}...`);

        await habiticaClient.sendChatMessage(welcomeMessage);

        console.log(`✅ Welcome message sent successfully to ${username}`);

    } catch (error) {
        console.error(`❌ Failed to send welcome message to ${username}:`, error.message);
        throw error;
    }
}

module.exports = {
    handleWebhook,
    sendWelcomeMessage
};
