/**
 * Simple ping utility route.
 *
 * Authored by Jacob Humston
 */
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import ping from 'ping';

import { errorSchema } from '../../shared/schemas/general';
import { pingSchema } from '../../shared/schemas/ping';

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
        500: {
            content: {
                'application/json': {
                    schema: errorSchema
                }
            },
            description: 'Internal server error.'
        }
    }
});

/** Handle fpr this endpoint. */
export async function handler(app: OpenAPIHono) {
    app.openapi(route, async (context) => {
        const cloudflare = (await ping.promise.probe('1.1.1.1', { extra: ['-c', '1'] })).time;
        const google = (await ping.promise.probe('8.8.8.8', { extra: ['-c', '1'] })).time;
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
