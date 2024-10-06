import { Hono } from 'hono';
import { v4 } from 'uuid';
import { userIdToThumbnail, userIdToThumbnailFull, userIdToThumbnailBust } from './roblox';

export default function webUtils(app: Hono) {
    app.get('/ext/util/ping', async (context) => {
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

    app.get('/ext/util/uuid', async (context) => {
        return context.json({ uuid: v4() });
    });

    app.get('/ext/util/user-roblox-thumbnails/:userId', async (context) => {
        const userId = parseInt(context.req.param('userId'));
        if (isNaN(userId)) return context.json({ error: 'Invalid userId.' }, 400);
        return context.json({
            id: userId,
            headshot: await userIdToThumbnail(userId).catch(() => null),
            full: await userIdToThumbnailFull(userId).catch(() => null),
            bust: await userIdToThumbnailBust(userId).catch(() => null)
        });
    });
}
