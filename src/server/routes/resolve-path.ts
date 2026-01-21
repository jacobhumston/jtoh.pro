/**
 * This route is a helper for 404 pages, allowing the requester
 * to resolve possible pages to what they may be looking for.
 *
 * Authored by Jacob Humston
 */
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { search, sortKind } from 'fast-fuzzy';

import { errorSchema, rateLimitErrorSchema } from '@schemas/general';
import { getStaticPagesWebPaths } from '@server/managers/web';

/** Route for this endpoint. */
const route = createRoute({
    method: 'get',
    path: '/api/resolve-path',
    description: 'Resolve a path, useful for helping users find pages they mistyped.',
    tags: ['Utility'],
    request: {
        query: z.object({
            path: z.string().openapi({ description: 'The path to resolve.' })
        })
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.string().array()
                }
            },
            description:
                'Resolved paths, this may be an empty array. These results are returned in order of best match.'
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
        const { path } = context.req.query();
        const pages = getStaticPagesWebPaths(true).map((page) => page.replace('index', ''));
        return context.json(
            search(path, pages, {
                ignoreCase: true,
                sortBy: sortKind.bestMatch,
                useSellers: true,
                ignoreSymbols: true,
                threshold: 0.4
            }),
            200
        );
    });
}
