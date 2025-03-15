import { getCardImages } from './card-images';
import { accountConfigDB } from './db';
import { getSignedInRobloxUser } from './login-auth';
import type { BasicRobloxUserResult, RobloxUserResult } from './roblox';
import type { Hono } from 'hono';
import type { LoggedInUser } from './type';

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
}
