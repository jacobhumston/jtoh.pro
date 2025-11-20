/**
 * This route includes multiple endpoints that handle card backgrounds.
 * That includes handling uploaded backgrounds and pre-made ones.
 *
 * Authored by Jacob Humston
 */
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';

import { cardBackgroundSchema } from '../../shared/schemas/cards';
import { errorSchema, rateLimitErrorSchema } from '../../shared/schemas/general';
import { getCardBackgrounds } from '../managers/card-backgrounds';

const getCardBackgroundsRoute = createRoute({
    method: 'get',
    path: '/api/cards/backgrounds',
    description: 'Get available card backgrounds.',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.array(cardBackgroundSchema)
                }
            },
            description: 'List of card backgrounds.'
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

/** Handler for these endpoints. */
export async function handler(app: OpenAPIHono) {
    // Get card backgrounds (not custom)
    app.openapi(getCardBackgroundsRoute, (context) => {
        return context.json(getCardBackgrounds(), 200);
    });
}
