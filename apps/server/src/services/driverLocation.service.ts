import { ApiError } from "../utils/ApiError";
import { getRedisClient } from "../config/redis";

export interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  ts: number;
}

export interface DriverLocationFilters {
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  limit?: number;
}

export class DriverLocationService {
  private static readonly REDIS_KEY_PREFIX = "driver:location:";
  private static readonly TTL = 30; // 30 seconds (Redis uses seconds)
  private static useRedis = true;

  // Fallback in-memory store when Redis is unavailable
  private static drivers = new Map<string, DriverLocation>();
  private static cleanupInterval: NodeJS.Timeout;

  /**
   * Initialize cleanup interval for in-memory fallback
   */
  static initialize() {
    if (this.cleanupInterval) {
      return;
    }

    // Cleanup interval only for in-memory fallback
    this.cleanupInterval = setInterval(() => {
      if (!this.useRedis) {
        const now = Date.now();
        for (const [id, loc] of this.drivers.entries()) {
          if (now - loc.ts > this.TTL * 1000) {
            this.drivers.delete(id);
          }
        }
      }
    }, 15_000);
  }

  /**
   * Stop cleanup interval (for testing or shutdown)
   */
  static shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * Get Redis client or fallback to in-memory
   */
  private static async getClient() {
    try {
      const client = await getRedisClient();
      this.useRedis = true;
      return client;
    } catch (error) {
      console.warn("Redis unavailable, using in-memory storage for driver locations");
      this.useRedis = false;
      return null;
    }
  }

  /**
   * Validate coordinates
   */
  private static validateCoordinates(lat: number, lng: number): void {
    if (Math.abs(lat) > 90) {
      throw new ApiError(400, "Invalid latitude: must be between -90 and 90");
    }
    if (Math.abs(lng) > 180) {
      throw new ApiError(400, "Invalid longitude: must be between -180 and 180");
    }
  }

  /**
   * Update driver location
   */
  static async updateLocation(location: Omit<DriverLocation, "ts">): Promise<DriverLocation> {
    const { driverId, lat, lng, heading, speed } = location;

    if (!driverId?.trim()) {
      throw new ApiError(400, "driverId is required");
    }

    if (typeof lat !== "number" || typeof lng !== "number") {
      throw new ApiError(400, "lat and lng must be numbers");
    }

    this.validateCoordinates(lat, lng);

    const driverLocation: DriverLocation = {
      driverId: driverId.trim(),
      lat,
      lng,
      heading,
      speed,
      ts: Date.now(),
    };

    const redis = await this.getClient();

    if (redis) {
      // Store in Redis with TTL
      const key = `${this.REDIS_KEY_PREFIX}${driverId}`;
      await redis.setEx(key, this.TTL, JSON.stringify(driverLocation));
    } else {
      // Fallback to in-memory
      this.drivers.set(driverId, driverLocation);
    }

    return driverLocation;
  }

  /**
   * Get all active driver locations with optional filtering
   */
  static async getActiveDrivers(filters?: DriverLocationFilters): Promise<DriverLocation[]> {
    const redis = await this.getClient();
    let locations: DriverLocation[] = [];

    if (redis) {
      // Get all driver location keys from Redis
      const keys = await redis.keys(`${this.REDIS_KEY_PREFIX}*`);

      if (keys.length > 0) {
        const values = await redis.mGet(keys);
        locations = values
          .filter((val): val is string => val !== null)
          .map((val) => JSON.parse(val) as DriverLocation);
      }
    } else {
      // Fallback to in-memory
      locations = [...this.drivers.values()];
    }

    // Filter by geographic bounds if provided
    if (filters?.bounds) {
      const { north, south, east, west } = filters.bounds;
      locations = locations.filter(
        (loc) =>
          loc.lat <= north &&
          loc.lat >= south &&
          loc.lng <= east &&
          loc.lng >= west
      );
    }

    // Sort by most recent update
    locations.sort((a, b) => b.ts - a.ts);

    // Apply limit if specified
    if (filters?.limit && filters.limit > 0) {
      locations = locations.slice(0, filters.limit);
    }

    return locations;
  }

  /**
   * Get single driver location by ID
   */
  static async getDriverLocation(driverId: string): Promise<DriverLocation | null> {
    if (!driverId?.trim()) {
      throw new ApiError(400, "driverId is required");
    }

    const redis = await this.getClient();

    if (redis) {
      const key = `${this.REDIS_KEY_PREFIX}${driverId}`;
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } else {
      // Fallback to in-memory
      const location = this.drivers.get(driverId.trim());
      return location || null;
    }
  }

  /**
   * Remove driver location (e.g., when going offline)
   */
  static async removeDriver(driverId: string): Promise<boolean> {
    if (!driverId?.trim()) {
      throw new ApiError(400, "driverId is required");
    }

    const redis = await this.getClient();

    if (redis) {
      const key = `${this.REDIS_KEY_PREFIX}${driverId}`;
      const result = await redis.del(key);
      return result > 0;
    } else {
      // Fallback to in-memory
      return this.drivers.delete(driverId.trim());
    }
  }

  /**
   * Get count of active drivers
   */
  static async getActiveCount(): Promise<number> {
    const redis = await this.getClient();

    if (redis) {
      const keys = await redis.keys(`${this.REDIS_KEY_PREFIX}*`);
      return keys.length;
    } else {
      // Fallback to in-memory
      return this.drivers.size;
    }
  }

  /**
   * Clear all driver locations (for testing)
   */
  static async clearAll(): Promise<void> {
    const redis = await this.getClient();

    if (redis) {
      const keys = await redis.keys(`${this.REDIS_KEY_PREFIX}*`);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } else {
      // Fallback to in-memory
      this.drivers.clear();
    }
  }
}

// Initialize service on module load
DriverLocationService.initialize();
