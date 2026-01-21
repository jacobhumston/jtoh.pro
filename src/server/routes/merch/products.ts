/**
 * These endpoints provide information about products
 * that we currently offer.
 *
 * Authored by Jacob Humston
 */
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';

import { errorSchema, rateLimitErrorSchema } from '@schemas/general';
//import { client } from '@server/apis/printful/api';
import { captchaMiddleware } from '@server/modules/captcha';
import { captchaHeaderSchema } from '@shared/schemas/captcha';

/** Route for this endpoint. */
const route = createRoute({
    method: 'get',
    path: '/api/merch/products',
    description: 'Get a list of products that we currently offer.',
    'x-scalar-stability': 'experimental',
    'x-badges': [
        {
            name: 'CAPTCHA REQUIRED',
            position: 'before'
        }
    ],
    tags: ['Merch'],
    middleware: captchaMiddleware,
    request: {
        headers: z.object({ captcha: captchaHeaderSchema })
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.any()
                }
            },
            description: 'List of available products.'
        },
        422: {
            content: {
                'application/json': {
                    schema: errorSchema
                }
            },
            description: 'Invalid captcha error.'
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
        //const products = await client.GET('/store/products');
        return context.json({}, 200);
    });
}
