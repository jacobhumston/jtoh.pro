/**
 * Simple ping utility route.
 *
 * Authored by Jacob Humston
 */
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import ping from 'ping';

import { errorSchema } from '../../shared/schemas/general';

/** Route for this endpoint. */
const route = createRoute({
    method: 'get',
    path: '/api/ping',
    description: 'Get the current ping of the server.',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z
                        .object({
                            cloudflare: z.number().openapi({ description: 'Ping (in ms) to cloudflare.' }),
                            google: z.number().openapi({ description: 'Ping (in ms) to google.' })
                        })
                        .openapi({ description: 'Ping Schema' })
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
        return context.json(
            {
                cloudflare: (await ping.promise.probe('1.1.1.1', { extra: ['-c', '1'] })).time,
                google: (await ping.promise.probe('8.8.8.8', { extra: ['-c', '1'] })).time
            },
            200
        );
    });
}
