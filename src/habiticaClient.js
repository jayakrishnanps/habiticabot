/**
 * Habitica API Client
 * 
 * This module provides a reusable interface for making API calls to Habitica.
 * It handles authentication, rate limiting, and error handling.
 */

const axios = require('axios');

class HabiticaClient {
  constructor() {
    // Base URL for all Habitica API requests
    this.baseURL = 'https://habitica.com/api/v3';
    
    // Get credentials from environment variables
    this.userId = process.env.HABITICA_USER_ID;
    this.apiKey = process.env.HABITICA_API_KEY;
    this.partyId = process.env.PARTY_ID;
    
    // Track API calls for rate limiting (max 30 requests per 60 seconds)
    this.requestTimestamps = [];
  }

  /**
   * Check if we're within rate limits before making a request
   * Habitica allows 30 requests per 60 seconds
   */
  async checkRateLimit() {
    const now = Date.now();
    const sixtySecondsAgo = now - 60000;
    
    // Remove timestamps older than 60 seconds
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => timestamp > sixtySecondsAgo
    );
    
    // If we've made 30 requests in the last 60 seconds, wait
    if (this.requestTimestamps.length >= 30) {
      const oldestTimestamp = this.requestTimestamps[0];
      const waitTime = 60000 - (now - oldestTimestamp);
      console.log(`⏳ Rate limit reached. Waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Record this request
    this.requestTimestamps.push(Date.now());
  }

  /**
   * Make a request to the Habitica API
   * @param {string} method - HTTP method (GET, POST, PUT, etc.)
   * @param {string} endpoint - API endpoint (e.g., '/groups/party')
   * @param {object} data - Request body data (for POST/PUT)
   * @returns {Promise} - API response data
   */
  async request(method, endpoint, data = null) {
    // Check rate limit before making request
    await this.checkRateLimit();
    
    try {
      // Configure the request
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
      
      // Add data to request if provided
      if (data) {
        config.data = data;
      }
      
      // Make the request
      console.log(`📡 API Request: ${method} ${endpoint}`);
      const response = await axios(config);
      
      console.log(`✅ API Response: Success`);
      return response.data;
      
    } catch (error) {
      // Handle errors gracefully
      console.error(`❌ API Error: ${error.message}`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data:`, error.response.data);
      }
      throw error;
    }
  }

  /**
   * Get all members of the party
   * @returns {Promise<Array>} - Array of party member objects
   */
  async getPartyMembers() {
    const response = await this.request('GET', `/groups/${this.partyId}/members`);
    return response.data;
  }

  /**
   * Get party information (including quest status)
   * @returns {Promise<Object>} - Party data object
   */
  async getPartyInfo() {
    const response = await this.request('GET', `/groups/${this.partyId}`);
    return response.data;
  }

  /**
   * Send a message to the party chat
   * @param {string} message - The message to send
   * @returns {Promise} - API response
   */
  async sendChatMessage(message) {
    return await this.request('POST', `/groups/${this.partyId}/chat`, {
      message
    });
  }

  /**
   * Update the party description
   * @param {string} description - New description text (supports Markdown)
   * @returns {Promise} - API response
   */
  async updatePartyDescription(description) {
    return await this.request('PUT', `/groups/${this.partyId}`, {
      description
    });
  }

  /**
   * Force-start a pending quest
   * @returns {Promise} - API response
   */
  async forceStartQuest() {
    return await this.request('POST', `/groups/${this.partyId}/quests/force-start`);
  }
}

// Export a single instance of the client
module.exports = new HabiticaClient();
