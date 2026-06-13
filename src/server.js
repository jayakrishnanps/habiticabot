require('dotenv').config();

const express = require('express');
const { handleWebhook } = require('./welcomeBot');
const { initializeScheduler } = require('./scheduler');
const { updateDailyRankings } = require('./rankingBot');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

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

app.post('/webhook/chat', async (req, res) => {
    console.log('\n🎯 Webhook received from Habitica');

    try {
        res.status(200).json({ received: true });

        const webhookData = req.body;

        console.log('📦 Webhook data:', JSON.stringify(webhookData, null, 2));

        await handleWebhook(webhookData);

        console.log('✅ Webhook processed successfully\n');

    } catch (error) {
        console.error('❌ Error processing webhook:', error.message);
        console.error('   Stack:', error.stack);
    }
});

app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

app.use((err, req, res, next) => {
    console.error('💥 Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

function startServer() {
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

    app.listen(PORT, () => {
        console.log('\n' + '='.repeat(60));
        console.log('🤖 Habitica Party Automation Bot');
        console.log('='.repeat(60));
        console.log(`✅ Server is running on port ${PORT}`);
        console.log(`🌐 Health check: http://localhost:${PORT}/health`);
        console.log(`🎯 Webhook URL: http://localhost:${PORT}/webhook/chat`);
        console.log('='.repeat(60) + '\n');

        initializeScheduler();

        console.log('🎉 Bot is ready and waiting for events!\n');
        
        // Run immediately on startup
        console.log('🚀 Triggering initial startup ranking update...');
        updateDailyRankings().catch(err => {
            console.error('❌ Failed to update rankings during startup:', err.message);
        });
    });
}

startServer();

process.on('SIGTERM', () => {
    console.log('\n👋 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n👋 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});
