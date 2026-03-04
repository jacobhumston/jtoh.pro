/**
 * This manager exports an extended version of the database client for cache use.
 *
 * Authored by Jacob Humston
 */
import { nanoHash } from '@alwatr/hash-string';
import { convertTo, type AvailableConversions } from '@jacobhumston/tc.js';

import { DatabaseClient } from '@server/managers/database';
import { createTask } from '@server/managers/tasks';

/** Array of caches, indexed by their namespaces. Used by the sweeper. */
const caches: Record<string, Cache> = {};

/** Represents cached data. */
export type CacheType<T> = { data: T; expires?: number };

/** Class to interact with the cache database. */
export class Cache<Q = unknown> extends DatabaseClient<Q> {
    /**
     * Create a new cache.
     * @param namespace The namespace for this cache.
     */
    constructor(namespace: string) {
        super('cache', namespace);

        // Its okay to override past caches because all we really need is the sweeper to be able to access
        // every namespace, and this is the simplest setup to do so while avoiding custom SQL queries
        caches[namespace] = this;
    }

    /**
     * Get an item in the cache.
     * @param key The key to retrieve.
     * @returns The value or null if not found or expired.
     */
    async get<T = Q>(key: string): Promise<T | null> {
        const result = await super.get<CacheType<T>>(key);
        if (result) return result.expires ? (Date.now() > result.expires ? null : result.data) : result.data;
        else return null;
    }

    /**
     * Get multiple items in the cache.
     * @param keys List of items to get.
     * @returns Key-value pairs of results, where value can be null if the key is expired or doesn't exist.
     */
    async getMultiple<T = Q>(keys: string[]): Promise<Record<string, T | null>> {
        const result = await super.getMultiple<CacheType<T>>(keys);
        const parsedResults: Record<string, T | null> = {};
        for (const [key, value] of Object.entries(result)) {
            if (value === null) {
                parsedResults[key] = null;
            } else if (value.expires) {
                if (Date.now() < value.expires) parsedResults[key] = value.data;
                else parsedResults[key] = null;
            } else {
                parsedResults[key] = value.data;
            }
        }
        return parsedResults;
    }

    /**
     * Set an item's value in the cache.
     * @param key The key to set.
     * @param value The value to store.
     * @param expires An optional expiration time.
     * @param keepOldExpired If true, the perviously set expiration date on this key will be used if one is present.
     */
    async set<T = Q>(key: string, value: T, expires?: AvailableConversions, keepOldExpired?: boolean): Promise<void> {
        let previousExpired = null;
        if (keepOldExpired === true) {
            const expires = await this.expires(key);
            if (expires instanceof Date && Date.now() < expires.getTime()) {
                previousExpired = expires.getTime();
            }
        }
        await super.set<CacheType<T>>(key, {
            data: value,
            expires: previousExpired ?? (expires ? Date.now() + convertTo(expires, 'milliseconds') : undefined)
        });
    }

    /**
     * Get all cache items.
     * @returns Cache items that have not expired.
     */
    async all<T = Q>(): Promise<Record<string, T>> {
        const result = await super.all<CacheType<T>>();
        const parsedResults: Record<string, T> = {};
        for (const [key, value] of Object.entries(result)) {
            if (value.expires) {
                if (Date.now() < value.expires) parsedResults[key] = value.data;
            } else {
                parsedResults[key] = value.data;
            }
        }
        return parsedResults;
    }

    /**
     * Check if an item in the cache exits or has expired.
     * @param key Cache item to check.
     * @returns Whether the item has expired or not.
     */
    async exists(key: string): Promise<boolean> {
        const data = await this.get(key);
        return data !== null;
    }

    /**
     * Get the expiration date of a cached item.
     * Note that expired dates can be returned if requested before the expired item is removed.
     * You can also use {@linkcode Cache.exists} to check if an item is expire or does not exist.
     * @param key The cache item to get the expiration of.
     * @returns The expiration date for this item. (Or "never" if it doesn't have an expiration.)
     */
    async expires<T = Q>(key: string): Promise<Date | undefined | 'never'> {
        const result = await super.get<CacheType<T>>(key);
        if (result === null) return undefined;
        if (result.expires === undefined) return 'never';
        return new Date(result.expires);
    }

    /**
     * Get all items in this cache, even if they have expired.
     * Note that this function will not be able to retrieve expired items that have already been deleted.
     * @returns All items, including expired items that have not been deleted yet.
     */
    async rawAll<T = Q>() {
        return super.all<CacheType<T>>();
    }
}

// Create the cache sweeper
createTask(`Cache Sweeper`, 'Sweeps caches every 5 minutes.', { minutes: 5 }, async function () {
    for (const cache of Object.values(caches)) {
        const result = await cache.rawAll();
        for (const [key, value] of Object.entries(result)) {
            if (value.expires) {
                if (Date.now() > value.expires) await cache.delete(key);
            }
        }
    }
});

/**
 * Create a cache wrapper around a method.
 * This should only be used for async methods that return json data, such as api calls.
 * @param namespace The namespace for this cache.
 * @param method The method to cache.
 * @param expires Expiration time for this cache.
 * @returns A wrapper around the provided method that enables caching.
 */
export function cacheMethod<F extends (...args: unknown[]) => unknown>(
    namespace: string,
    method: F,
    expires?: AvailableConversions
) {
    const cache = new Cache<ReturnType<F>>(namespace);
    return async function (...args: Parameters<F>): Promise<Awaited<ReturnType<F>>> {
        const key = nanoHash(JSON.stringify(args), 'cache');
        const cached = await cache.get(key);
        if (cached !== null) return cached;
        const result = await method(...args);
        if (result !== null && result !== undefined) await cache.set(key, result, expires);
        return result as Awaited<ReturnType<F>>;
    };
}
