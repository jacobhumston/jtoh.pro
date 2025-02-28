import type { Hono } from 'hono';
import { userIdToUser } from './roblox';

export default async function credits(app: Hono) {
    const credits: any = {
        credits: [
            {
                info: 'Created jtoh.pro and related services.',
                userId: 2614622891
            },
            {
                info: 'Created towerstats.com, which jtoh.pro heavily relies on.',
                userId: 257770975
            },
            {
                info: 'Original creator of JToH skill points.',
                userId: 381696232
            }
        ]
    };

    for (const credit of credits.credits) {
        credit.user = await userIdToUser(credit.userId);
        credit.userId = undefined;
        credit.user.profile = `https://www.roblox.com/users/${credit.user.id}/profile`;
    }

    app.get('/api/credits', (context) => {
        return context.json(credits);
    });
}
