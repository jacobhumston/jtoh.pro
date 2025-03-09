import { createCanvas, loadImage } from '@napi-rs/canvas';
import { centerText, colorText, drawIconWithText, drawRoundedRect, drawRoundedRectv2, roundedRect } from '../util';
import type { TowerDataCSCD } from '../type';
import { v4 } from 'uuid';
import Color from 'color';
import { Hono } from 'hono';
import {
    updateRequestCount,
    updateCardRequestCount,
    getPlaceInLeaderboard,
    skillPointsDB,
    getTotalInLeaderboard,
    updateSkillPoints
} from '../db';
import images from '../images';
import { parseRobloxAccount } from '../login-auth';
import { towerStatsToken } from '../tokens';
import { getAccountCardPhotoBackground } from '../accountSettings';

export default function cscdGen(app: Hono) {
    app.get('/cscd/:user', async (context) => {
        const providedUser: string = context.req.param('user').slice(0, 20);
        const data = await parseRobloxAccount(context);
        const formatter = new Intl.NumberFormat('en-US');

        const canvas = createCanvas(700, 300);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#2e2e2e';

        drawRoundedRect(ctx, 0, 0, 700, 300, 30);

        if (data !== undefined) {
            const cardBackground = await getAccountCardPhotoBackground(data);
            if (cardBackground !== null) {
                const image = await loadImage('src/web' + cardBackground.webPath).catch(() => null);
                if (image) {
                    ctx.save();
                    ctx.globalAlpha = 0.3;
                    roundedRect(ctx, 0, 0, 700, 300, 30);
                    ctx.clip();
                    ctx.drawImage(image, 0, 0, 700, 300);
                    ctx.restore();
                }
            }
        }

        if (data === undefined) {
            context.header('Content-Disposition', 'inline; filename="unknown.png"');

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
            ctx.fillText(
                'Provided by jtoh.pro with stats by TowerStats.com',
                centerText(canvas, ctx, 'Provided by jtoh.pro with stats by TowerStats.com'),
                canvas.height / 2 + 100
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
            context.header('Content-Disposition', `inline; filename="${encodeURIComponent(data.name)}.png"`);

            const thumbnail =
                data.thumbnail !== undefined
                    ? await loadImage(data.thumbnail).catch(() => images.defaultRobloxProfile)
                    : images.defaultRobloxProfile;

            //const thumbnail = await loadImage(await roblox.userIdToThumbnailBust(data.id)).catch(() => {
            //    return images.defaultRobloxProfile;
            //});

            let loadTime = Date.now();
            let towerStats: TowerDataCSCD | undefined = await fetch(
                `https://api.towerstats.com/?id=${data.id}&apiKey=${towerStatsToken}&game=cscd`
            )
                .then((res) => {
                    loadTime = (Date.now() - loadTime) / 1000;
                    loadTime = parseFloat(loadTime.toFixed(2));
                    if (res.ok) return res.json();
                    return undefined;
                })
                .catch(() => undefined);

            if (towerStats !== undefined && (towerStats.error as any) !== undefined) {
                towerStats = undefined;
            }

            /*
            ctx.save();
            drawRoundedRectv2(ctx, 20, 0, 100, 100, { bottomLeft: 0, bottomRight: 0, topLeft: 20, topRight: 20 });
            ctx.clip();
            */

            ctx.fillStyle = Color('#2e2e2e').darken(0.4).hex();
            drawRoundedRectv2(ctx, 20, 20, 100, 80, { bottomLeft: 0, bottomRight: 0, topLeft: 50, topRight: 50 });
            ctx.drawImage(thumbnail, 23, 6, 94, 94);

            ctx.save();
            ctx.fillStyle = Color('#2e2e2e').darken(0.4).hex();
            ctx.beginPath();
            ctx.moveTo(20, 100);
            ctx.lineTo(20 + 100 / 6, 115);
            ctx.lineTo(20 + (100 / 6) * 2, 105);
            ctx.lineTo(20 + (100 / 6) * 3, 115);
            ctx.lineTo(20 + (100 / 6) * 4, 105);
            ctx.lineTo(20 + (100 / 6) * 5, 115);
            ctx.lineTo(20 + (100 / 6) * 6, 100);
            ctx.lineTo(20, 100);
            ctx.fill();
            ctx.restore();

            if (towerStats !== undefined) {
                updateCardRequestCount('cscd', data).catch(() => undefined);
                await updateSkillPoints('cscd', data, towerStats.skill_points.legit).catch(() => undefined);

                towerStats.difficulty_colors['Nil'] = towerStats.difficulty_colors['nil'];
                towerStats.difficulty_colors_outlines['Nil'] = towerStats.difficulty_colors_outlines['nil'];

                ctx.textAlign = 'left';
                ctx.fillStyle = 'white';
                ctx.font = 'bold 25px Poppins, Twemoji';
                if (data.id === 2614622891) {
                    ctx.fillStyle = '#ff9f8e';
                    ctx.fillText(`💖 ${data.displayName}`, 130, 40);
                } else if (data.id === 257770975) {
                    ctx.fillStyle = '#6eadff';
                    ctx.fillText(`🤓 ${data.displayName}`, 130, 40);
                } else if (towerStats.donated_amount > 0) {
                    ctx.fillStyle = '#fff88f';
                    ctx.fillText(`⭐ ${data.displayName}`, 130, 40);
                } else {
                    ctx.fillText(`${data.displayName}`, 130, 40);
                }

                ctx.fillStyle = '#bdbdbd';
                ctx.font = '20px Poppins';
                ctx.fillText(`@${data?.name}`, 130, 70);

                ctx.save();
                ctx.font = '18px Poppins';
                ctx.textAlign = 'left';
                ctx.fillStyle = '#bdbdbd';

                let usingAJ = towerStats.hardest_tower.legit ? false : towerStats.hardest_tower.aj ? true : false;

                const modeQuery = context.req.query('mode') ?? '';
                if (modeQuery === 'aj') usingAJ = true;
                if (modeQuery === 'legit') usingAJ = false;

                const valueWord = usingAJ ? 'aj' : 'legit';

                if (towerStats.hardest_tower[valueWord]) {
                    if (usingAJ) {
                        ctx.fillStyle = Color('#bdbdbd').darken(0.7).hex();
                        drawRoundedRect(ctx, 10, 10, 95, 30, 15);

                        ctx.fillStyle = '#78d663';
                        ctx.fillText('Using AJ', 18, 30);
                    }

                    ctx.fillStyle = '#bdbdbd';

                    const hardestTowerString = towerStats.hardest_tower[valueWord] ?? '';
                    let text = hardestTowerString.replaceAll(' ', '_');
                    if (text.length > 35) text = towerStats.hardest_abbreviation[valueWord] ?? '';
                    const raw = towerStats.hardest_raw_difficulty[valueWord].toString();
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
                                    const color = Color(
                                        towerStats.difficulty_colors_outlines[
                                            towerStats.difficulties[raw.split('.')[0]]
                                        ] ?? c
                                    );
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
                        130,
                        98,
                        '#bdbdbd'
                    );
                } else {
                    ctx.fillText('This user has not completed a tower!', 130, 98);
                }

                if (
                    towerStats.difficulties !== undefined &&
                    towerStats.difficulty_colors !== undefined &&
                    towerStats.difficulty_progress !== undefined
                ) {
                    const length = 660;
                    const startY = 245;
                    ctx.fillStyle = '#5a5a5a';
                    ctx.fillRect(20, startY, 660, 5);

                    let difficultyOrder = [];
                    for (const [key, string] of Object.entries(towerStats.difficulties)) {
                        //if (parseInt(key) > 11) continue;
                        if (towerStats.difficulty_progress[valueWord][string] === undefined) continue;
                        difficultyOrder[parseInt(key) - 1] = string;
                    }
                    difficultyOrder = difficultyOrder.filter((e) => e !== undefined && e !== null);

                    let totalCompleted = 0;
                    let totalTotal = 0;
                    difficultyOrder.forEach((difficulty, index) => {
                        const difficultyColor = towerStats.difficulty_colors[difficulty];
                        const outLineColor = towerStats.difficulty_colors_outlines[difficulty];
                        const difficultyAmount = towerStats.difficulty_progress[valueWord][difficulty];

                        // 700 by 300
                        const completed = difficultyAmount[0];
                        const total = difficultyAmount[1];
                        totalCompleted += completed;
                        totalTotal += total;
                        const width = (completed / total) * (length / difficultyOrder.length);
                        const startX = (700 - length) / 2 + index * (length / difficultyOrder.length);
                        ctx.fillStyle = Color(outLineColor ?? difficultyColor)
                            .darken(0.75)
                            .hex();
                        ctx.fillRect(startX, startY, length / difficultyOrder.length, 5);
                        ctx.fillStyle = difficultyColor;
                        ctx.fillRect(startX, startY, width, 5);
                        ctx.textAlign = 'left';
                        ctx.font = 'bold 16px Poppins';
                        {
                            const color = Color(outLineColor ?? difficultyColor);
                            ctx.strokeStyle = color.darken(0.5).hex();
                            ctx.globalAlpha = 0.5;
                            ctx.lineWidth = 3;
                            ctx.lineJoin = 'miter';
                            ctx.miterLimit = 2;
                            ctx.strokeText(`${Math.floor((completed / total) * 100)}%`, startX, startY - 6, 98);
                            ctx.globalAlpha = 1;
                        }
                        ctx.fillStyle = difficultyColor;
                        ctx.fillText(`${Math.floor((completed / total) * 100)}%`, startX, startY - 6);
                        ctx.fillStyle = new Color('#bdbdbd').darken(0.2).hex();
                        ctx.font = 'bold 15px Poppins';
                        ctx.fillText(`${total - completed}`, startX, startY + 20);
                    });

                    ctx.save();
                    roundedRect(ctx, 0, 0, 700, 300, 30);
                    ctx.clip();

                    ctx.fillStyle = new Color('#2e2e2e').darken(0.3).hex();
                    drawRoundedRect(ctx, 0, startY + 31, 700, 24, 0);
                    ctx.fillStyle = '#218f3e';
                    drawRoundedRect(ctx, 0, startY + 31, (totalCompleted / totalTotal) * 700, 24, 0);

                    ctx.restore();

                    ctx.textAlign = 'left';
                    ctx.fillStyle = '#e3e3e3';
                    ctx.font = 'bold 15px Poppins';
                    ctx.fillText(`${towerStats.completed_towers[valueWord]} Completed`, 60, startY + 48);
                    ctx.textAlign = 'right';
                    ctx.fillText(`${towerStats.total_towers} Total`, 640, startY + 48);
                    ctx.textAlign = 'center';
                    ctx.fillText(
                        `${Math.floor((towerStats.completed_towers[valueWord] / towerStats.total_towers) * 100)}% Progress`,
                        680 / 2,
                        startY + 48
                    );
                }

                ctx.textAlign = 'left';
                ctx.fillStyle = '#f8f8f8';
                ctx.font = 'bold 15px Poppins, Twemoji';
                //ctx.fillText(`Completed Tower Types`, 20, 135);
                drawIconWithText(ctx, 'inventory', '18px', 18, 'Completed Tower Types', '#f8f8f8', 20, 135);

                ctx.textAlign = 'left';
                ctx.fillStyle = '#bdbdbd';
                ctx.font = 'bold 15px Poppins, Twemoji';
                ctx.fillText(
                    `${towerStats.completed_types[valueWord].steeple ?? 0} Steeples, ${towerStats.completed_types[valueWord].tower ?? 0} Towers, ${towerStats.completed_types[valueWord].citadel ?? 0} Citadels`,
                    20,
                    155
                );

                ctx.textAlign = 'left';
                ctx.fillStyle = '#f8f8f8';
                ctx.font = 'bold 15px Poppins, Twemoji';
                //ctx.fillText(`Skill Points`, 340, 135);
                drawIconWithText(ctx, 'timeline', '18px', 18, 'Skill Points', '#f8f8f8', 340, 135);

                ctx.textAlign = 'left';
                ctx.fillStyle = '#bdbdbd';
                ctx.font = 'bold 15px Poppins, Twemoji';

                const skillPointsString = formatter.format(towerStats.skill_points[valueWord]);
                const skillPointsString1 = skillPointsString.split('.')[0];
                const skillPointsString2 = skillPointsString.split('.')[1];

                if (!skillPointsString2 || skillPointsString2.length <= 0) {
                    ctx.fillText(`${skillPointsString}`, 340, 155);
                } else {
                    colorText(
                        ctx,
                        `${skillPointsString1}.${skillPointsString2}`,
                        [
                            {
                                string: `.${skillPointsString2}`,
                                color: Color('#bdbdbd').darken(0.2).hex()
                            }
                        ],
                        340,
                        155,
                        '#bdbdbd'
                    );
                }

                ctx.textAlign = 'left';
                ctx.fillStyle = '#f8f8f8';
                ctx.font = 'bold 15px Poppins, Twemoji';
                //ctx.fillText(`Rank (SP)`, 475, 135);
                drawIconWithText(ctx, 'trophy', '18px', 18, 'Skill Points Rank', '#f8f8f8', 475, 135);

                ctx.textAlign = 'left';
                ctx.fillStyle = '#bdbdbd';
                ctx.font = 'bold 15px Poppins, Twemoji';
                /*
                ctx.fillText(
                    `#${(await getPlaceInLeaderboard(skillPointsDB, 'jtoh', data).catch(() => undefined)) ?? '???'}`,
                    490,
                    155
                );
                */
                if (!usingAJ) {
                    const spRank = ((value: number | null) => {
                        if (value === null) return 'N/A';
                        return `#${formatter.format(value)}`;
                    })(await getPlaceInLeaderboard(skillPointsDB, 'cscd', data).catch(() => undefined));
                    const spTotal =
                        `out of ${formatter.format(await getTotalInLeaderboard(skillPointsDB, 'cscd'))}`.replaceAll(
                            ' ',
                            '_'
                        );
                    colorText(
                        ctx,
                        `${spRank} ${spTotal}`,
                        [
                            {
                                string: spTotal,
                                color: new Color('#bdbdbd').darken(0.2).hex()
                            }
                        ],
                        475,
                        155,
                        '#bdbdbd'
                    );
                } else {
                    ctx.fillText('Ineligible', 475, 155);
                }

                ctx.textAlign = 'left';
                ctx.fillStyle = '#f8f8f8';
                ctx.font = 'bold 15px Poppins, Twemoji';
                drawIconWithText(ctx, 'map', '18px', 18, 'Completed Areas', '#f8f8f8', 20, 185);
                //ctx.fillText(`map Completed Areas`, 20, 185);

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

                updateRequestCount('cscd').catch(() => undefined);
            } else {
                ctx.textAlign = 'left';
                ctx.fillStyle = 'white';
                ctx.font = 'bold 25px Poppins, Twemoji';
                ctx.fillText(`${data.displayName}`, 130, 55);

                ctx.fillStyle = '#bdbdbd';
                ctx.font = '20px Poppins';
                ctx.fillText(`@${data?.name}`, 130, 85);

                ctx.textAlign = 'center';
                ctx.fillStyle = '#ff7e7e';
                ctx.font = '30px Poppins';
                ctx.fillText("Failed to load the user's stats.", canvas.width / 2, canvas.height / 2);

                ctx.fillStyle = 'white';
                ctx.font = '25px Poppins';
                ctx.fillText('Please try again in a minute.', canvas.width / 2, canvas.height / 2 + 30);

                ctx.fillStyle = '#a8a8a8';
                ctx.font = 'italic 22px Poppins';
                ctx.fillText(
                    'Please avoid spamming card requests if possible.',
                    canvas.width / 2,
                    canvas.height / 2 + 80
                );
            }

            /*
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
            */

            ctx.font = '13px Poppins';
            ctx.fillStyle = Color('#986cba').darken(0.2).hex();
            drawRoundedRectv2(
                ctx,
                700 - (ctx.measureText(`Stats by TowerStats.com`).width + 55),
                0,
                ctx.measureText(`Stats by TowerStats.com`).width + 18,
                47,
                { bottomLeft: 10, bottomRight: 10, topLeft: 0, topRight: 0 }
            );

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            colorText(
                ctx,
                `Stats by TowerStats.com`,
                [
                    { string: 'TowerStats', color: '#ffd54c' },
                    { string: '.com', color: '#ffd54c' }
                ],
                700 - (ctx.measureText(`Stats by TowerStats.com`).width + 55) + 9,
                40,
                '#ffffff'
            );

            ctx.font = '13px Poppins';
            ctx.fillStyle = '#986cba';
            drawRoundedRectv2(
                ctx,
                700 - (ctx.measureText(`jtoh.pro/cscd/${data.name}`).width + 55),
                -10,
                ctx.measureText(`jtoh.pro/cscd/${data.name}`).width + 18,
                35,
                { bottomLeft: 10, bottomRight: 0, topLeft: 0, topRight: 0 }
            );

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.fillText(
                `jtoh.pro/cscd/${data.name}`,
                700 - (ctx.measureText(`jtoh.pro/cscd/${data.name}`).width + 55) + 10,
                15
            );

            ctx.fillStyle = '#a8a8a8';
            ctx.font = 'italic 10px Poppins';
            ctx.textAlign = 'left';
            ctx.fillText(
                `Took ${loadTime}s to load.`,
                700 - (ctx.measureText(`Took ${loadTime}s to load.`).width + 55),
                60
            );

            const image = canvas.toBuffer('image/png');
            context.header('Content-Type', 'image/png');
            return context.body(await new Blob([image]).arrayBuffer());
        }
    });

    app.get('/cscd/embed/:user', async (context) => {
        const providedUser: string = context.req.param('user').slice(0, 20);
        const data = await parseRobloxAccount(context);

        const mode = context.req.query('mode') ?? '';
        let query = '';
        let query2 = '';
        if (mode === 'aj') {
            query = '?mode=aj';
            query2 = '&mode=aj';
        }
        if (mode === 'legit') {
            query = '?mode=legit';
            query2 = '&mode=legit';
        }

        if (data === undefined) {
            return context.redirect(`/cscd/${providedUser}${query}`);
        } else {
            return context.html(
                `<html>
                    <head> <!-- ${new Date().toISOString()} --!> 
                        <meta property="og:title" content="Stats for ${data.displayName}">
                        <meta property="og:description" content="Viewing @${data.name}'s Caleb's Soul Crushing Domain stats. Click the link above to view more stats.">
                        <meta property="og:image" content="${new URL(context.req.url).origin}/cscd/${data.name}?nocache=${v4()}${query2}">
                        <meta property="og:type" content="image"><meta property="og:url" content="https://towerstats.com/cscd?username=${data.name}">
                        <meta property="twitter:card" content="summary_large_image">
                        <meta http-equiv="refresh" content="0; url=https://towerstats.com/cscd?username=${data.name}" />
                        <style>
                            body,html{background-color:#000000;}
                        </style>
                    </head>
                </html>`
            );
        }
    });

    app.get('/cscd/e/:user', async (context) => {
        const mode = context.req.query('mode') ?? '';
        let query = '';
        if (mode === 'aj') query = '?mode=aj';
        if (mode === 'legit') query = '?mode=legit';
        return context.redirect('/cscd/embed/' + context.req.param('user') + query);
    });

    app.get('/c/*', async (context) => {
        const mode = context.req.query('mode') ?? '';
        let query = '';
        if (mode === 'aj') query = '?mode=aj';
        if (mode === 'legit') query = '?mode=legit';
        return context.redirect(context.req.path.replace('/c/', '/cscd/') + query);
    });
}
