type StoreEntry = {
  count: number;
  expiresAt: number;
};

export class RateLimiter {
  private store = new Map<string, StoreEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private windowMs: number, private maxRequests: number) {
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private key(identifier: string) {
    return `${identifier}:${Math.floor(Date.now() / this.windowMs)}`;
  }

  check(identifier: string): { allowed: boolean; remaining: number } {
    const k = this.key(identifier);
    const now = Date.now();

    const entry = this.store.get(k);
    if (!entry || now > entry.expiresAt) {
      this.store.set(k, { count: 1, expiresAt: now + this.windowMs });
      return { allowed: true, remaining: this.maxRequests - 1 };
    }

    if (entry.count >= this.maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    entry.count += 1;
    return { allowed: true, remaining: this.maxRequests - entry.count };
  }

  private cleanup() {
    const now = Date.now();
    for (const [k, v] of this.store.entries()) {
      if (now > v.expiresAt) {
        this.store.delete(k);
      }
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

export const phoneRateLimiter = new RateLimiter(60 * 60 * 1000, 3);
export const ipRateLimiter = new RateLimiter(60 * 60 * 1000, 10);
