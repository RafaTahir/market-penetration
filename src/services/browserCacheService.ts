export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class BrowserCacheService {
  private static instance: BrowserCacheService;
  private memoryCache: Map<string, CachedData<any>> = new Map();

  public static getInstance(): BrowserCacheService {
    if (!BrowserCacheService.instance) {
      BrowserCacheService.instance = new BrowserCacheService();
    }
    return BrowserCacheService.instance;
  }

  set<T>(key: string, data: T, ttlMs: number = 300000): void {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMs
    };

    this.memoryCache.set(key, cached);

    try {
      localStorage.setItem(key, JSON.stringify(cached));
    } catch (error) {
      console.warn('Failed to cache to localStorage:', error);
    }
  }

  get<T>(key: string, maxAgeMs?: number): T | null {
    let cached = this.memoryCache.get(key);

    if (!cached) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          cached = JSON.parse(stored);
          if (cached) {
            this.memoryCache.set(key, cached);
          }
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
      }
    }

    if (!cached) {
      return null;
    }

    const now = Date.now();
    const age = now - cached.timestamp;

    if (maxAgeMs && age > maxAgeMs) {
      return null;
    }

    if (now > cached.expiresAt) {
      this.delete(key);
      return null;
    }

    return cached.data as T;
  }

  getStale<T>(key: string): { data: T; age: number } | null {
    let cached = this.memoryCache.get(key);

    if (!cached) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          cached = JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
      }
    }

    if (!cached) {
      return null;
    }

    const age = Date.now() - cached.timestamp;
    return {
      data: cached.data as T,
      age
    };
  }

  delete(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  clear(): void {
    this.memoryCache.clear();
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('market_') || key.startsWith('economic_') || key.startsWith('currency_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  getAge(key: string): number {
    const cached = this.memoryCache.get(key) || (() => {
      try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    })();

    if (!cached) {
      return -1;
    }

    return Date.now() - cached.timestamp;
  }

  isFresh(key: string, maxAgeMs: number): boolean {
    const age = this.getAge(key);
    return age >= 0 && age < maxAgeMs;
  }
}
