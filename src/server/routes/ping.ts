/**
 * Simple ping utility route.
 *
 * Authored by Jacob Humston
 */
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import ping from 'ping';

import { errorSchema, rateLimitErrorSchema } from '../../shared/schemas/general';
import { pingSchema } from '../../shared/schemas/ping';
import rateLimitMiddleware from '../modules/ratelimits';

/** Route for this endpoint. */
const route = createRoute({
    method: 'get',
    path: '/api/ping',
    description: 'Get the current ping of the server.',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: pingSchema
                }
            },
            description: 'Ping results.'
        },
        429: {
            content: {
                'application/json': {
                    schema: rateLimitErrorSchema
                }
            },
            description: 'Rate limit error.'
        },
        500: {
            content: {
                'application/json': {
                    schema: errorSchema
                }
            },
            description: 'Internal server error.'
        }
    },
    middleware: rateLimitMiddleware({ pool: 3, reset: { seconds: 10 } })
});

/** Handle for this endpoint. */
export async function handler(app: OpenAPIHono) {
    app.openapi(route, async (context) => {
        // Run pings in parallel for better performance
        const [cloudflareResult, googleResult] = await Promise.all([
            ping.promise.probe('1.1.1.1', { extra: ['-c', '1'] }),
            ping.promise.probe('8.8.8.8', { extra: ['-c', '1'] })
        ]);
        const cloudflare = cloudflareResult.time;
        const google = googleResult.time;
        // @ts-expect-error
        if (google === 'unknown' || cloudflare === 'unknown')
            return context.json({ error: 'Failed to ping servers.' }, 500);
        return context.json(
            {
                cloudflare,
                google
            },
            200
        );
    });
}
