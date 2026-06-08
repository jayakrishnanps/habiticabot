const axios = require('axios');

class HabiticaClient {
  constructor() {
    this.baseURL = 'https://habitica.com/api/v3';
    this.userId = process.env.HABITICA_USER_ID;
    this.apiKey = process.env.HABITICA_API_KEY;
    this.partyId = process.env.PARTY_ID;
    this.requestTimestamps = [];
  }

  async checkRateLimit() {
    const now = Date.now();
    const sixtySecondsAgo = now - 60000;
    
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => timestamp > sixtySecondsAgo
    );
    
    if (this.requestTimestamps.length >= 30) {
      const oldestTimestamp = this.requestTimestamps[0];
      const waitTime = 60000 - (now - oldestTimestamp);
      console.log(`⏳ Rate limit reached. Waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requestTimestamps.push(Date.now());
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
    const response = await this.request('GET', `/groups/${this.partyId}/members`);
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
