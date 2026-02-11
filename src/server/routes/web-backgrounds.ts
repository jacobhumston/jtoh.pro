/**
 * Simple route to get a random web background.
 *
 * Authored by Jacob Humston
 */
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';

import { errorSchema, rateLimitErrorSchema } from '@schemas/general';

import { getRandomWebBackground } from '../managers/web-backgrounds';

/** Route for this endpoint. */
const route = createRoute({
    method: 'get',
    path: '/api/random/background',
    description: 'Get a random web background.',
    tags: ['Utility'],
    request: {
        query: z.object({
            category: z.string().optional().openapi({ description: 'The category to get the web background from.' })
        })
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z
                        .object({
                            url: z.string().nullable().openapi({
                                description: 'URL of the random background. Can be null if the category was invalid.'
                            })
                        })
                        .openapi({ description: 'Random web background result.' })
                }
            },
            description: 'A random web background result.'
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
        return context.json({ url: getRandomWebBackground(context.req.query('category'))?.url ?? null }, 200);
    });
}
