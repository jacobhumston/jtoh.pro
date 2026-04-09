/**
 * Cache for the client.
 *
 * Authored by Jacob Humston
 */
import { CacheManager } from 'browser-cache-ttl';

/** Client cache. */
export const cache = new CacheManager();
export default cache;
