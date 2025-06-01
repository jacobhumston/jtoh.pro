import { Hono } from 'hono';
import { getSignedInRobloxUser, isSignedInMod, parseRobloxAccountV2 } from './login-auth';
import fs from 'node:fs';
import { createModListFile } from './files';
import {
    addPunishment,
    getModLog,
    getPunishments,
    punishmentTypes,
    removePunishment,
    type PunishmentType
} from './punishments';
import { convert } from '@jacobhumston/tc.js';

export function mods(app: Hono) {
    app.use('/app/mods/*', async (context, next) => {
        if (await isSignedInMod(context)) {
            return await next();
        } else {
            return context.json({ error: 'Unauthorized.' }, 401);
        }
    }).use('/api/mods/*', async (context, next) => {
        if (await isSignedInMod(context)) {
            return await next();
        } else {
            return context.json({ error: 'Unauthorized.' }, 401);
        }
    });

    app.get('/api/mods/lists', async (context) => {
        return context.json({
            lists: {
                mods: JSON.parse(fs.readFileSync(createModListFile(), 'utf-8')),
                leaderboardBlacklist: JSON.parse(fs.readFileSync(createModListFile(), 'utf-8'))
            }
        });
    });

    app.get('/api/mods/logs', async (context) => {
        const logs = getModLog();
        return context.json({ logs: logs });
    });

    app.get('/api/mods/punishments/:user', async (context) => {
        const user = await parseRobloxAccountV2(context.req.param('user'), context);
        if (!user) return context.json({ error: 'Invalid user.' }, 400);

        const punishments = await getPunishments(user.id);
        return context.json({ punishments: punishments });
    });

    app.post('/api/mods/punish/:user', async (context) => {
        const user = await parseRobloxAccountV2(context.req.param('user'), context);
        if (!user) return context.json({ error: 'Invalid user.' }, 400);

        const mod = await getSignedInRobloxUser(context);
        if (!mod) return context.json({ error: 'Unauthorized.' }, 401);

        const type = context.req.query('type');
        const reason = context.req.query('reason');
        let expires: any = context.req.query('expires');

        if (!type || !reason) {
            return context.json({ error: 'Missing type or reason.' }, 400);
        }

        if (!punishmentTypes.includes(type)) return context.json({ error: 'Invalid punishment type.' }, 400);

        if (reason.length > 2000) return context.json({ error: 'Reason is too long.' }, 400);

        if (expires && !isNaN(Number(expires))) {
            const time = convert({ days: expires });
            if (time.milliseconds < 0) {
                return context.json({ error: 'Invalid expiration time.' }, 400);
            }
            expires = Date.now() + time.milliseconds;
        } else {
            expires = null;
        }

        const response = await addPunishment(user.id, {
            type: type as PunishmentType,
            reason: reason,
            modId: mod.id.toString(),
            expires: expires
        }).catch((error) => ({ error: error.message }));

        if (response) return context.json({ error: response.error }, 400);
        return context.json({ success: true });
    });

    app.post('/api/mods/remove-punishment/:user', async (context) => {
        const user = await parseRobloxAccountV2(context.req.param('user'), context);
        if (!user) return context.json({ error: 'Invalid user.' }, 400);

        const mod = await getSignedInRobloxUser(context);
        if (!mod) return context.json({ error: 'Unauthorized.' }, 401);

        const type = context.req.query('type');
        const reason = context.req.query('reason');
        if (!type || !reason) {
            return context.json({ error: 'Missing type or reason.' }, 400);
        }
        if (!punishmentTypes.includes(type)) return context.json({ error: 'Invalid punishment type.' }, 400);
        if (reason.length > 2000) return context.json({ error: 'Reason is too long.' }, 400);

        const response = await removePunishment(user.id, type as PunishmentType, mod.id, reason).catch((error) => ({
            error: error.message
        }));
        if (response) return context.json({ error: response.error }, 400);
        return context.json({ success: true });
    });
}
