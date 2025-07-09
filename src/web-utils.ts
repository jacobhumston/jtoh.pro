import { Hono } from 'hono';
import { v4 } from 'uuid';
import { userIdToThumbnail, userIdToThumbnailFull, userIdToThumbnailBust, getRobloxAvatar3dAssets } from './roblox';
import { getLicenseReport } from './license-report';
import { parseRobloxAccountV2 } from './login-auth';
import { robloxAPICache } from './cache';

export default function webUtils(app: Hono) {
    app.get('/api/util/ping', async (context) => {
        let sanity = null;
        const providedSanity = context.req.query('sanity');
        if (providedSanity) {
            if (providedSanity.length > 0 && providedSanity.length < 11) {
                sanity = providedSanity;
            } else {
                sanity = 'Invalid sanity. (M:1::M:10)';
            }
        }
        return context.json({
            pong: true,
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            handle: context.req.path,
            sanity: {
                provided: sanity,
                value: sanity ? sanity.split('').reverse().join('') : null
            }
        });
    });

    app.get('/api/util/uuid', async (context) => {
        return context.json({ uuid: v4() });
    });

    app.get('/api/util/roblox-user/:user', async (context) => {
        if (await robloxAPICache.get(`user:${context.req.param('user')}`))
            return context.json((await robloxAPICache.get(`user:${context.req.param('user')}`)) as any);
        const user = await parseRobloxAccountV2(context.req.param('user'), context);
        if (!user) return context.json({ error: 'Invalid user.' }, 400);
        robloxAPICache.set(`user:${context.req.param('user')}`, user);
        return context.json(user);
    });

    app.get('/api/util/user-roblox-thumbnails/:userId', async (context) => {
        const userId = parseInt(context.req.param('userId'));
        if (isNaN(userId)) return context.json({ error: 'Invalid userId.' }, 400);
        return context.json({
            id: userId,
            headshot: await userIdToThumbnail(userId).catch(() => null),
            full: await userIdToThumbnailFull(userId).catch(() => null),
            bust: await userIdToThumbnailBust(userId).catch(() => null)
        });
    });

    app.get('/api/util/user-roblox-avatar-3d/:userId', async (context) => {
        const userId = parseInt(context.req.param('userId'));
        if (isNaN(userId)) return context.json({ error: 'Invalid userId.' }, 400);
        return context.json(Object.assign({ userId }, await getRobloxAvatar3dAssets(userId).catch(() => null)));
    });

    app.get('/api/admin/license-report', async (context) => {
        // @ts-ignore-next-line
        return context.json(await getLicenseReport());
    });

    app.get('/api/util/roblox-universe-thumbnail/:universeIds', async (context) => {
        if (await robloxAPICache.get(`universe-thumbnail:${context.req.param('universeIds')}`))
            return context.json(
                (await robloxAPICache.get(`universe-thumbnail:${context.req.param('universeIds')}`)) as any
            );

        const result = (await (
            await fetch(
                `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${context.req.param('universeIds')}&defaults=true&size=768x432&format=Png&isCircular=false`
            ).catch(() => ({ json: async () => ({}) }))
        ).json()) as any;

        if (!result.data) return context.json({ error: 'No data.' }, 400);

        const images: any = {};
        for (const image of result.data) {
            images[image.universeId] = image.thumbnails[0].imageUrl;
        }

        robloxAPICache.set(`universe-thumbnail:${context.req.param('universeIds')}`, { result: images });

        return context.json({ result: images });
    });

    app.get('/api/util/roblox-universe-thumbnail/multi/:universeId', async (context) => {
        const universeId = context.req.param('universeId');
        if (!universeId || isNaN(parseInt(universeId))) {
            return context.json({ error: 'Invalid universeId.' }, 400);
        }

        if (await robloxAPICache.get(`universe-thumbnails:${context.req.param('universeId')}`))
            return context.json(
                (await robloxAPICache.get(`universe-thumbnails:${context.req.param('universeId')}`)) as any
            );

        const result = (await (
            await fetch(
                `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${universeId}&defaults=true&size=768x432&format=Png&isCircular=false&countPerUniverse=1000`
            ).catch(() => ({ json: async () => ({}) }))
        ).json()) as any;

        if (!result.data) return context.json({ error: 'No data.' }, 400);

        const thumbnails: any = {};
        for (const image of result.data) {
            thumbnails[image.universeId] = image.thumbnails.map((thumbnail: any) => thumbnail.imageUrl).reverse();
        }

        robloxAPICache.set(`universe-thumbnails:${context.req.param('universeId')}`, { result: thumbnails });

        return context.json({ result: thumbnails });
    });

    /*
    app.get('/api/util/roblox-badges/:userId', async (context) => {
        const userId = parseInt(context.req.param('userId'));
        if (isNaN(userId)) return context.json({ error: 'Invalid userId.' }, 400);

        const user = await userIdToUser(userId);
        if (!user) return context.json({ error: 'User not found.' }, 404);

        const badges = (context.req.query('badges') ?? gameBadges.badges.map((badge) => badge.id).join(',')).split(',');
        for (const badge of badges) {
            if (isNaN(parseInt(badge))) return context.json({ error: 'Invalid badge provided.' }, 400);
        }

        if (badges.length > 10000)
            return context.json({ error: 'Only up to 10000 badges per request allowed.' }, 400) as any;

        const timestamp = Date.now();
        const result = await checkOwnedBadgesLarge(userId, badges);

        return context.json({
            userId,
            badges: result,
            count: {
                owned: result.filter((badge) => badge.owned).length,
                notOwned: result.filter((badge) => !badge.owned).length,
                total: result.length
            },
            time: (Date.now() - timestamp) / 1000
        });
    });
    */
}
