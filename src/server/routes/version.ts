/**
 * Simple route that exposes the current version.
 * The version is the git hash of the commit that the current local repo is on.
 *
 * Authored by Jacob Humston
 */
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { errorSchema, rateLimitErrorSchema, versionSchema } from '../../shared/schemas/general';
import { version } from '../config';

/** Route for this endpoint. */
const route = createRoute({
    method: 'get',
    path: '/api/version',
    description: 'Get the current version of jtoh.pro',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: versionSchema
                }
            },
            description: 'The current version.'
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
        return context.json({ version }, 200);
    });
}
