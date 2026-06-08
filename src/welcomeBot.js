/**
 * Welcome Bot Module
 * 
 * This module handles welcoming new members when they join the party.
 * It listens for join events and sends a personalized welcome message.
 */

const habiticaClient = require('./habiticaClient');

/**
 * Process incoming webhook data to detect new member joins
 * @param {object} webhookData - Data received from Habitica webhook
 */
async function handleWebhook(webhookData) {
    try {
        console.log('🔔 Webhook received:', JSON.stringify(webhookData, null, 2));

        // Check if this is a chat message event
        if (!webhookData || !webhookData.chat) {
            console.log('ℹ️  Not a chat message event, ignoring');
            return;
        }

        const chatMessage = webhookData.chat;
        const messageText = chatMessage.text || '';

        // Check if the message indicates someone joined the party
        // Habitica sends system messages like "Username has joined the party"
        const joinPattern = /has joined the party/i;

        if (joinPattern.test(messageText)) {
            console.log('🎉 New member detected!');

            // Extract username from the message
            // Message format is typically: "Username has joined the party"
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
        // Don't throw - we don't want to crash the server on webhook errors
    }
}

/**
 * Send a personalized welcome message to the party chat
 * @param {string} username - The username of the new member
 */
async function sendWelcomeMessage(username) {
    try {
        // Create a friendly welcome message
        const welcomeMessage = `🎉 Welcome to the party, @${username}! 🎉\n\n` +
            `We're so glad to have you here! Feel free to join in on quests, ` +
            `chat with the group, and let us know if you have any questions. ` +
            `Happy adventuring! 🗡️✨`;

        console.log(`💬 Sending welcome message to ${username}...`);

        // Send the message to party chat
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
