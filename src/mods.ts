import { Hono } from 'hono';
import { getSignedInRobloxUser, isSignedInMod, parseRobloxAccountV2 } from './login-auth';
import fs from 'node:fs';
import { createLeadboardBlacklistFile, createModListFile, createUploadCardBackgroundsReviewQueueFile } from './files';
import { addModLogEntry, addPunishment, getModLog, getPunishments, removePunishment } from './punishments';
import { convert } from '@jacobhumston/tc.js';
import { punishmentTypes, type PunishmentType } from './shared/punishment-types';
import { accountConfigDB } from './db';
import { createS3Path, s3 } from './s3';

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
                leaderboardBlacklist: JSON.parse(fs.readFileSync(createLeadboardBlacklistFile(), 'utf-8'))
            }
        });
    });

    app.get('/api/mods/logs', async (context) => {
        const logs = getModLog();
        return context.json({ logs: logs.reverse() });
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
            reason: decodeURIComponent(reason),
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

        const response = await removePunishment(
            user.id,
            type as PunishmentType,
            mod.id,
            decodeURIComponent(reason)
        ).catch((error) => ({
            error: error.message
        }));
        if (response) return context.json({ error: response.error }, 400);
        return context.json({ success: true });
    });

    app.get('/api/mods/upload-card-background-queue', async (context) => {
        const queue: any[] = JSON.parse(fs.readFileSync(createUploadCardBackgroundsReviewQueueFile(), 'utf-8'));
        return context.json({ queue: queue });
    });

    app.post('/api/mods/upload-card-background-queue/approve/:id', async (context) => {
        const mod = await getSignedInRobloxUser(context);
        if (!mod) return context.json({ error: 'Unauthorized.' }, 401);

        const queue: any[] = JSON.parse(fs.readFileSync(createUploadCardBackgroundsReviewQueueFile(), 'utf-8'));
        const item = queue.find((i) => i.id === context.req.param('id'));

        if (!item) return context.json({ error: 'Item not found.' }, 404);

        fs.writeFileSync(
            createUploadCardBackgroundsReviewQueueFile(),
            JSON.stringify(queue.filter((i) => i.id !== item.id))
        );

        addModLogEntry({
            modId: mod.id.toString(),
            userId: item.uploaderId.toString(),
            action: `Approved card background upload: ${item.id} (${item.url})`,
            reason: 'N/A',
            timestamp: Date.now()
        });

        return context.json({ success: true, item: item });
    });

    app.post('/api/mods/upload-card-background-queue/remove/:id', async (context) => {
        const mod = await getSignedInRobloxUser(context);
        if (!mod) return context.json({ error: 'Unauthorized.' }, 401);

        const queue: any[] = JSON.parse(fs.readFileSync(createUploadCardBackgroundsReviewQueueFile(), 'utf-8'));
        const item = queue.find((i) => i.id === context.req.param('id'));

        if (!item) return context.json({ error: 'Item not found.' }, 404);

        const reason = context.req.query('reason');
        if (!reason || reason.length > 2000) {
            return context.json({ error: 'Invalid reason.' }, 400);
        }

        fs.writeFileSync(
            createUploadCardBackgroundsReviewQueueFile(),
            JSON.stringify(queue.filter((i) => i.id !== item.id))
        );

        const data = (await accountConfigDB.get(`_${item.uploaderId}`)) ?? {};

        if (data.cardBackground?.startsWith('c:')) {
            const id = data.cardBackground.slice(2);
            if (id === item.id) {
                const path = createS3Path(`card-photos/${id}.png`);
                await s3.delete(path);
                delete data.cardBackground;
                await accountConfigDB.set(`_${item.uploaderId}`, data);
            }
        }

        addModLogEntry({
            modId: mod.id.toString(),
            userId: item.uploaderId.toString(),
            action: `Removed card background upload: ${item.id} (${item.url})`,
            reason: decodeURIComponent(reason),
            timestamp: Date.now()
        });

        return context.json({ success: true, item: item });
    });

    app.get('/api/mods/get-uploads', async function (context) {
        const photos = await s3.list().catch(console.error);
        if (!photos) return context.json({ error: 'Something went wrong.' }, 500);
        return context.json({ uploads: photos.contents });
    });
}
