import { Hono } from 'hono';
import { getOrderedCardRequests } from './db';
import type { gameNames } from './gamelist';
import { gameNamesArray } from './gamelist';

export default function serveLeaderboards(app: Hono) {
    app.get('/ext/leaderboards/:game', async (context) => {
        const game = context.req.param('game') as gameNames;
        if (!gameNamesArray.includes(game)) return context.json({ error: 'Invalid game.' }, 400) as any;
        const cardRequests = await getOrderedCardRequests(game).catch(() => []);
        return context.json({ result: cardRequests.slice(0, 100) });
    });
}
