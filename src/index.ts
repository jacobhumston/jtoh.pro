import * as roblox from './roblox';
import type { BasicRobloxUserResult } from './roblox';
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { centerText, colorText, drawRoundedRect, randomizeCase } from './util';
import { statsDB } from './db';
import { startOfMonth, startOfWeek, startOfYear, parse, isAfter } from 'date-fns';
import type { TowerData } from './type';

const app = new Hono();
const images = {
    questionMarkMan: await loadImage('src/web/question-mark-man.png'),
    defaultRobloxProfile: await loadImage('src/web/default-roblox-profile.png'),
    jtohLogo: await loadImage('src/web/jtoh-logo.png')
};
GlobalFonts.registerFromPath('src/web/Poppins-Regular.ttf', 'Poppins');
GlobalFonts.registerFromPath('src/web/Twemoji-15.1.0.ttf', 'Twemoji');

app.use('*', async (_, next) => {
    const today = new Date()
        .toLocaleString('en-US', { timeZone: 'America/New_York' })
        .split(',')[0]
        .replaceAll('/', '-');
    statsDB.set(today, ((await statsDB.get<number>(today)) ?? 0) + 1);
    return await next();
});

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
        const thumbnail =
            data.thumbnail !== undefined
                ? await loadImage(data.thumbnail).catch(() => images.defaultRobloxProfile)
                : images.defaultRobloxProfile;
        const towerStats: TowerData | undefined = await fetch(
            `https://api.towerstats.com/?id=${data.id}&apiKey=2f8a7a78-9b03-4e95-ace9-1cd06334a16b-d2444398-630c-445a-b5b1-486b92d5d4fe`
        )
            .then((res) => res.json())
            .catch(() => undefined);

        ctx.save();
        drawRoundedRect(ctx, 10, 5, 100, 100, 50);
        ctx.clip();
        ctx.drawImage(thumbnail, 10, 5, 100, 100);
        ctx.restore();

        if (towerStats !== undefined) {
            ctx.textAlign = 'left';
            ctx.fillStyle = 'white';
            ctx.font = 'bold 25px Poppins, Twemoji';
            if (data.id === 2614622891) {
                ctx.fillStyle = '#ff9f8e';
                ctx.fillText(`💖 ${data.displayName}`, 120, 40);
            } else if (data.id === 257770975) {
                ctx.fillStyle = '#6eadff';
                ctx.fillText(`🤓 ${data.displayName}`, 120, 40);
            } else if (towerStats.donated_amount > 0) {
                ctx.fillStyle = '#fff88f';
                ctx.fillText(`⭐ ${data.displayName}`, 120, 40);
            } else {
                ctx.fillText(`${data.displayName}`, 120, 40);
            }

            ctx.fillStyle = '#bdbdbd';
            ctx.font = '20px Poppins';
            ctx.fillText(`@${user?.name}`, 120, 70);

            ctx.font = '18px Poppins';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#bdbdbd';
            if (towerStats.hardest_abbreviation !== null && towerStats.hardest_tower !== null) {
                if ((towerStats.hardest_tower?.length as number) > 30) {
                    colorText(
                        ctx,
                        `Hardest tower is ${towerStats.hardest_abbreviation} - ${towerStats.hardest_raw_difficulty.toString()}`,
                        [
                            {
                                string: towerStats.hardest_abbreviation as string,
                                // @ts-ignore-next-line
                                color: towerStats.difficulty_colors[
                                    // @ts-ignore-next-line
                                    towerStats.difficulties[towerStats.hardest_raw_difficulty.toString().split('.')[0]]
                                ]
                            },
                            {
                                string: `${towerStats.hardest_raw_difficulty.toString()}`,
                                color: '#a3a3a3'
                            }
                        ],
                        120,
                        98,
                        '#bdbdbd'
                    );
                } else {
                    colorText(
                        ctx,
                        `Hardest tower is ${towerStats.hardest_tower?.replaceAll(' ', '_')} - ${towerStats.hardest_raw_difficulty.toString()}`,
                        [
                            {
                                string: towerStats.hardest_tower?.replaceAll(' ', '_') as string,
                                // @ts-ignore-next-line
                                color: towerStats.difficulty_colors[
                                    // @ts-ignore-next-line
                                    towerStats.difficulties[towerStats.hardest_raw_difficulty.toString().split('.')[0]]
                                ]
                            },
                            {
                                string: `${towerStats.hardest_raw_difficulty.toString()}`,
                                color: '#a3a3a3'
                            }
                        ],
                        120,
                        98,
                        '#bdbdbd'
                    );
                }
            } else {
                ctx.fillText('This user has not completed a tower!', 120, 98);
            }

            {
                const length = 600;
                const startY = 260;
                ctx.fillStyle = '#5a5a5a';
                ctx.fillRect(50, startY, 600, 5);
                const difficultyOrder = [];
                for (const [key, string] of Object.entries(towerStats.difficulties)) {
                    if (parseInt(key) > 11) continue;
                    difficultyOrder[parseInt(key) - 1] = string;
                }
                difficultyOrder.forEach((difficulty, index) => {
                    const difficultyColor = towerStats.difficulty_colors[difficulty];
                    const difficultyAmount = towerStats.difficulty_progress[difficulty];
                    // 700 by 300
                    const completed = difficultyAmount[0];
                    const total = difficultyAmount[1];
                    const width = (completed / total) * (length / difficultyOrder.length);
                    const startX = (700 - length) / 2 + index * (length / difficultyOrder.length);
                    ctx.fillStyle = difficultyColor;
                    ctx.fillRect(startX, startY, width, 5);
                    ctx.textAlign = 'left';
                    ctx.font = 'bold 15px Poppins';
                    ctx.fillText(`${Math.floor((completed / total) * 100)}%`, startX, startY - 6);
                });
                ctx.textAlign = 'left';
                ctx.fillStyle = '#bdbdbd';
                ctx.font = 'bold 15px Poppins';
                ctx.fillText(
                    `${towerStats.completed_towers} - ${Math.floor((towerStats.completed_towers / towerStats.total_towers) * 100)}%`,
                    50,
                    startY + 20
                );
                ctx.textAlign = 'right';
                ctx.fillText(`${towerStats.total_towers} Total`, 650, startY + 20);
            }

            ctx.textAlign = 'left';
            ctx.fillStyle = '#bdbdbd';
            ctx.font = 'bold 15px Poppins, Twemoji';
            ctx.fillText(
                `${towerStats.completed_types.steeple ?? 0} Steeples, ${towerStats.completed_types.tower ?? 0} Towers, ${towerStats.completed_types.citadel ?? 0} Citadels`,
                50,
                205
            );
            if (towerStats.completed_areas.length > 0) {
                ctx.fillText(
                    `${towerStats.completed_areas
                        .map((area) =>
                            area
                                .split(' ')
                                .map((e) => e.charAt(0))
                                .join('')
                        )
                        .join(', ')}`,
                    50,
                    225
                );
            } else {
                ctx.fillText('This user has not completed any areas.', 50, 225);
            }
        } else {
            ctx.textAlign = 'left';
            ctx.fillStyle = 'white';
            ctx.font = 'bold 25px Poppins, Twemoji';
            ctx.fillText(`${data.displayName}`, 120, 55);

            ctx.fillStyle = '#bdbdbd';
            ctx.font = '20px Poppins';
            ctx.fillText(`@${user?.name}`, 120, 85);

            ctx.textAlign = 'center';
            ctx.fillStyle = '#ff7e7e';
            ctx.font = '30px Poppins';
            ctx.fillText("Failed to load the user's stats.", canvas.width / 2, canvas.height / 2);

            ctx.fillStyle = 'white';
            ctx.font = '25px Poppins';
            ctx.fillText('Please try again later.', canvas.width / 2, canvas.height / 2 + 30);
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

        ctx.fillStyle = '#6d6d6d';
        ctx.font = 'italic 12px Poppins';
        ctx.textAlign = 'right';
        ctx.fillText(context.req.url, 680, 15);

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
            `<html><head> <!-- ${new Date().toISOString()} --!> <meta property="og:title" content="Stats for ${data.displayName}"><meta property="og:description" content="Viewing @${data.name}'s Juke's Towers of Hell stats. Click the link above to view more stats."><meta property="og:image" content="${new URL(context.req.url).origin}/${randomizeCase(data.name)}"><meta property="og:type" content="image"><meta property="og:url" content="https://towerstats.com/jtoh?username=${data.name}"><meta property="twitter:card" content="summary_large_image"><meta http-equiv="refresh" content="0; url=https://towerstats.com/jtoh?username=${data.name}" /><style>body,html{background-color:#000000;}</style></head></html>`
        );
    }
});

app.get('/e/:user', async (context) => {
    return context.redirect('/embed/' + context.req.param('user'));
});

app.get('/', async (context) => {
    return context.redirect('/app/');
});

app.get('/ext/request-count', async (context) => {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 });
    const startOfCurrentYear = startOfYear(now);

    let monthCount = 0;
    let weekCount = 0;
    let yearCount = 0;
    let totalCount = 0;

    // @ts-ignore-next-line
    for await (const [key, value] of statsDB.iterator()) {
        const date = parse(key, 'MM-dd-yyyy', new Date());
        if (isAfter(date, startOfCurrentMonth)) {
            monthCount += value;
        }
        if (isAfter(date, startOfCurrentWeek)) {
            weekCount += value;
        }
        if (isAfter(date, startOfCurrentYear)) {
            yearCount += value;
        }
        totalCount += value;
    }

    return context.json({
        month: monthCount,
        week: weekCount,
        year: yearCount,
        total: totalCount
    });
});

app.notFound((context) => {
    return context.json({ error: 'Not found.' }, 404);
});

export default {
    port: 80,
    fetch: app.fetch
};
