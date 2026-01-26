/**
 * This module exposes a middleware that can be used to handle rate limits.
 *
 * Authored by Jacob Humston
 */
import type { AvailableConversions } from '@jacobhumston/tc.js';
import { createMiddleware } from 'hono/factory';

import { Cache } from '@server/managers/cache';
import { getIPFromContext } from '@server/modules/ip';
import { getSessionToken } from '@server/modules/secrets';

const cache = new Cache<{ used: number }>('rate-limits');

/**
 * Create a rate limit middleware with specific options.
 * @param options Options for this rate limit middleware.
 * @returns The rate limit middleware.
 */
export default function rateLimitMiddleware(options: {
    /** The amount of requests that can be made in the reset time. */
    pool: number;
    /** The amount of time it takes for the pool to reset. */
    reset: AvailableConversions;
    /** Should the rate limit be path path based? Default is `true`. */
    prefixPath?: boolean;
    /** Add a custom prefix for this rate limit. */
    customPrefix?: string;
}) {
    return createMiddleware(async (context, next) => {
        if (context.req.header('ratelimit-bypass') === getSessionToken('ratelimit-bypass')) return await next();
        if (options.prefixPath === undefined) options.prefixPath = true;
        const ip = getIPFromContext(context);
        const key = btoa(`${options.customPrefix ?? ''}${options.prefixPath ? context.req.path + '/' : ''}${ip}`);
        const data = (await cache.get(key)) ?? { used: 0 };
        if (data.used >= options.pool) {
            return context.json({ error: 'Rate limit exceeded.', reset: await cache.expires(key) }, 429);
        } else {
            await cache.set(key, { used: data.used + 1 }, options.reset, true);
            return await next();
        }
    });
}
