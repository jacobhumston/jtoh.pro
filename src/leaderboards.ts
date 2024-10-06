import { Hono } from 'hono';
import { getOrderedCardRequests } from './db';
import type { gameNames } from './gamelist';
import { gameNamesArray } from './gamelist';

export default function serveLeaderboards(app: Hono) {
    app.get('/ext/leaderboards/card-requests/:game', async (context) => {
        const includeJacob = context.req.query('includeJacob') === 'true';
        const game = context.req.param('game') as gameNames;
        let page = Math.max(1, parseInt(context.req.query('page') ?? '1') ?? 1);
        if (isNaN(page)) page = 1;
        if (page > 999999999999999) page = 1;
        if (!gameNamesArray.includes(game)) return context.json({ error: 'Invalid game.' }, 400) as any;
        const cardRequests = await getOrderedCardRequests(game, includeJacob).catch(() => []);
        const start = (page - 1) * 100;
        return context.json({
            result: cardRequests.slice(start, start + 100),
            page: page,
            total: {
                users: cardRequests.length,
                pages: Math.max(1, Math.ceil(cardRequests.length / 100))
            }
        });
    });
}
