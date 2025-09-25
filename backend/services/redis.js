const redis = require('redis');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connect();
  }

  async connect() {
    try {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'redis',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.warn('⚠️ Redis connection failed, using in-memory cache:', error.message);
      this.useMemoryCache();
    }
  }

  useMemoryCache() {
    this.memoryCache = new Map();
    this.isConnected = false;
    console.log('Using in-memory cache fallback');
  }

  async set(key, value, ttl = 3600) {
    try {
      if (this.isConnected && this.client) {
        await this.client.setEx(key, ttl, JSON.stringify(value));
        return true;
      } else if (this.memoryCache) {
        this.memoryCache.set(key, {
          value,
          expiry: Date.now() + (ttl * 1000)
        });
        return true;
      }
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async get(key) {
    try {
      if (this.isConnected && this.client) {
        const result = await this.client.get(key);
        return result ? JSON.parse(result) : null;
      } else if (this.memoryCache) {
        const item = this.memoryCache.get(key);
        if (item && item.expiry > Date.now()) {
          return item.value;
        } else if (item) {
          this.memoryCache.delete(key);
        }
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async delete(key) {
    try {
      if (this.isConnected && this.client) {
        await this.client.del(key);
        return true;
      } else if (this.memoryCache) {
        this.memoryCache.delete(key);
        return true;
      }
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      if (this.isConnected && this.client) {
        const result = await this.client.exists(key);
        return result === 1;
      } else if (this.memoryCache) {
        const item = this.memoryCache.get(key);
        return item && item.expiry > Date.now();
      }
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async increment(key, value = 1) {
    try {
      if (this.isConnected && this.client) {
        return await this.client.incrBy(key, value);
      } else if (this.memoryCache) {
        const current = await this.get(key) || 0;
        const newValue = current + value;
        await this.set(key, newValue);
        return newValue;
      }
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  async getUserProgress(userId) {
    return await this.get(`user_progress:${userId}`) || {
      level: 1,
      xp: 0,
      completedCourses: [],
      achievements: [],
      learningStreak: 0
    };
  }

  async updateUserProgress(userId, progress) {
    return await this.set(`user_progress:${userId}`, progress, 86400); // 24 hours
  }

  async getUserSession(userId) {
    return await this.get(`user_session:${userId}`);
  }

  async setUserSession(userId, sessionData, ttl = 3600) {
    return await this.set(`user_session:${userId}`, sessionData, ttl);
  }

  async clearUserSession(userId) {
    return await this.delete(`user_session:${userId}`);
  }
}

module.exports = new RedisService();