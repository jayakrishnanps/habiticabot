# Habitica Party Automation Bot

A minimalistic bot for managing your Habitica party. It welcomes new members, updates weekly rankings, and automatically starts pending quests.

## Setup

1. **Credentials**: Get your Habitica `User ID` and `API Token`.
2. **Install**: Clone this repository and run `npm install`.
3. **Environment**: Copy `.env.example` to `.env` and fill in your user credentials.
4. **Party ID**: Run `node get-party-id.js` to fetch your `PARTY_ID` and add it to `.env`.
5. **Run**: `npm start`


## Features
- **Welcome Bot**: Automatically greets new members.
- **Rankings**: Updates party description with a leaderboard every Sunday.
- **Quest Auto-Starter**: Starts pending quests automatically.
