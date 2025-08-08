import { getCardImages } from './card-images';
import { accountConfigDB, loginAuthDB } from './db';
import { getSignedInRobloxUser } from './login-auth';
import type { BasicRobloxUserResult, RobloxUserResult } from './roblox';
import type { Hono } from 'hono';
import type { LoggedInUser } from './type';
import archiver from 'archiver';
import { verifyContext } from './captcha';
import mime from 'mime-types';
import fs from 'fs';
import { randomUUIDv7 } from 'bun';
import { getURLHost, isDev } from './dev';
import { createS3Path, getS3URL, s3 } from './s3';
import { fileTypeFromBlob } from 'file-type';
import sharp from 'sharp';
import { rateLimiter } from 'hono-rate-limiter';
import { convertTo, convert as timeConvert } from '@jacobhumston/tc.js';
import { getIP } from './ip';
import { getTempToken } from './temp-tokens';
import { createUploadCardBackgroundsReviewQueueFile } from './files';
import { getPunishmentOfType, getPunishments } from './punishments';
import { discordStaffWebhook } from './events';

function getKeyName(account: LoggedInUser | BasicRobloxUserResult | RobloxUserResult) {
    return `_${account.id}`;
}

export async function getAccountCardPhotoBackground(
    account: LoggedInUser | BasicRobloxUserResult | RobloxUserResult
): Promise<{ name: string; extension: string; webPath: string; custom: boolean } | null> {
    const cardBackground = await accountConfigDB.get(getKeyName(account));
    const name: string = cardBackground?.cardBackground ?? '';

    if (name.startsWith('c:')) {
        let id = name.slice(2);
        let extension = 'png';
        if (id.includes(':')) {
            id = id.split(':')[0];
            extension = id.split(':')[1];
        }
        return {
            name: `${id}`,
            extension: extension,
            webPath: getS3URL(`card-photos/${id}.${extension}`),
            custom: true
        };
    }

    const cardPhoto = getCardImages()[name];
    if (!cardPhoto) return null;
    return cardPhoto;
}

