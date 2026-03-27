const NodeCache = require('node-cache');
const redis = require('redis');
const { logger } = require('./errorHandler');

// Memory cache for development/fallback
const memoryCache = new NodeCache({
  stdTTL: 3600, // 1 hour default TTL
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: false
});

// Redis client for production
let redisClient = null;

// Initialize Redis if available
const initializeRedis = async () => {
  try {
    if (process.env.REDIS_URL) {
      redisClient = redis.createClient({
        url: process.env.REDIS_URL,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.error('Redis server connection refused');
            return new Error('Redis server connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            logger.error('Redis retry time exhausted');
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            logger.error('Redis max retry attempts reached');
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      redisClient.on('error', (err) => {
        logger.error('Redis Client Error:', err);
      });

      redisClient.on('connect', () => {
        logger.info('Redis Client Connected');
      });

      await redisClient.connect();
      return true;
    }
  } catch (error) {
    logger.warn('Redis initialization failed, using memory cache:', error.message);
    return false;
  }
  return false;
};

// Cache middleware factory
const cacheMiddleware = (options = {}) => {
  const {
    ttl = 3600, // Time to live in seconds
    keyGenerator = null, // Custom key generator function
    condition = () => true, // Condition to cache (default: always cache)
    skipCache = false // Skip caching
  } = options;

  return async (req, res, next) => {
    if (skipCache || !condition(req)) {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator 
      ? keyGenerator(req)
      : `${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;

    try {
      // Try to get from Redis first
      let cachedData = null;
      
      if (redisClient && redisClient.isOpen) {
        cachedData = await redisClient.get(cacheKey);
      }

      // Fallback to memory cache
      if (!cachedData) {
        cachedData = memoryCache.get(cacheKey);
      }

      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        logger.debug(`Cache hit for key: ${cacheKey}`);
        return res.json(parsedData);
      }

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data) {
        // Cache the response
        const dataToCache = JSON.stringify(data);
        
        if (redisClient && redisClient.isOpen) {
          redisClient.setEx(cacheKey, ttl, dataToCache).catch(err => {
            logger.error('Redis cache set error:', err);
          });
        }
        
        // Also cache in memory as fallback
        memoryCache.set(cacheKey, dataToCache, ttl);
        
        logger.debug(`Cache set for key: ${cacheKey}`);
        
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next(); // Continue without caching if there's an error
    }
  };
};

// Cache invalidation
const invalidateCache = async (pattern) => {
  try {
    if (redisClient && redisClient.isOpen) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.info(`Invalidated ${keys.length} Redis cache keys matching pattern: ${pattern}`);
      }
    }

    // Invalidate memory cache
    const memoryKeys = memoryCache.keys();
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const keysToDelete = memoryKeys.filter(key => regex.test(key));
    
    keysToDelete.forEach(key => {
      memoryCache.del(key);
    });
    
    if (keysToDelete.length > 0) {
      logger.info(`Invalidated ${keysToDelete.length} memory cache keys matching pattern: ${pattern}`);
    }
  } catch (error) {
    logger.error('Cache invalidation error:', error);
  }
};

// Cache warming
const warmCache = async (data) => {
  try {
    for (const item of data) {
      const { key, value, ttl = 3600 } = item;
      
      if (redisClient && redisClient.isOpen) {
        await redisClient.setEx(key, ttl, JSON.stringify(value));
      }
      
      memoryCache.set(key, JSON.stringify(value), ttl);
    }
    
    logger.info(`Warmed cache with ${data.length} items`);
  } catch (error) {
    logger.error('Cache warming error:', error);
  }
};

// Cache statistics
const getCacheStats = async () => {
  const stats = {
    memory: {
      keys: memoryCache.keys().length,
      stats: memoryCache.getStats()
    },
    redis: null
  };

  try {
    if (redisClient && redisClient.isOpen) {
      const info = await redisClient.info('memory');
      const keyspace = await redisClient.info('keyspace');
      
      stats.redis = {
        connected: true,
        memory: info,
        keyspace: keyspace
      };
    } else {
      stats.redis = {
        connected: false
      };
    }
  } catch (error) {
    stats.redis = {
      connected: false,
      error: error.message
    };
  }

  return stats;
};

// Predefined cache middleware for common use cases
const cacheMiddleware = {
  // Cache user data
  userData: cacheMiddleware({
    ttl: 1800, // 30 minutes
    keyGenerator: (req) => {
      if (req.user && req.user.id) {
        return `user:${req.user.id}:${req.originalUrl}`;
      }
      return `anonymous:${req.originalUrl}`;
    }
  }),

  // Cache exam data
  examData: cacheMiddleware({
    ttl: 3600, // 1 hour
    keyGenerator: (req) => `exam:${req.params.examId || 'list'}:${JSON.stringify(req.query)}`
  }),

  // Cache dashboard data
  dashboardData: cacheMiddleware({
    ttl: 300, // 5 minutes
    keyGenerator: (req) => `dashboard:${req.user?.id || 'anonymous'}:${req.originalUrl}`,
    condition: (req) => req.user && req.user.role
  }),

  // Cache question bank data
  questionBankData: cacheMiddleware({
    ttl: 7200, // 2 hours
    keyGenerator: (req) => `questions:${JSON.stringify(req.query)}`
  }),

  // Cache analytics data
  analyticsData: cacheMiddleware({
    ttl: 1800, // 30 minutes
    keyGenerator: (req) => `analytics:${req.user?.id}:${req.originalUrl}`,
    condition: (req) => req.user && ['admin', 'teacher'].includes(req.user.role)
  })
};

// Initialize Redis on module load
initializeRedis();

module.exports = {
  cacheMiddleware,
  invalidateCache,
  warmCache,
  getCacheStats,
  memoryCache,
  redisClient
};
