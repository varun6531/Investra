/*
cache.js

What is this file for: Redis-based caching middleware that stores and retrieves chat responses to reduce API calls and improve performance.

What the flow of the functions are: cacheMiddleware() checks Redis for existing responses using query and mode as keys, returns cached data on hit, and stores new responses on miss before forwarding to next middleware.

How this service is used: Applied to chat endpoints in the Express server to cache identical queries and reduce load on the LLM service.
*/

const RedisCache = require('../services/redis');

let cache = null;


try {
  cache = new RedisCache();
} catch (error) {
  console.log('Redis not available, running without cache');
}

const cacheMiddleware = async (req, res, next) => {
  const { query, mode = 'advanced' } = req.body;
  
  if (!query) {
    return next();
  }
  

  if (!cache) {
    return next();
  }
  
  try {
    const cached = await cache.get(query, mode);
    if (cached) {
      console.log("Cache HIT for query");
      return res.json(cached);
    }
    
    console.log("Cache MISS for query");
    
    const originalJson = res.json;
    
    res.json = function(data) {
      if (data && !data.error) {
        cache.set(query, mode, data);
      }
      return originalJson.call(this, data);
    };
    
    next();
  } catch (error) {
    console.error('Cache middleware error:', error);
    next();
  }
};

module.exports = cacheMiddleware;

module.exports.cache = cache; 