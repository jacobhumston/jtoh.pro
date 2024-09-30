import { createCanvas, loadImage } from '@napi-rs/canvas';
import { centerText, colorText, drawRoundedRect } from './util';
import type { TowerData } from './type';
import { v4 } from 'uuid';
import Color from 'color';
import { Hono } from 'hono';
import { updateRequestCount, updateCardRequestCount } from './db';
import * as roblox from './roblox';
import images from './images';

export default function jtoh(app: Hono) {
    app.get('/:user', async (context) => {
        updateRequestCount().catch(() => undefined);

        const providedUser: string = context.req.param('user').slice(0, 20);
        const data = await roblox.auth(context);

        if (data !== undefined) {
            updateCardRequestCount('jtoh', data).catch(() => undefined);
        }

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
                ctx.fillText(`@${data?.name}`, 120, 70);

                ctx.save();
                ctx.font = '18px Poppins';
                ctx.textAlign = 'left';
                ctx.fillStyle = '#bdbdbd';
                if (
                    towerStats.hardest_abbreviation !== null &&
                    towerStats.hardest_tower !== null &&
                    towerStats.hardest_abbreviation !== undefined &&
                    towerStats.hardest_tower !== undefined &&
                    towerStats.hardest_raw_difficulty !== undefined &&
                    towerStats.hardest_raw_difficulty !== null
                ) {
                    let text = towerStats.hardest_tower.replaceAll(' ', '_');
                    if (text.length > 35) text = towerStats.hardest_abbreviation;
                    const raw = towerStats.hardest_raw_difficulty.toString();
                    colorText(
                        ctx,
                        `Hardest tower is ${text} (${raw})`,
                        [
                            {
                                string: text as string,
                                // @ts-ignore-next-line
                                color: towerStats.difficulty_colors[
                                    // @ts-ignore-next-line
                                    towerStats.difficulties[raw.split('.')[0]]
                                ],
                                beforeCallback: (x, w, c) => {
                                    ctx.font = 'bold 18px Poppins';
                                    const color = Color(c);
                                    ctx.strokeStyle = color.darken(0.5).hex();
                                    ctx.globalAlpha = 0.5;
                                    ctx.lineWidth = 3;
                                    ctx.lineJoin = 'miter';
                                    ctx.miterLimit = 2;
                                    ctx.strokeText(w, x, 98);
                                    ctx.globalAlpha = 1;
                                },
                                afterCallback: () => {
                                    ctx.font = '18px Poppins';
                                }
                            },
                            {
                                string: `(${raw})`,
                                color: '#a3a3a3',
                                beforeCallback: () => {
                                    ctx.font = 'italic 18px Poppins';
                                },
                                afterCallback: () => {
                                    ctx.font = '18px Poppins';
                                }
                            }
                        ],
                        120,
                        98,
                        '#bdbdbd'
                    );
                } else {
                    ctx.fillText('This user has not completed a tower!', 120, 98);
                }

                {
                    const length = 660;
                    const startY = 245;
                    ctx.fillStyle = '#5a5a5a';
                    ctx.fillRect(20, startY, 660, 5);
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
                        ctx.fillStyle = Color(difficultyColor).darken(0.7).hex();
                        ctx.fillRect(startX, startY, length / difficultyOrder.length, 5);
                        ctx.fillStyle = difficultyColor;
                        ctx.fillRect(startX, startY, width, 5);
                        ctx.textAlign = 'left';
                        ctx.font = 'bold 16px Poppins';
                        {
                            const color = Color(difficultyColor);
                            ctx.strokeStyle = color.darken(0.5).hex();
                            ctx.globalAlpha = 0.5;
                            ctx.lineWidth = 3;
                            ctx.lineJoin = 'miter';
                            ctx.miterLimit = 2;
                            ctx.strokeText(`${Math.floor((completed / total) * 100)}%`, startX, startY - 6, 98);
                            ctx.globalAlpha = 1;
                        }
                        ctx.fillText(`${Math.floor((completed / total) * 100)}%`, startX, startY - 6);
                    });
                    ctx.textAlign = 'left';
                    ctx.fillStyle = '#bdbdbd';
                    ctx.font = 'bold 15px Poppins';
                    ctx.fillText(`${towerStats.completed_towers} Completed`, 20, startY + 20);
                    ctx.textAlign = 'right';
                    ctx.fillText(`${towerStats.total_towers} Total`, 680, startY + 20);
                    ctx.textAlign = 'center';
                    ctx.fillText(
                        `${Math.floor((towerStats.completed_towers / towerStats.total_towers) * 100)}% Progress`,
                        680 / 2,
                        startY + 20
                    );
                }

                ctx.textAlign = 'left';
                ctx.fillStyle = '#f8f8f8';
                ctx.font = 'bold 15px Poppins, Twemoji';
                ctx.fillText(`Completed Tower Types`, 20, 135);

                ctx.textAlign = 'left';
                ctx.fillStyle = '#bdbdbd';
                ctx.font = 'bold 15px Poppins, Twemoji';
                ctx.fillText(
                    `${towerStats.completed_types.steeple ?? 0} Steeples, ${towerStats.completed_types.tower ?? 0} Towers, ${towerStats.completed_types.citadel ?? 0} Citadels`,
                    20,
                    155
                );

                ctx.textAlign = 'left';
                ctx.fillStyle = '#f8f8f8';
                ctx.font = 'bold 15px Poppins, Twemoji';
                ctx.fillText(`Completed Areas`, 20, 185);

                ctx.fillStyle = '#bdbdbd';
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
                        20,
                        205
                    );
                } else {
                    ctx.fillText('This user has not completed any areas.', 20, 205);
                }
            } else {
                ctx.textAlign = 'left';
                ctx.fillStyle = 'white';
                ctx.font = 'bold 25px Poppins, Twemoji';
                ctx.fillText(`${data.displayName}`, 120, 55);

                ctx.fillStyle = '#bdbdbd';
                ctx.font = '20px Poppins';
                ctx.fillText(`@${data?.name}`, 120, 85);

                ctx.textAlign = 'center';
                ctx.fillStyle = '#ff7e7e';
                ctx.font = '30px Poppins';
                ctx.fillText("Failed to load the user's stats.", canvas.width / 2, canvas.height / 2);

                ctx.fillStyle = 'white';
                ctx.font = '25px Poppins';
                ctx.fillText('Please try again later.', canvas.width / 2, canvas.height / 2 + 30);
            }

            ctx.fillStyle = '#a8a8a8';
            ctx.font = 'bold italic 13px Poppins';
            ctx.textAlign = 'left';
            colorText(
                ctx,
                'Provided by jtoh.pro with stats from towerstats.com',
                [
                    { string: 'jtoh.pro', color: '#986cba' },
                    { string: 'towerstats.com', color: '#dfd474' }
                ],
                centerText(canvas, ctx, 'Provided by jtoh.pro with stats from towerstats.com.'),
                canvas.height / 2 + 140,
                '#a8a8a8'
            );

            ctx.fillStyle = '#6d6d6d';
            ctx.font = '12px Poppins';
            ctx.textAlign = 'right';
            ctx.fillText(`jtoh.pro/${data.name}`, 675, 18);

            const image = canvas.toBuffer('image/png');
            context.header('Content-Type', 'image/png');
            return context.body(await new Blob([image]).arrayBuffer());
        }
    });

    app.get('/embed/:user', async (context) => {
        const providedUser: string = context.req.param('user').slice(0, 20);
        const data = await roblox.auth(context);

        if (data === undefined) {
            return context.redirect(`/${providedUser}`);
        } else {
            return context.html(
                `<html><head> <!-- ${new Date().toISOString()} --!> <meta property="og:title" content="Stats for ${data.displayName}"><meta property="og:description" content="Viewing @${data.name}'s Juke's Towers of Hell stats. Click the link above to view more stats."><meta property="og:image" content="${new URL(context.req.url).origin}/${data.name}?nocache=${v4()}"><meta property="og:type" content="image"><meta property="og:url" content="https://towerstats.com/jtoh?username=${data.name}"><meta property="twitter:card" content="summary_large_image"><meta http-equiv="refresh" content="0; url=https://towerstats.com/jtoh?username=${data.name}" /><style>body,html{background-color:#000000;}</style></head></html>`
            );
        }
    });

    app.get('/e/:user', async (context) => {
        return context.redirect('/embed/' + context.req.param('user'));
    });
}
