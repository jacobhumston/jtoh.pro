/**
 * This route handle's captcha requests.
 * It is important to note that captchas are validated in each
 * route that requires them individually.
 *
 * Authored by Jacob Humston
 */
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';

import { captchaSchema } from '../../shared/schemas/captcha';
import { errorSchema, rateLimitErrorSchema } from '../../shared/schemas/general';
import { createCaptcha, verifyCaptchaFromContext } from '../modules/captcha';

/** Route for the main endpoint. */
const route = createRoute({
    method: 'get',
    path: '/api/captcha',
    description: 'Get a captcha challenge.',
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
        'A utility endpoint to test captcha verification. Unlike other endpoints that require a captcha, this one does not error if the captcha fails.',
    request: {
        headers: z.object({ captcha: z.string().openapi({ description: 'The captcha solution.' }) })
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.object({
                        success: z.boolean().openapi({ description: 'Whether the captcha was successful or not.' })
                    })
                }
            },
            description: 'Captcha response.'
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
        return context.json({ success: await verifyCaptchaFromContext(context) }, 200);
    });
}
