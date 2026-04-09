/**
 * Routes related to Roblox limiteds.
 *
 * Authored by Jacob Humston
 */
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';

import { captchaHeaderSchema } from '@schemas/captcha';
import { errorSchema, rateLimitErrorSchema } from '@schemas/general';
import { robloxLimitedSchema, type RobloxLimitedSchema } from '@schemas/roblox';
import { serverURL } from '@server/config';
import { getAuthenticatedRobloxUser } from '@server/managers/auth';
import { Cache } from '@server/managers/cache';
import { captchaMiddleware } from '@server/modules/captcha';
import rateLimitMiddleware from '@server/modules/ratelimits';
import { getAssetThumbnails } from '@server/modules/roblox';

const limitedCache = new Cache<Array<RobloxLimitedSchema>>('roblox-limiteds');

/** Route for this endpoint. */
const route = createRoute({
    method: 'get',
    path: '/api/roblox-limiteds',
    description: 'Get a list of limiteds created by Roblox. (Via api.rolimons.com)',
    tags: ['Utility'],
    'x-badges': [
        {
            name: 'CAPTCHA REQUIRED',
            position: 'before'
        }
    ],
    request: {
        headers: z.object({ captcha: captchaHeaderSchema })
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.array(robloxLimitedSchema)
                }
            },
            description: 'Roblox limited results.'
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
    },
    middleware: [rateLimitMiddleware({ pool: 5, reset: { seconds: 10 } }), captchaMiddleware]
});

const route2 = createRoute({
    method: 'get',
    path: '/api/my-roblox-limiteds',
    description: 'Get a list of your collection of limiteds created by Roblox. (Via api.rolimons.com)',
    tags: ['Utility'],
    'x-badges': [
        {
            name: 'CAPTCHA REQUIRED',
            position: 'before'
        }
    ],
    request: {
        headers: z.object({ captcha: captchaHeaderSchema })
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.record(z.string(), z.number()).openapi('UserOwnedRobloxLimitedsSchema')
                }
            },
            description: 'User owned Roblox limited results.'
        },
        401: {
            content: {
                'application/json': {
                    schema: errorSchema
                }
            },
            description: 'User is not logged in.'
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
    },
    middleware: [rateLimitMiddleware({ pool: 5, reset: { seconds: 10 } }), captchaMiddleware]
});

/** Handle for this endpoint. */
export async function handler(app: OpenAPIHono) {
    app.openapi(route, async (context) => {
        const exists = await limitedCache.exists('limiteds');

        if (exists) {
            const data = await limitedCache.get('limiteds');
            return context.json(data ?? [], 200);
        }

        const data = (await fetch('https://api.rolimons.com/items/v2/itemdetails')
            .then((res) => res.json())
            .catch(() => null)) as {
            success: boolean;
            items: Record<string, [string, string, number, number]>;
        } | null;

        if (data && data.success) {
            const ids = Object.keys(data.items);
            const imgs = await getAssetThumbnails(ids.map((m) => Number(m)));

            const items: Array<RobloxLimitedSchema> = [];
            for (const [id, limited] of Object.entries(data.items)) {
                items.push({
                    id,
                    name: limited[0],
                    rap: limited[2],
                    value: limited[3] === -1 ? null : limited[3],
                    picture: imgs[Number(id)] ?? `${serverURL}assets/rolimons.png`
                });
            }
            await limitedCache.set('limiteds', items, { hours: 1 });
            return context.json(items, 200);
        }

        return context.json({ error: 'Something went wrong.' }, 500);
    });

    app.openapi(route2, async (context) => {
        const user = await getAuthenticatedRobloxUser(context);
        if (!user) return context.json({ error: 'User is not logged in.' }, 401);

        const exists = await limitedCache.exists(`limiteds_${user.id}`);

        if (exists) {
            const data = await limitedCache.get<Record<string, number>>(`limiteds_${user.id}`);
            return context.json(data ?? {}, 200);
        }

        const data = (await fetch(`https://api.rolimons.com/players/v1/playerassets/${user.id}`)
            .then((res) => res.json())
            .catch(() => null)) as {
            success: boolean;
            playerAssets: Record<string, Array<number>>;
        } | null;

        if (data && data.success) {
            const items: Record<string, number> = {};
            for (const [key, value] of Object.entries(data.playerAssets)) {
                items[key] = value.length;
            }
            await limitedCache.set(`limiteds_${user.id}`, items, { minutes: 5 });
            return context.json(items, 200);
        }

        return context.json({ error: 'Something went wrong.' }, 500);
    });
}
