import { convertTo } from '@jacobhumston/tc.js';
import { createChallenge } from 'altcha-lib';
import type { Hono } from 'hono';
import { cors } from 'hono/cors';
import { hmac, maxNumber, verifyCaptcha } from './captcha';
import { gameNamesArray, type gameNames } from './shared/gamelist';
import { getURL } from './dev';
import { getTempToken } from './temp-tokens';
import { secureHeaders } from 'hono/secure-headers';

export default async function embed(app: Hono) {
    app.use('/api/embeddable/*', cors({ origin: '*' }), secureHeaders({ crossOriginResourcePolicy: 'cross-origin' }));
    app.use('/embeddable/*', cors({ origin: '*' }), secureHeaders({ crossOriginResourcePolicy: 'cross-origin' }));

    app.get('/api/embeddable/get-captcha', async (context) => {
        const challenge = await createChallenge({
            hmacKey: hmac,
            expires: new Date(Date.now() + convertTo({ minutes: 10 }, 'milliseconds')),
            maxNumber: maxNumber
        });

        return context.json(challenge);
    });

    app.get('/api/embeddable/get-image/:game/:username', async (context) => {
        const token = context.req.query('captcha') ?? '';
        if (!(await verifyCaptcha(token))) return context.json({ error: 'Captcha failed, please try again.' }, 400);

        const game: gameNames = context.req.param('game') as gameNames;
        const username = context.req.param('username');

        if (!game || !username) return context.json({ error: 'Missing game or username' }, 400);
        if (!gameNamesArray.includes(game)) return context.json({ error: 'Invalid game' }, 400);

        const queries = new URLSearchParams(context.req.query());
        queries.delete('captcha');

        const path = `${getURL()}/${game === 'etoh' ? '' : game}/${username}?rlb-token=${getTempToken('rlb-token')}&${queries.toString()}`;
        const response = await fetch(path);

        if (!response.ok) {
            return context.json({ error: 'Failed to fetch image' }, 500);
        }

        const blob = await response.blob();
        context.header('Content-Type', 'image/png');
        return context.body(await blob.arrayBuffer());
    });
}
