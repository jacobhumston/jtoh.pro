/**
 * This route handle's captcha requests.
 * It is important to note that captchas are validated in each
 * route that requires them individually.
 *
 * Authored by Jacob Humston
 */
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { captchaSchema } from '../../shared/schemas/captcha';
import { errorSchema, rateLimitErrorSchema } from '../../shared/schemas/general';
import { createCaptcha } from '../modules/captcha';

/** Route for this endpoint. */
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

/** Handle for this endpoint. */
export async function handler(app: OpenAPIHono) {
    app.openapi(route, async (context) => {
        return context.json(await createCaptcha(), 200);
    });
}
