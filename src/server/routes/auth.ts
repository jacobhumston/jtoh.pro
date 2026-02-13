/**
 * Auth routes that handle authentication.
 *
 * Authored by Jacob Humston
 */
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { errorSchema, rateLimitErrorSchema } from '@schemas/general';
import { serverURL } from '@server/config';
import { authenticateRoblox, getRobloxAuthConfig } from '@server/managers/auth';

//import { captchaMiddleware } from '@server/modules/captcha';

/** Route Roblox auth. */
const robloxAuthRoute = createRoute({
    method: 'get',
    path: '/api/auth/roblox',
    description: 'Authorize with Roblox via OAuth.',
    tags: ['Authentication'],
    //middleware: [captchaMiddleware],
    'x-badges': [
        {
            name: 'CAPTCHA REQUIRED',
            position: 'before'
        }
    ],
    responses: {
        302: {
            description: 'Client redirect.'
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

/** Handle for auth. */
export async function handler(app: OpenAPIHono) {
    const robloxAuth = getRobloxAuthConfig();
    const redirectUrl = `${serverURL}api/auth/roblox`;
    const robloxAuthUrl = robloxAuth.client.buildAuthorizationUrl(robloxAuth.config, {
        scope: 'openid profile',
        redirect_uri: redirectUrl
    });

    app.openapi(robloxAuthRoute, async (context) => {
        const tokens = await robloxAuth.client
            .authorizationCodeGrant(robloxAuth.config, new URL(context.req.url))
            .catch(() => null);
        if (!tokens) return context.redirect(robloxAuthUrl.href);

        const user = await robloxAuth.client
            .fetchProtectedResource(
                robloxAuth.config,
                tokens.access_token,
                new URL('https://apis.roblox.com/oauth/v1/userinfo'),
                'GET'
            )
            .catch(() => null);

        if (!user) return context.redirect(robloxAuthUrl.href);

        await authenticateRoblox(context, await user.json());

        return context.redirect(`/`);
    });
}
