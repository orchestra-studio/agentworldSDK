import "server-only";
import { createLogger } from "./logger";

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export class RateLimiter {
  private config: RateLimitConfig;
  private logger = createLogger({ component: "RateLimiter" });

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async check(key: string): Promise<boolean> {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetAt) {
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + this.config.windowMs,
      });
      return true;
    }

    if (entry.count >= this.config.maxRequests) {
      this.logger.warn("Rate limit exceeded", { key });
      return false;
    }

    entry.count += 1;
    return true;
  }

  getRemaining(key: string): number {
    const entry = rateLimitStore.get(key);
    if (!entry) {
      return this.config.maxRequests;
    }
    return Math.max(0, this.config.maxRequests - entry.count);
  }
}

export const gatewayRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000,
});

export const instagramRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 60 * 1000,
});

