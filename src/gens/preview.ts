import { createCanvas, loadImage } from '@napi-rs/canvas';
import { centerText, colorText, drawRoundedRect, drawRoundedRectv2, roundedRect } from '../util';
import Color from 'color';
import { Hono } from 'hono';
import images from '../images';
import { parseRobloxAccount } from '../login-auth';
import { getAccountCardPhotoBackground } from '../account-settings';
import { getCardImages } from '../card-images';

export default function previewGen(app: Hono) {
    app.get('/preview/:user', async (context) => {
        const providedUser: string = context.req.param('user').slice(0, 20);
        const data = await parseRobloxAccount(context);

        const canvas = createCanvas(700, 300);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#2e2e2e';

        drawRoundedRect(ctx, 0, 0, 700, 300, 30);

        if (data !== undefined) {
            let cardBackground = await getAccountCardPhotoBackground(data);
            let override = getCardImages()[context.req.query('cardBackgroundOverride') ?? ''];
            if (override) cardBackground = override;
            if (cardBackground !== null) {
                const image = await loadImage(
                    cardBackground.custom ? new URL(cardBackground.webPath) : 'src/web' + cardBackground.webPath
                ).catch(() => null);
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

            // @ts-expect-error
            return context.body(await new Blob([image]).arrayBuffer());
        } else {
            context.header(
                'Content-Disposition',
                `inline; filename="jtoh-pro-card-${encodeURIComponent(data.name)}.png"`
            );

            const thumbnail =
                data.thumbnail !== undefined
                    ? await loadImage(data.thumbnail).catch(() => images.defaultRobloxProfile)
                    : images.defaultRobloxProfile;

            //const thumbnail = await loadImage(await roblox.userIdToThumbnailBust(data.id)).catch(() => {
            //    return images.defaultRobloxProfile;
            //});

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

            ctx.textAlign = 'left';
            ctx.fillStyle = 'white';
            ctx.font = 'bold 25px Poppins, Twemoji';
            ctx.fillText(`${data.displayName}`, 130, 55);

            ctx.fillStyle = '#bdbdbd';
            ctx.font = '20px Poppins';
            ctx.fillText(`@${data?.name}`, 130, 85);

            ctx.fillStyle = '#bdbdbd';
            ctx.font = 'italic 22px Poppins';
            ctx.textAlign = 'center';
            ctx.fillText('Your stats will be here!', canvas.width / 2, canvas.height / 2 + 30);
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
            700 - (ctx.measureText(`jtoh.pro/preview/${data.name}`).width + 55),
            -10,
            ctx.measureText(`jtoh.pro/preview/${data.name}`).width + 18,
            35,
            { bottomLeft: 10, bottomRight: 0, topLeft: 0, topRight: 0 }
        );

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(
            `jtoh.pro/preview/${data.name}`,
            700 - (ctx.measureText(`jtoh.pro/preview/${data.name}`).width + 55) + 10,
            15
        );

        const image = canvas.toBuffer('image/png');
        context.header('Content-Type', 'image/png');

        // @ts-expect-error
        return context.body(await new Blob([image]).arrayBuffer());
    });
}
