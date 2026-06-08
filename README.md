# 🤖 Habitica Party Automation Bot

A fully automated bot for managing your Habitica party! This bot welcomes new members, updates weekly rankings, and automatically starts quests that have been pending too long.

## ✨ Features

1. **🎉 Welcome New Members**: Automatically sends a friendly welcome message when someone joins your party
2. **📊 Weekly Rankings**: Updates party description every Sunday with a leaderboard of top performers
3. **🚀 Quest Auto-Starter**: Automatically starts quests that have been pending for more than 24 hours

## 📋 Prerequisites

Before you begin, you'll need:

- A [Habitica](https://habitica.com) account
- A party in Habitica (you must be the party leader to use some features)
- A [Render.com](https://render.com) account (free tier works great!)
- Basic familiarity with copying and pasting (that's it!)

## 🚀 Quick Start Guide

### Step 1: Get Your Habitica API Credentials

1. Log in to [Habitica](https://habitica.com)
2. Click on your avatar in the top-right corner
3. Select **Settings** from the dropdown menu
4. Scroll down to **API** section
5. Click **Show API Token**
6. Copy both:
   - **User ID** (looks like: `12345678-1234-1234-1234-123456789abc`)
   - **API Token** (looks like: `abcdef12-3456-7890-abcd-ef1234567890`)

⚠️ **IMPORTANT**: Keep these credentials secret! Never share them or commit them to GitHub.

### Step 2: Find Your Party ID

1. Go to your party page on Habitica
2. Look at the URL in your browser
3. The URL will look like: `https://habitica.com/party/12345678-1234-1234-1234-123456789abc`
4. Copy the long ID at the end (after `/party/`)

### Step 3: Set Up the Project Locally (Optional Testing)

If you want to test the bot on your computer first:

1. **Install Node.js**:
   - Download from [nodejs.org](https://nodejs.org/)
   - Choose the LTS (Long Term Support) version
   - Install with default settings

2. **Set up the bot**:
   ```bash
   # Navigate to the project folder
   cd e:\projects\habiticabot

   # Install dependencies
   npm install

   # Create your .env file
   copy .env.example .env
   ```

3. **Edit the `.env` file**:
   - Open `.env` in any text editor (Notepad works fine!)
   - Replace the placeholder values with your actual credentials:
   ```
   HABITICA_USER_ID=your-actual-user-id-here
   HABITICA_API_KEY=your-actual-api-key-here
   PARTY_ID=your-actual-party-id-here
   PORT=3000
   ```

4. **Run the bot locally**:
   ```bash
   npm start
   ```

   You should see:
   ```
   ✅ Server is running on port 3000
   🎉 Bot is ready and waiting for events!
   ```

### Step 4: Deploy to Render.com

1. **Create a GitHub Repository**:
   - Go to [GitHub](https://github.com) and create a new repository
   - Name it something like `habitica-party-bot`
   - Make it **private** (to protect your code)
   - Don't initialize with README (we already have one!)

2. **Push your code to GitHub**:
   ```bash
   # Initialize git (if not already done)
   git init

   # Add all files
   git add .

   # Commit
   git commit -m "Initial commit - Habitica Party Bot"

   # Add your GitHub repository as remote
   git remote add origin https://github.com/YOUR-USERNAME/habitica-party-bot.git

   # Push to GitHub
   git push -u origin main
   ```

3. **Deploy on Render**:
   - Go to [Render.com](https://render.com) and sign up/login
   - Click **New +** → **Web Service**
   - Connect your GitHub account
   - Select your `habitica-party-bot` repository
   - Render will auto-detect the settings from `render.yaml`
   - Click **Advanced** and add your environment variables:
     - `HABITICA_USER_ID`: Your Habitica User ID
     - `HABITICA_API_KEY`: Your Habitica API Token
     - `PARTY_ID`: Your Party ID
   - Click **Create Web Service**

4. **Wait for deployment**:
   - Render will install dependencies and start your bot
   - This takes 2-3 minutes
   - Once you see "Your service is live 🎉", you're ready!

5. **Copy your webhook URL**:
   - At the top of your Render dashboard, you'll see your service URL
   - It looks like: `https://habitica-party-bot-xxxx.onrender.com`
   - Copy this URL and add `/webhook/chat` to the end
   - Final webhook URL: `https://habitica-party-bot-xxxx.onrender.com/webhook/chat`

### Step 5: Register the Webhook in Habitica

Unfortunately, Habitica doesn't have a UI for webhooks. You'll need to use a tool to register it:

**Option A: Use Postman (Recommended for beginners)**

1. Download [Postman](https://www.postman.com/downloads/)
2. Create a new POST request
3. URL: `https://habitica.com/api/v3/user/webhook`
4. Headers:
   - `x-api-user`: Your Habitica User ID
   - `x-api-key`: Your Habitica API Token
   - `Content-Type`: `application/json`
5. Body (select "raw" and "JSON"):
   ```json
   {
     "url": "https://your-render-url.onrender.com/webhook/chat",
     "type": "groupChatReceived",
     "enabled": true
   }
   ```
6. Click **Send**

**Option B: Use cURL (Command line)**

```bash
curl -X POST https://habitica.com/api/v3/user/webhook \
  -H "x-api-user: YOUR_USER_ID" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-render-url.onrender.com/webhook/chat",
    "type": "groupChatReceived",
    "enabled": true
  }'
```

## 🧪 Testing Your Bot

### Test the Welcome Message

1. Have a friend join your party, OR
2. Leave and rejoin your party yourself
3. The bot should send a welcome message within a few seconds!

### Test the Rankings

The rankings update automatically every Sunday at 9 AM UTC. To test immediately:

1. You can manually trigger it by modifying the cron schedule in `src/scheduler.js`
2. Or wait until Sunday morning!

### Test the Quest Auto-Starter

1. Start a quest in your party
2. Wait for it to be pending
3. The bot checks every 6 hours and will start it if conditions are met

## 🔧 Customization

### Change the Welcome Message

Edit `src/welcomeBot.js`, find the `sendWelcomeMessage` function, and modify the `welcomeMessage` text.

### Change Ranking Schedule

Edit `src/scheduler.js`:
- Current: `'0 9 * * 0'` (Sundays at 9 AM)
- Daily at midnight: `'0 0 * * *'`
- Every Monday at 6 PM: `'0 18 * * 1'`

[Cron format guide](https://crontab.guru/)

### Change Ranking Criteria

Edit `src/rankingBot.js`, find the `calculateRankings` function, and modify the `totalScore` calculation.

## 📊 Monitoring

### Check if your bot is running

Visit: `https://your-render-url.onrender.com/health`

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "uptime": 12345
}
```

### View logs on Render

1. Go to your Render dashboard
2. Click on your service
3. Click **Logs** tab
4. You'll see all bot activity in real-time!

## ❓ Troubleshooting

### Bot isn't responding to new members

1. **Check webhook registration**:
   - Make sure you registered the webhook correctly
   - Verify the URL is correct (should end with `/webhook/chat`)

2. **Check Render logs**:
   - Look for incoming webhook events
   - Check for any error messages

3. **Verify environment variables**:
   - Go to Render dashboard → Environment
   - Make sure all variables are set correctly

### Rankings aren't updating

1. **Check the schedule**:
   - Rankings update Sundays at 9 AM UTC
   - Check what time that is in your timezone

2. **Check Render logs on Sunday**:
   - Look for "Scheduled task triggered: Weekly Rankings Update"
   - Check for any errors

### Quest auto-starter isn't working

1. **Verify you're the party leader**:
   - Only party leaders can force-start quests

2. **Check the quest status**:
   - The quest must be pending (not active)
   - At least one member must have accepted

## 🆘 Getting Help

If you're stuck:

1. Check the Render logs for error messages
2. Make sure all environment variables are set correctly
3. Verify your Habitica API credentials are correct
4. Check that your webhook is registered properly

## 📝 File Structure

```
habitica-bot/
├── src/
│   ├── server.js           # Main Express server
│   ├── scheduler.js        # Cron jobs for scheduled tasks
│   ├── habiticaClient.js   # API wrapper for Habitica
│   ├── welcomeBot.js       # Welcome message logic
│   ├── rankingBot.js       # Weekly rankings logic
│   └── questStarter.js     # Quest auto-start logic
├── .env.example            # Template for environment variables
├── .gitignore              # Git ignore file
├── package.json            # Dependencies
├── README.md               # This file!
└── render.yaml             # Render deployment config
```

## 🔒 Security Notes

- **Never commit your `.env` file** to GitHub (it's in `.gitignore`)
- **Keep your API credentials secret**
- **Use environment variables** on Render for sensitive data
- **Make your GitHub repo private** if you're concerned about security

## 📜 License

MIT License - feel free to modify and use this bot however you like!

## 🎉 Enjoy!

Your Habitica party is now fully automated! Sit back and let the bot handle the routine tasks while you focus on completing your real-life goals. Happy adventuring! ⚔️✨