export function setupAccountEndpoints(app: Hono) {
    app.get('/api/account/card-background', async (context) => {
        const user = await getSignedInRobloxUser(context);
        if (!user) return context.json({ error: 'Not logged in.' }, 401);

        return context.json({ result: await getAccountCardPhotoBackground(user) });
    });

    app.get('/api/account/card-background/list', async (context) => {
        const user = await getSignedInRobloxUser(context);
        if (!user) return context.json({ error: 'Not logged in.' }, 401);

        return context.json({ result: Object.values(getCardImages()) });
    });

    app.post(
        '/api/account/card-background/upload',
        rateLimiter({
            windowMs: timeConvert({ hours: 2 }).milliseconds,
            limit: 5,
            standardHeaders: 'draft-6',
            keyGenerator: (context) => {
                return `${getIP(context)}::${context.req.path}`;
            },
            handler: async (context) => {
                return context.json({ error: 'Rate limit exceeded. Please wait and try again.' }, 429) as any;
            },
            skip: async (context) => {
                return (context.req.query('rlb-token') ?? '') === getTempToken('rlb-token');
            }
        }),
        async (context) => {
            const captchaResult = await verifyContext(context);
            if (captchaResult) return captchaResult;

            const user = await getSignedInRobloxUser(context);
            if (!user) return context.json({ error: 'Not logged in.' }, 401);

            const punishments = await getPunishmentOfType(user.id, 'UploadCardBackgroundBan');
            if (punishments) {
                return context.json(
                    { error: 'You are not allowed to upload a card background. Reason: ' + punishments.reason },
                    400
                );
            }

            const currentCard = await getAccountCardPhotoBackground(user);
            if (currentCard?.custom === true)
                return context.json(
                    { error: 'Please delete your current background before uploading another one.' },
                    400
                );

            const body = await context.req.parseBody();
            const file = body['file'];

            if (!file || typeof file === 'string') return context.json({ error: 'Invalid file.' }, 400);

            if (file.size > 2000000) return context.json({ error: 'File size exceeds 2MB limit.' }, 400);

            const type = await fileTypeFromBlob(file);
            if (!type || type.mime !== 'image/png')
                return context.json({ error: 'Invalid file type. Only PNG is allowed.' }, 400);

            const sharpImage = sharp(await file.arrayBuffer());
            sharpImage.resize({ width: 700, height: 300, fit: 'cover' });

            const buffer = await sharpImage.toBuffer();
            const id = randomUUIDv7();
            const path = createS3Path(`card-photos/${id}.png`);
            await s3.write(path, buffer, { type: 'image/png' });

            const data = (await accountConfigDB.get(getKeyName(user))) ?? {};
            data.cardBackground = `c:${id}`;
            await accountConfigDB.set(getKeyName(user), data);

            const queue: any[] = JSON.parse(fs.readFileSync(createUploadCardBackgroundsReviewQueueFile(), 'utf-8'));
            queue.push({
                id,
                url: getS3URL(`card-photos/${id}.png`),
                uploaderId: user.id
            });
            fs.writeFileSync(createUploadCardBackgroundsReviewQueueFile(), JSON.stringify(queue));

            if (!isDev) {
                new Promise(async () => {
                    const message = await discordStaffWebhook
                        .send({
                            content: `A new card background uploaded by **${user.username}** (\`${user.id}\`), please review this uploaded image when you are available to do so.\n\n*[Open Mod Panel - Card Uploads](https://jtoh.pro/redirect?url=https://jtoh.pro/app/mods/mod-panel?page=Card%20Uploads)*\n\n CC: @here`
                        })
                        .catch(console.error);
                    if (message) {
                        const timer = setInterval(
                            () => {
                                const queue: any[] = JSON.parse(
                                    fs.readFileSync(createUploadCardBackgroundsReviewQueueFile(), 'utf-8')
                                );
                                if (queue.find((item) => item.id === id)) return;
                                clearInterval(timer);
                                if (queue.find((item) => item.uploaderId === user.id)) {
                                    discordStaffWebhook.deleteMessage(message.id).catch(console.error);
                                } else {
                                    discordStaffWebhook
                                        .editMessage(message.id, {
                                            content: 'This notification has been handled, thank you!'
                                        })
                                        .catch(console.error);
                                }
                            },
                            convertTo({ seconds: 5 }, 'milliseconds')
                        );
                    }
                });
            }

            return context.json({
                result: {
                    success: true,
                    card: {
                        name: `${id}`,
                        extension: 'png',
                        webPath: getS3URL(`card-photos/${id}.png`),
                        custom: true
                    }
                }
            });
        }
    );

    app.post('/api/account/card-background/pre-crop-upload', async (context) => {
        const captchaResult = await verifyContext(context);
        if (captchaResult) return captchaResult;

        const user = await getSignedInRobloxUser(context);
        if (!user) return context.json({ error: 'Not logged in.' }, 401);

        const body = await context.req.parseBody();
        const file = body['file'];

        if (!file || typeof file === 'string') return context.json({ error: 'Invalid file.' }, 400);

        if (file.size > 2000000) return context.json({ error: 'File size exceeds 2MB limit.' }, 400);

        const type = await fileTypeFromBlob(file);
        if (!type || type.mime !== 'image/png')
            return context.json({ error: 'Invalid file type. Only PNG is allowed.' }, 400);

        const sharpImage = sharp(await file.arrayBuffer());
        sharpImage.resize({ width: 700, height: 300, fit: 'cover' });

        const buffer = await sharpImage.toBuffer();
        context.header('Content-Type', 'image/png');

        // @ts-expect-error
        return context.body(buffer.buffer);
    });

    app.post('/api/account/card-background/remove', async (context) => {
        const user = await getSignedInRobloxUser(context);
        if (!user) return context.json({ error: 'Not logged in.' }, 401);

        const data = (await accountConfigDB.get(getKeyName(user))) ?? {};

        if (data.cardBackground?.startsWith('c:')) {
            const id = data.cardBackground.slice(2);
            const path = createS3Path(`card-photos/${id}.png`);
            await s3.delete(path);
            const queue: any[] = JSON.parse(fs.readFileSync(createUploadCardBackgroundsReviewQueueFile(), 'utf-8'));
            fs.writeFileSync(
                createUploadCardBackgroundsReviewQueueFile(),
                JSON.stringify(queue.filter((item) => item.id !== id))
            );
        }

        delete data.cardBackground;
        await accountConfigDB.set(getKeyName(user), data);

        return context.json({ result: true });
    });

    app.post('/api/account/card-background/set/:name', async (context) => {
        const user = await getSignedInRobloxUser(context);
        if (!user) return context.json({ error: 'Not logged in.' }, 401);

        const name = context.req.param('name');
        const card = getCardImages()[name];
        if (!card) return context.json({ error: 'Invalid card name.' }, 400);

        const currentCard = await getAccountCardPhotoBackground(user);
        if (currentCard?.custom === true)
            return context.json(
                {
                    error: 'You cannot change your card background while using a custom background. Please delete your current background first.'
                },
                400
            ) as any;

        const data = (await accountConfigDB.get(getKeyName(user))) ?? {};
        data.cardBackground = name;
        await accountConfigDB.set(getKeyName(user), data);

        return context.json({
            result: {
                success: true,
                card
            }
        });
    });

    app.get('/api/account/punishments', async (context) => {
        const user = await getSignedInRobloxUser(context);
        if (!user) return context.json({ error: 'Not logged in.' }, 401);

        const data = await getPunishments(user.id);
        const newData = data.map((punishment) => ({
            punishmentType: punishment.type,
            expires: punishment.expires,
            reason: punishment.reason
        }));
        return context.json({ result: newData });
    });

    app.get('/api/account/download-data', async (context) => {
        const user = await getSignedInRobloxUser(context);
        if (!user) return context.json({ error: 'Not logged in.' }, 401);

        const captchaError = await verifyContext(context);
        if (captchaError) return captchaError;

        context.header('Content-Type', mime.lookup('.zip') || 'application/octet-stream');
        context.header('Content-Disposition', `inline; filename="account-data.zip"`);

        const fileName = `temp/archive-${randomUUIDv7()}.zip`;
        fs.writeFileSync(fileName, '');

        let finished = false;
        const writable = fs.createWriteStream(fileName);
        writable.on('close', () => {
            finished = true;
        });

        const archive = archiver('zip');
        archive.pipe(writable);

        archive.append(JSON.stringify((await accountConfigDB.get(getKeyName(user))) ?? {}), {
            name: 'account-settings.json'
        });

        const sessions: any = {};

        // @ts-expect-error
        for await (const [key, value] of loginAuthDB.iterator()) {
            if (value.id == user.id) {
                sessions[key] = value;
            }
        }

        archive.append(JSON.stringify(sessions), { name: 'account-sessions.json' });

        archive.append(
            `>> ACCOUNT DATA REQUEST @ ${getURLHost()}
Account data request for @${user.username} (${user.id}).
Requested and delivered on ${new Date().toUTCString()}.
The contents delivered should NOT be shared with anyone.

>> FILE INFORMATION
"account-settings.json" - Your account configurations, such as card customization.
"account-sessions.json" - Sessions logged into your account. Contains session identifiers and general security information.

>> HAVE QUESTIONS?
Join our support server at https://discord.jtoh.pro
Create a "General Website Support Ticket" in #get-support
            `,
            { name: 'READ-ME.txt' }
        );

        archive.finalize();

        await new Promise((resolve) => {
            const interval = setInterval(() => {
                if (finished) {
                    clearInterval(interval);
                    resolve(void 0);
                }
            }, 100);
        });

        const file = fs.readFileSync(fileName);
        const data = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as any;

        fs.rmSync(fileName);

        return context.body(data);
    });
}
