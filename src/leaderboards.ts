import { Hono } from 'hono';
import { getOrderedDB, cardsRequestedDB, skillPointsDB } from './db';
import type { gameNames } from './shared/gamelist';
import { gameNamesArray } from './shared/gamelist';
import { verifyContext } from './captcha';
import { getSignedInRobloxUser } from './loginauth';

export default function serveLeaderboards(app: Hono) {
    app.get('/api/leaderboards/:type/:game', async (context) => {
        const includeJacob = context.req.query('includeJacob') === 'true';
        const game = context.req.param('game') as gameNames;

        const captchaError = await verifyContext(context);
        if (captchaError) return captchaError;

        let db = null;
        if (context.req.param('type') === 'card-requests') db = cardsRequestedDB;
        if (context.req.param('type') === 'skill-points') db = skillPointsDB;
        if (db === null) return context.json({ error: 'Invalid type.' }, 400) as any;

        let page = Math.max(1, parseInt(context.req.query('page') ?? '1') ?? 1);
        if (isNaN(page)) page = 1;
        if (page > 999999999999999) page = 1;

        if (!gameNamesArray.includes(game)) return context.json({ error: 'Invalid game.' }, 400) as any;

        const cardRequests = await getOrderedDB(db, game, includeJacob).catch(() => []);
        const start = (page - 1) * 100;

        const data: any = {
            result: cardRequests.slice(start, start + 100),
            page: page,
            total: {
                users: cardRequests.length,
                pages: Math.max(1, Math.ceil(cardRequests.length / 100))
            }
        };

        const me = await getSignedInRobloxUser(context);
        if (me) {
            const meIndex = cardRequests.findIndex((x) => x.user.id === me.id);
            if (meIndex !== -1) {
                data['me'] = cardRequests[meIndex];
            } else {
                data['me'] = null;
            }
        } else {
            data['me'] = null;
        }

        return context.json(data);
    });
}
