import * as roblox from './roblox';
import type { BasicRobloxUserResult } from './roblox';
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { centerText, colorText, drawRoundedRect } from './util';
import puppeteer from 'puppeteer';
import temporaryTestData from '../example-data.json';

const browser = await puppeteer.launch({ headless: 'shell', userDataDir: './.cache/puppeteer-user-data' });
const app = new Hono();
const images = {
    questionMarkMan: await loadImage('src/web/question-mark-man.png'),
    defaultRobloxProfile: await loadImage('src/web/default-roblox-profile.png'),
    jtohLogo: await loadImage('src/web/jtoh-logo.png')
};
GlobalFonts.registerFromPath('src/web/Poppins-Regular.ttf', 'Poppins');
GlobalFonts.registerFromPath('src/web/Twemoji-15.1.0.ttf', 'Twemoji');

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
        ctx.font = 'bold 25px Poppins, Twemoji';
        if (data.id === 2614622891) {
            ctx.fillStyle = '#ff9f8e';
            ctx.fillText(`💖 ${data.displayName}`, 120, 55);
        } else if (data.id === 257770975) {
            ctx.fillStyle = '#6eadff';
            ctx.fillText(`🤓 ${data.displayName}`, 120, 55);
        } else if (temporaryTestData.donated_amount > 0) {
            ctx.fillStyle = '#fff88f';
            ctx.fillText(`⭐ ${data.displayName}`, 120, 55);
        } else {
            ctx.fillText(`${data.displayName}`, 120, 55);
        }

        ctx.fillStyle = '#bdbdbd';
        ctx.font = '20px Poppins';
        ctx.fillText(`@${user?.name}`, 120, 85);

        ctx.font = '18px Poppins';
        ctx.textAlign = 'left';
        colorText(
            ctx,
            `Hardest tower is ${temporaryTestData.hardest_abbreviation} - ${temporaryTestData.hardest_raw_difficulty.toString()}`,
            [
                {
                    string: temporaryTestData.hardest_abbreviation,
                    // @ts-ignore-next-line
                    color: temporaryTestData.difficulty_colors[
                        // @ts-ignore-next-line
                        temporaryTestData.difficulties[
                            temporaryTestData.hardest_raw_difficulty.toString().split('.')[0]
                        ]
                    ]
                },
                {
                    string: `${temporaryTestData.hardest_raw_difficulty.toString()}`,
                    color: '#a3a3a3'
                }
            ],
            120,
            115,
            '#bdbdbd'
        );

        {
            const difficultyOrder = [
                'Easy',
                'Medium',
                'Hard',
                'Difficult',
                'Challenging',
                'Intense',
                'Remorseless',
                'Insane',
                'Extreme',
                'Terrifying',
                'Impossible',
                'Catastrophic'
            ];
            difficultyOrder.forEach((difficulty, index) => {
                // @ts-ignore-next-line
                const difficultyColor = temporaryTestData.difficulty_colors[difficulty];
                // @ts-ignore-next-line
                const difficultyAmount = temporaryTestData.difficulty_progress[difficulty];
                const difficultyX = 120 + (index % 4) * 170;
                const difficultyY = 150 + Math.floor(index / 4) * 30;

                ctx.fillStyle = difficultyColor;
                ctx.font = 'bold 20px Poppins';
                ctx.fillText(`${difficulty} - ${difficultyAmount}`, difficultyX, difficultyY);
            });
        }

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
        return context.redirect(`/${providedUser}`);
    } else {
        return context.html(
            `<html><head><meta property="og:title" content="Stats for ${data.displayName}"><meta property="og:description" content="Viewing @${data.name}'s Juke's Towers of Hell stats. Click the link above to view more stats."><meta property="og:image" content="${new URL(context.req.url).origin}/${data.name}"><meta property="og:type" content="image"><meta property="og:url" content="https://towerstats.com/jtoh?username=${data.name}"><meta property="twitter:card" content="summary_large_image"><meta http-equiv="refresh" content="0; url=https://towerstats.com/jtoh?username=${data.name}" /><style>body,html{background-color:#000000;}</style></head></html>`
        );
    }
});

app.get('/e/:user', async (context) => {
    return context.redirect('/embed/' + context.req.param('user'));
});

app.get('/screenshot/:type/:user', async (context) => {
    const providedUser: string = context.req.param('user').slice(0, 20);
    const type: string = context.req.param('type').slice(0, 20);
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
        return context.redirect(`/${providedUser}`);
    } else {
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        await page.goto(`https://towerstats.com/jtoh?username=${data.name}`, { waitUntil: 'load' });
        let screenshot = null;

        if (type === 'difficulty') {
            let element = await page.waitForSelector('#difficulty-stats', { visible: true }).catch(() => undefined);
            if (element) element = await element.waitForSelector('.subarea', { visible: true }).catch(() => undefined);
            if (!element) {
                await page.close();
                return context.json({ error: 'Failed to load the page.' }, 500);
            }
            screenshot = await element?.screenshot({ type: 'png' });
        }

        await page.close();
        if (screenshot === null) return context.json({ error: 'Invalid type provided.' }, 404);
        context.header('Content-Type', 'image/png');
        return context.body(await new Blob([screenshot as any]).arrayBuffer());
    }
});

app.get('/s/:type/:user', async (context) => {
    return context.redirect(`/screenshot/${context.req.param('type')}/${context.req.param('user')}`);
});

app.get('/', async (context) => {
    return context.redirect('/app/');
});

app.notFound((context) => {
    return context.json({ error: 'Not found.' }, 404);
});

export default {
    port: 80,
    fetch: app.fetch
};
