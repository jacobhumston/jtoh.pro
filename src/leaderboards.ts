import { Hono } from 'hono';
import { getOrderedDB, cardsRequestedDB, skillPointsDB, towerCountDB } from './db';
import type { gameNames } from './shared/gamelist';
import { gameNamesArray } from './shared/gamelist';
import { verifyContext } from './captcha';
import { getSignedInRobloxUser, isSignedInAdmin } from './login-auth';
import { userIdToThumbnailBust } from './roblox';

export default function serveLeaderboards(app: Hono) {
    app.get('/api/leaderboards/:type/:game', async (context) => {
        const game = context.req.param('game') as gameNames;

        const captchaError = await verifyContext(context);
        if (captchaError) return captchaError;

        let db = null;
        if (context.req.param('type') === 'card-requests') db = cardsRequestedDB;
        if (context.req.param('type') === 'skill-points') db = skillPointsDB;
        if (context.req.param('type') === 'completed-towers') db = towerCountDB;
        if (db === null) return context.json({ error: 'Invalid type.' }, 400) as any;

        if (!(await isSignedInAdmin(context)) && context.req.param('type') === 'card-requests')
            return context.json({ error: 'You are not allowed to view this leaderboard.' }, 403) as any;

        let page = Math.max(1, parseInt(context.req.query('page') ?? '1') ?? 1);
        if (isNaN(page)) page = 1;
        if (page > 999999999999999) page = 1;

        if (!gameNamesArray.includes(game)) return context.json({ error: 'Invalid game.' }, 400) as any;

        const leaderboardData = await getOrderedDB(db, game).catch(() => []);
        const start = (page - 1) * 100;

        for (const data of leaderboardData) {
            if (data.rank < 4) {
                const result = await userIdToThumbnailBust(data.user.id).catch(() => null);
                if (result) data.user.thumbnail = result;
            }
        }

        const data: any = {
            result: leaderboardData.slice(start, start + 100),
            page: page,
            total: {
                users: leaderboardData.length,
                pages: Math.max(1, Math.ceil(leaderboardData.length / 100))
            }
        };

        const me = await getSignedInRobloxUser(context);
        if (me) {
            const meIndex = leaderboardData.findIndex((x) => x.user.id === me.id);
            if (meIndex !== -1) {
                data['me'] = leaderboardData[meIndex];
            } else {
                data['me'] = null;
            }
        } else {
            data['me'] = null;
        }

        return context.json(data);
    });
}
