/**
 * Habitica Party Automation Bot - Main Server
 * 
 * This is the main entry point for the bot. It:
 * 1. Sets up an Express web server to receive webhooks from Habitica
 * 2. Initializes scheduled tasks (rankings, quest auto-start)
 * 3. Handles incoming webhook events
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const { handleWebhook } = require('./welcomeBot');
const { initializeScheduler } = require('./scheduler');

// Create Express application
const app = express();

// Get port from environment variable (Render will provide this)
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to log all incoming requests
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

/**
 * Health check endpoint
 * This is used by Render to check if the service is running
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

/**
 * Root endpoint - provides basic info about the bot
 */
app.get('/', (req, res) => {
    res.json({
        name: 'Habitica Party Automation Bot',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/health',
            webhook: '/webhook/chat'
        }
    });
});

/**
 * Webhook endpoint for Habitica events
 * Habitica will send POST requests here when events occur
 */
app.post('/webhook/chat', async (req, res) => {
    console.log('\n🎯 Webhook received from Habitica');

    try {
        // Immediately respond to Habitica to acknowledge receipt
        // This prevents timeout issues
        res.status(200).json({ received: true });

        // Process the webhook data asynchronously
        // This allows us to respond quickly while still processing the event
        const webhookData = req.body;

        // Log the webhook data for debugging
        console.log('📦 Webhook data:', JSON.stringify(webhookData, null, 2));

        // Pass the webhook to the welcome bot handler
        await handleWebhook(webhookData);

        console.log('✅ Webhook processed successfully\n');

    } catch (error) {
        console.error('❌ Error processing webhook:', error.message);
        console.error('   Stack:', error.stack);
        // Note: We already sent the response, so we just log the error
    }
});

/**
 * 404 handler for unknown routes
 */
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
    console.error('💥 Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

/**
 * Start the server
 */
function startServer() {
    // Validate required environment variables
    const requiredEnvVars = ['HABITICA_USER_ID', 'HABITICA_API_KEY', 'PARTY_ID'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:');
        missingVars.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('\nPlease create a .env file based on .env.example');
        process.exit(1);
    }

    // Start the Express server
    app.listen(PORT, () => {
        console.log('\n' + '='.repeat(60));
        console.log('🤖 Habitica Party Automation Bot');
        console.log('='.repeat(60));
        console.log(`✅ Server is running on port ${PORT}`);
        console.log(`🌐 Health check: http://localhost:${PORT}/health`);
        console.log(`🎯 Webhook URL: http://localhost:${PORT}/webhook/chat`);
        console.log('='.repeat(60) + '\n');

        // Initialize scheduled tasks
        initializeScheduler();

        console.log('🎉 Bot is ready and waiting for events!\n');
    });
}

// Start the server
startServer();

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n👋 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n👋 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});
