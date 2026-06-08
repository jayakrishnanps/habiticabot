/**
 * Quick script to fetch your Party ID from Habitica
 * Run this once to get your party ID, then update .env file
 */

require('dotenv').config();
const axios = require('axios');

async function getPartyId() {
    try {
        console.log('🔍 Fetching your party information...\n');

        const response = await axios.get('https://habitica.com/api/v3/groups/party', {
            headers: {
                'x-api-user': process.env.HABITICA_USER_ID,
                'x-api-key': process.env.HABITICA_API_KEY,
                'x-client': `${process.env.HABITICA_USER_ID}-PartyIDFetcher`
            }
        });

        const party = response.data.data;

        console.log('✅ Party found!\n');
        console.log('━'.repeat(60));
        console.log(`Party Name: ${party.name}`);
        console.log(`Party ID: ${party._id}`);
        console.log(`Members: ${party.memberCount || 'Unknown'}`);
        console.log('━'.repeat(60));
        console.log('\n📝 Update your .env file with this Party ID:');
        console.log(`PARTY_ID=${party._id}\n`);

    } catch (error) {
        console.error('❌ Error fetching party info:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

getPartyId();
