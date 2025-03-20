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
import { getURLHost } from './dev';

function getKeyName(account: LoggedInUser | BasicRobloxUserResult | RobloxUserResult) {
    return `_${account.id}`;
}

export async function getAccountCardPhotoBackground(
    account: LoggedInUser | BasicRobloxUserResult | RobloxUserResult
): Promise<{ name: string; extension: string; webPath: string } | null> {
    const cardBackground = await accountConfigDB.get(getKeyName(account));
    const name: string = cardBackground?.cardBackground ?? '';
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

    app.post('/api/account/card-background/remove', async (context) => {
        const user = await getSignedInRobloxUser(context);
        if (!user) return context.json({ error: 'Not logged in.' }, 401);

        const data = (await accountConfigDB.get(getKeyName(user))) ?? {};
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
