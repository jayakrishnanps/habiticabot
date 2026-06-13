const axios = require('axios');

class HabiticaClient {
  constructor() {
    this.baseURL = 'https://habitica.com/api/v3';
    this.userId = process.env.HABITICA_USER_ID;
    this.apiKey = process.env.HABITICA_API_KEY;
    this.partyId = process.env.PARTY_ID;
    this.lastRequestTimestamp = 0;
  }

  async checkRateLimit() {
    const now = Date.now();
    
    if (this.lastRequestTimestamp > 0) {
      const timeSinceLastRequest = now - this.lastRequestTimestamp;
      if (timeSinceLastRequest < 30000) {
        const waitTime = 30000 - timeSinceLastRequest;
        console.log(`Waiting ${waitTime}ms to comply with background tool guidelines...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    this.lastRequestTimestamp = Date.now();
  }

  async request(method, endpoint, data = null) {
    await this.checkRateLimit();
    
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'x-api-user': this.userId,
          'x-api-key': this.apiKey,
          'x-client': `${this.userId}-AutomationBot`,
          'Content-Type': 'application/json'
        }
      };
      
      if (data) {
        config.data = data;
      }
      
      console.log(`📡 API Request: ${method} ${endpoint}`);
      const response = await axios(config);
      
      console.log(`✅ API Response: Success`);
      return response.data;
      
    } catch (error) {
      console.error(`❌ API Error: ${error.message}`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data:`, error.response.data);
      }
      throw error;
    }
  }

  async getPartyMembers() {
    const response = await this.request('GET', `/groups/${this.partyId}/members?includeAllPublicFields=true`);
    return response.data;
  }

  async getPartyInfo() {
    const response = await this.request('GET', `/groups/${this.partyId}`);
    return response.data;
  }

  async sendChatMessage(message) {
    return await this.request('POST', `/groups/${this.partyId}/chat`, {
      message
    });
  }

  async updatePartyDescription(description) {
    return await this.request('PUT', `/groups/${this.partyId}`, {
      description
    });
  }

  async forceStartQuest() {
    return await this.request('POST', `/groups/${this.partyId}/quests/force-start`);
  }
}

module.exports = new HabiticaClient();
