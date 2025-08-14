import { convert, type AvailableConversions } from '@jacobhumston/tc.js';
import { rateLimiter, type Promisify } from 'hono-rate-limiter';
import { getIP } from './ip';
import { getTempToken } from './temp-tokens';
import type { Context } from 'hono';

/**
 * Create a middleware for rate limiting and pray that this shit works.
 */
export function createRateLimitMiddleware(
    window: AvailableConversions,
    maxRequests: number,
    skipFun?: (c: Context) => Promisify<boolean>
) {
    return rateLimiter({
        windowMs: convert(window).milliseconds,
        limit: maxRequests,
        standardHeaders: 'draft-6',
        keyGenerator: (context) => {
            return `${getIP(context)}::${context.req.path}`;
        },
        handler: async (context) => {
            return context.json({ error: 'Rate limit exceeded. Please wait and try again.' }, 429) as any;
        },
        skip: async (context) => {
            if (skipFun) {
                const result = await skipFun(context);
                if (result === true) return true;
            }
            return (context.req.query('rlb-token') ?? '') === getTempToken('rlb-token');
        }
    });
}
