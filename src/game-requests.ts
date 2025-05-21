import type { Hono } from 'hono';
import { verifyContext } from './captcha';
import { getRobloxPlacesDetails } from './roblox';
import { getRobloxGamesUniverseIds } from './game-badges';
import { createGameRequestsFile } from './files';
import fs from 'node:fs';
import { getSignedInRobloxUser } from './login-auth';
import { octokit } from './github-app';

export default function (app: Hono) {
    app.post('/api/request-game', async (context) => {
        const captchaError = await verifyContext(context);
        if (captchaError) return captchaError;

        const user = await getSignedInRobloxUser(context);
        if (!user) return context.json({ error: 'User not logged in.' }, 401) as any;

        const url = decodeURIComponent(context.req.query('url') ?? '');
        if (!url) return context.json({ error: 'No URL provided.' }, 400) as any;
        let parsedURL: URL;

        try {
            parsedURL = new URL(url);
        } catch {
            return context.json({ error: 'Invalid URL provided.' }, 400) as any;
        }

        if (parsedURL.hostname !== 'www.roblox.com') {
            return context.json({ error: 'URL must be from www.roblox.com.' }, 400) as any;
        }

        const match = parsedURL.pathname.match(/^\/games\/(\d+)/);
        if (!match) {
            return context.json({ error: 'Could not extract game ID from URL.' }, 400) as any;
        }
        const gameId = match[1];

        const gameDetails = (await getRobloxPlacesDetails([parseInt(gameId)]))[0];
        if (!gameDetails) {
            return context.json({ error: 'Could not retrieve game details.' }, 400) as any;
        }

        const listedUniverseIds = await getRobloxGamesUniverseIds();
        const alreadyRequestedUniverseIds = JSON.parse(fs.readFileSync(createGameRequestsFile(), 'utf-8'));
        if (
            listedUniverseIds.universeIds.includes(gameDetails.universeId) ||
            alreadyRequestedUniverseIds.includes(gameDetails.universeId)
        ) {
            return context.json({ error: 'Game is already listed, or has already been requested.' }, 400) as any;
        }

        await octokit.rest.issues.create({
            owner: 'jacobhumston',
            repo: 'data.jtoh.pro',
            title: `Game Request: ${gameDetails.name}`,
            body: `A game request has been submitted by [@${user.username}](https://www.roblox.com/users/${user.id}/profile).
The requested game is [${gameDetails.name.trim()}](https://www.roblox.com/games/${gameId}).

Additional details:
\`\`\`json
${JSON.stringify(gameDetails, null, 4)}
\`\`\``
        });

        fs.writeFileSync(
            createGameRequestsFile(),
            JSON.stringify([...alreadyRequestedUniverseIds, gameDetails.universeId])
        );

        return context.json({ success: true, url: parsedURL.toString() });
    });
}
