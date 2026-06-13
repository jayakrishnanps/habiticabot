require('dotenv').config();
const habiticaClient = require('./src/habiticaClient');
const fs = require('fs');

async function testApi() {
    try {
        console.log('Fetching party members...');
        const membersResponse = await habiticaClient.request('GET', `/groups/${habiticaClient.partyId}/members?includeAllPublicFields=true`);
        fs.writeFileSync('members_dump.json', JSON.stringify(membersResponse.data, null, 2));
        
        console.log('Done.');
    } catch (e) {
        console.error(e);
    }
}
testApi();
