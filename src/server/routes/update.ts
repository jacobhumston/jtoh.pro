/**
 * Utility endpoint to update the client's cache.
 *
 * Authored by Jacob Humston
 */
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';

import { clientUpdateSchema, errorSchema, rateLimitErrorSchema } from '../../shared/schemas/general';
import { version } from '../config';

/** Route for this endpoint. */
const route = createRoute({
    method: 'get',
    path: '/api/update',
    description: "Update the client's browser cache, if needed.",
    request: {
        query: z.object({
            clientVersion: z.string().openapi({ description: "The current client's version." })
        })
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: clientUpdateSchema
                }
            },
            description: 'A response indicating whether the client needs updated or not.',
            headers: z.object({
                'clear-site-data': z.literal('"cache"').optional()
            })
        },
        400: {
            content: {
                'application/json': {
                    schema: errorSchema
                }
            },
            description: 'Invalid request error.'
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
    }
});

/** Handle for this endpoint. */
export async function handler(app: OpenAPIHono) {
    app.openapi(route, (context) => {
        const { clientVersion } = context.req.query();
        const update = !(clientVersion === version);
        if (update) context.res.headers.set('Clear-Site-Data', '"cache"');
        return context.json({ version, update }, 200);
    });
}
