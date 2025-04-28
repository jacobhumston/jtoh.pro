import type { Hono } from 'hono';
import { userIdToThumbnailFull, userIdToUser } from './roblox';

export default async function credits(app: Hono) {
    const credits: any = {
        credits: [
            {
                info: 'Created jtoh.pro and related services.',
                userId: 2614622891
            },
            {
                info: 'Created towerstats.com, which jtoh.pro heavily relies on. Also a Website Moderator.',
                userId: 257770975
            },
            {
                info: "Original creator of the EToH skill points concept and it's execution.",
                userId: 381696232
            },
            {
                info: 'Website Moderator',
                userId: 460721855
            },
            {
                info: 'Website Moderator',
                userId: 322468106
            }
        ]
    };

    (async () => {
        for (const credit of credits.credits) {
            credit.user = await userIdToUser(credit.userId);
            credit.userId = undefined;
            credit.user.profile = `https://www.roblox.com/users/${credit.user.id}/profile`;
            credit.user.thumbnail = await userIdToThumbnailFull(credit.user.id);
        }
    })();

    app.get('/api/credits', (context) => {
        return context.json(credits);
    });
}
