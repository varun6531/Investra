/*
redis.js

What is this file for: Redis client wrapper that provides caching functionality for chat responses with automatic connection management and query normalization.

What the flow of the functions are: constructor() establishes Redis connection with error handling, get() retrieves cached responses using normalized query keys, set() stores responses with TTL, and normalizeQuery() standardizes queries for consistent caching.

How this service is used: Instantiated by the cache middleware to provide persistent caching layer that reduces duplicate LLM API calls and improves response times.
*/

const redis = require('redis');

redis_url = 'redis://localhost:6379'
redis_TTL = 600; // 10 min

class RedisCache {
  constructor() {
    this.client = redis.createClient({
      url: redis_url
    });
    this.TTL = redis_TTL;
    this.connected = false;
    this.connectionAttempted = false;
    

    this.client.on('error', (err) => {
      if (!this.connectionAttempted) {
        console.log('Redis instance not found, running without cache');
        this.connectionAttempted = true;
      }
      this.connected = false;
    });
    
    this.client.on('connect', () => {
      console.log('Redis connected');
      this.connected = true;
      this.connectionAttempted = true;
    });
    
    this.client.on('end', () => {
      if (this.connected) {
        console.log('Redis disconnected');
      }
      this.connected = false;
    });
    

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.connected = true;
    } catch (error) {
      this.connected = false;
      throw error;
    }
  }

  normalizeQuery(query) {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // no punctuation diff
      .replace(/\s+/g, ' ')    // same whitespace
      .trim();
  }

  generateKey(query, mode = 'advanced') {
    const normalized = this.normalizeQuery(query);
    return `chat:${normalized}:${mode}`;
  }

  async get(query, mode) {
    if (!this.connected) {
      return null;
    }
    try {
      const key = this.generateKey(query, mode);
      const cached = await this.client.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(query, mode, response) {
    if (!this.connected) {
      return;
    }
    try {
      const key = this.generateKey(query, mode);
      await this.client.setEx(key, this.TTL, JSON.stringify(response));
      console.log(`Cached response for key: ${key}`);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async clear() {
    try {
      await this.client.flushDb();
      console.log('Redis cache cleared');
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }

  async close() {
    try {
      await this.client.quit();
    } catch (error) {
      console.error('Redis close error:', error);
    }
  }
}

module.exports = RedisCache; 