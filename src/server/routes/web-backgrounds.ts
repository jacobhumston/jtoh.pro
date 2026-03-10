/**
 * Simple route to get a random web background.
 *
 * Authored by Jacob Humston
 */
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';

import { errorSchema, rateLimitErrorSchema } from '@schemas/general';
import { getRandomWebBackground, getWebBackgrounds } from '@server/managers/web-backgrounds';

/** Route for this endpoint. */
const route = createRoute({
    method: 'get',
    path: '/api/backgrounds/random',
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

const route2 = createRoute({
    method: 'get',
    path: '/api/backgrounds',
    description: 'Get a list of web backgrounds.',
    tags: ['Utility'],
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z
                        .array(
                            z.object({
                                category: z.string().openapi({ description: 'Category of this web background.' }),
                                url: z.url().openapi({ description: 'URL of this web background.' }),
                                id: z.string().openapi({ description: 'ID of this web background.' })
                            })
                        )
                        .openapi({ description: 'Web backgrounds result.' })
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

const route3 = createRoute({
    method: 'get',
    path: '/api/backgrounds/random/url',
    description: 'Get a random web background url as a redirect.',
    tags: ['Utility'],
    request: {
        query: z.object({
            category: z.string().optional().openapi({ description: 'The category to get the web background from.' })
        })
    },
    responses: {
        307: {
            description: 'Redirect to a random web background.'
        },
        400: {
            content: {
                'application/json': {
                    schema: errorSchema
                }
            },
            description: 'Unable to redirect, likely due to the category being invalid.'
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

    app.openapi(route2, (context) => {
        const backgrounds = getWebBackgrounds();
        return context.json(backgrounds, 200);
    });

    app.openapi(route3, (context) => {
        const background = getRandomWebBackground(context.req.query('category'));
        if (!background)
            return context.json({ error: 'Unable to get a random background. Is that category valid?' }, 400);
        return context.redirect(background.url, 307);
    });
}
