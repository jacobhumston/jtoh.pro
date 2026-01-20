/**
 * This route handle's captcha requests.
 * It is important to note that captchas are validated in each
 * route that requires them individually.
 *
 * Authored by Jacob Humston
 */
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';

import { captchaHeaderSchema, captchaSchema, captchaSkipSchema, captchaSuccessSchema } from '@schemas/captcha';
import { errorSchema, rateLimitErrorSchema } from '@schemas/general';
import { isDev } from '@server/config';
import { createCaptcha, isCaptchaBypassExpired, verifyCaptchaFromContext } from '@server/modules/captcha';

/** Route for the main endpoint. */
const route = createRoute({
    method: 'get',
    path: '/api/captcha',
    description: 'Get a captcha challenge.',
    tags: ['Security'],
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: captchaSchema
                }
            },
            description: 'The captcha challenge.'
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

/** Route for the test endpoint. */
const testRoute = createRoute({
    method: 'get',
    path: '/api/captcha/verify',
    description:
        'Verify a captcha. Unlike other endpoints that require a captcha, this one does not error if the captcha fails.',
    tags: ['Security'],
    request: {
        headers: z.object({ captcha: captchaHeaderSchema })
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: captchaSuccessSchema
                }
            },
            description: 'Captcha response.'
        },
        403: {
            content: {
                'application/json': {
                    schema: errorSchema
                }
            },
            description: 'Forbidden error.'
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

/** Route for the test endpoint. */
const bypassCheckRoute = createRoute({
    method: 'get',
    path: '/api/captcha/skip',
    description: 'Returns a result indicating if the client is allowed to skip the captcha challenge.',
    tags: ['Security'],
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: captchaSkipSchema
                }
            },
            description: 'Captcha skip response.'
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

/** Handle for these endpoints. */
export async function handler(app: OpenAPIHono) {
    app.openapi(route, async (context) => {
        return context.json(await createCaptcha(), 200);
    });

    app.openapi(testRoute, async (context) => {
        if (!isDev) return context.json({ error: 'This endpoint is disabled.' }, 403);
        return context.json({ success: await verifyCaptchaFromContext(context) }, 200);
    });

    app.openapi(bypassCheckRoute, async (context) => {
        return context.json({ success: (await isCaptchaBypassExpired(context)) === false }, 200);
    });
}
