import * as roblox from './roblox';
import type { BasicRobloxUserResult } from './roblox';
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { centerText, colorText, drawRoundedRect } from './util';

const app = new Hono();
const images = {
    questionMarkMan: await loadImage('src/web/question-mark-man.png'),
    defaultRobloxProfile: await loadImage('src/web/default-roblox-profile.png'),
    jtohLogo: await loadImage('src/web/jtoh-logo.png')
};
GlobalFonts.registerFromPath('src/web/Poppins-Regular.ttf', 'Poppins');

app.use('/*', serveStatic({ root: './src/web/' }));

app.get('/:user', async (context) => {
    const providedUser: string = context.req.param('user').slice(0, 20);
    let user: BasicRobloxUserResult | undefined = undefined;
    if (providedUser.startsWith('!')) {
        user = await roblox.userIdToUser(parseInt(providedUser.slice(1))).catch(() => undefined);
    } else {
        user = await roblox.usernameToUser(providedUser).catch(() => undefined);
    }
    const data =
        user !== undefined
            ? {
                  id: user.id,
                  name: user.name,
                  displayName: user.displayName,
                  thumbnail: await roblox.userIdToThumbnail(user.id).catch(() => undefined)
              }
            : undefined;

    const canvas = createCanvas(700, 300);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2e2e2e';

    drawRoundedRect(ctx, 0, 0, 700, 300, 30);

    if (data === undefined) {
        {
            ctx.save();
            ctx.globalAlpha = 0.1;
            const image = images.questionMarkMan;
            ctx.drawImage(image, 400, 35, 300, 300);
            ctx.restore();
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = '#ff7e7e';
        ctx.font = '30px Poppins';
        ctx.fillText('The requested user was not found!', canvas.width / 2, canvas.height / 2 - 45);

        ctx.fillStyle = 'white';
        ctx.font = '25px Poppins';
        ctx.fillText('Please check the username or user id.', canvas.width / 2, canvas.height / 2 - 5);

        ctx.fillStyle = '#bdbdbd';
        ctx.font = 'italic 18px Poppins';
        ctx.fillText(
            'Note: User ids should start with an exclamation mark, such as "!124".',
            canvas.width / 2,
            canvas.height / 2 + 35
        );

        ctx.fillStyle = '#a8a8a8';
        ctx.font = 'bold italic 20px Poppins';
        ctx.textAlign = 'left';
        colorText(
            ctx,
            'Provided by jtoh.pro with stats from towerstats.com',
            [
                { string: 'jtoh.pro', color: '#986cba' },
                { string: 'towerstats.com', color: '#dfd474' }
            ],
            centerText(canvas, ctx, 'Provided by jtoh.pro with stats from towerstats.com.'),
            canvas.height / 2 + 100,
            '#a8a8a8'
        );

        ctx.textAlign = 'center';
        ctx.fillStyle = '#6b6b6b';
        ctx.font = 'italic 20px Poppins';
        ctx.fillText(
            `Requested user: ${providedUser.startsWith('!') ? `${providedUser.slice(1)} (ID)` : providedUser}`,
            canvas.width / 2,
            canvas.height / 2 - 105
        );

        const image = canvas.toBuffer('image/png');
        context.header('Content-Type', 'image/png');
        return context.body(await new Blob([image]).arrayBuffer());
    } else {
        const thumbnail = data.thumbnail !== undefined ? await loadImage(data.thumbnail) : images.defaultRobloxProfile;

        ctx.save();
        drawRoundedRect(ctx, 10, 5, 100, 100, 50);
        ctx.clip();
        ctx.drawImage(thumbnail, 10, 5, 100, 100);
        ctx.restore();

        ctx.textAlign = 'left';
        ctx.fillStyle = 'white';
        ctx.font = 'bold 25px Poppins';
        ctx.fillText(data.displayName, 120, 55);

        ctx.fillStyle = '#bdbdbd';
        ctx.font = '20px Poppins';
        ctx.fillText(`@${user?.name}`, 120, 85);

        ctx.fillStyle = '#a8a8a8';
        ctx.font = 'bold italic 15px Poppins';
        ctx.textAlign = 'left';
        colorText(
            ctx,
            'Provided by jtoh.pro with stats from towerstats.com',
            [
                { string: 'jtoh.pro', color: '#986cba' },
                { string: 'towerstats.com', color: '#dfd474' }
            ],
            centerText(canvas, ctx, 'Provided by jtoh.pro with stats from towerstats.com.'),
            canvas.height / 2 + 135,
            '#a8a8a8'
        );

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'italic 30px Poppins';
        ctx.fillText(
            `Work in progress! Soon™️`,
            canvas.width / 2,
            canvas.height / 2 + 15
        );

        const image = canvas.toBuffer('image/png');
        context.header('Content-Type', 'image/png');
        return context.body(await new Blob([image]).arrayBuffer());
    }
});

app.get('/embed/:user', async (context) => {
    const providedUser: string = context.req.param('user').slice(0, 30);
    let user: BasicRobloxUserResult | undefined = undefined;
    if (providedUser.startsWith('!')) {
        user = await roblox.userIdToUser(parseInt(providedUser.slice(1))).catch(() => undefined);
    } else {
        user = await roblox.usernameToUser(providedUser).catch(() => undefined);
    }
    const data =
        user !== undefined
            ? {
                  id: user.id,
                  name: user.name,
                  displayName: user.displayName,
                  thumbnail: await roblox.userIdToThumbnail(user.id).catch(() => undefined)
              }
            : undefined;

    if (data === undefined) {
        return context.json({ error: 'User not found.' }, 404);
    } else {
        return context.html(
            `<html><head><meta property="og:title" content="Stats for ${data.displayName}"><meta property="og:description" content="Viewing the stats of @${data.name}. Click the link above to view more stats."><meta property="og:image" content="${new URL(context.req.url).origin}/${data.name}"><meta property="og:type" content="image"><meta property="og:url" content="https://towerstats.com/jtoh?username=${data.name}"><meta property="twitter:card" content="summary_large_image"><meta http-equiv="refresh" content="0; url=https://towerstats.com/jtoh?username=${data.name}" /><style>body,html{background-color:#000000;}</style></head></html>`
        );
    }
});

app.get('/e/:user', async (context) => {
    return context.redirect('/embed/' + context.req.param('user'));
});

app.notFound((context) => {
    return context.json({ error: 'Not found.' }, 404);
});

export default { 
    port: 80, 
    fetch: app.fetch, 
} 
