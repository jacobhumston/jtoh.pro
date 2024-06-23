import http from 'node:http';
import https from 'node:https';
import express from 'express';
import fs from 'node:fs';
import helmet from 'helmet';
import { checkOwnedBadgesLarge } from './modules/badgeOwnership.js';
import getPort from 'get-port';
import open from 'open';
import { rateLimit } from 'express-rate-limit';
import { idToUser, usernameToUser } from './modules/user.js';

const config = JSON.parse(fs.readFileSync('config.json'));

const server = express();
server.disable('x-powered-by');
server.enable('strict routing');
server.enable('case sensitive routing');
server.disable('trust proxy');
if (config.server.mode === 'production') server.set('env', 'production');

let baseUrl = 'https://jtoh.pro';

if (config.server.mode === 'production') {
    server.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                    'img-src': ["'self'", 'tr.rbxcdn.com', 't7.rbxcdn.com']
                }
            }
        })
    );
}

server.use(
    rateLimit({
        windowMs: 2 * 60 * 1000,
        limit: 250,
        validate: { xForwardedForHeader: false },
        message: {
            error: 'Too many requests.',
            note: "If you're receiving this often, please send an email to lovelyjacob@aol.com, thank you!"
        }
    })
);

server.use(express.static('src/client/', { extensions: 'html' }));

server.get('/api/badges/:id', async function (request, response) {
    try {
        const time = new Date().getTime();
        const user = await idToUser(request.params.id);
        const badges = JSON.parse(fs.readFileSync('data/badges.json').toString('utf-8')).badges;
        const badgeIds = badges.map((badge) => badge.id);
        const result = await checkOwnedBadgesLarge(request.params.id, badgeIds);
        result.forEach((badge) => {
            const badgeDetails = badges.find((b) => b.id === badge.id);
            badge.details = {
                name: badgeDetails.name,
                description: badgeDetails.description,
                enabled: badgeDetails.enabled,
                created: badgeDetails.created,
                awardedCount: badgeDetails.statistics.awardedCount,
                winRatePercentage: badgeDetails.statistics.winRatePercentage,
                imageUrl: badgeDetails.imageUrl,
                isOld: badgeDetails.old,
                source: badgeDetails.source
            };
        });
        response.send({
            time: new Date().getTime() - time,
            user: user,
            result: result
        });
    } catch (error) {
        response.status(400).send({ error: 'Failed to fetch badges.' });
    }
});

server.get('/api/username-redirect/:type/:username', async function (request, response) {
    try {
        const user = await usernameToUser(request.params.username);
        if (request.params.type === 'badges') {
            response.redirect(`${baseUrl}/api/badges/${user.id}`);
        } else {
            response.status(400).send({ error: 'Invalid redirect type.' });
        }
    } catch {
        response.status(400).send({ error: 'Invalid username.' });
    }
});

server.get('/api/username-to-user/:username', async function (request, response) {
    try {
        const user = await usernameToUser(request.params.username);
        response.send({ passed: true, user: user });
    } catch {
        response.send({ passed: false, user: null });
    }
});

server.get('/api/id-to-user/:id', async function (request, response) {
    try {
        const user = await idToUser(request.params.id);
        response.send({ passed: true, user: user });
    } catch {
        response.send({ passed: false, user: null });
    }
});

server.use(function (_, response) {
    response.status(404).send({ error: '404 - Requested URL not found.' });
});

if (config.server.mode === 'development') {
    const port = await getPort({ port: 80 });
    http.createServer(server).listen(port, () => console.log(`Listening on port ${port}.`));
    baseUrl = `http://localhost:${port}`;
    open(`http://localhost:${port}`);
} else if (config.server.mode === 'production') {
    const port = 443;
    https
        .createServer(
            {
                key: fs.readFileSync(config.server.keyPath),
                cert: fs.readFileSync(config.server.certPath)
            },
            server
        )
        .listen(port, () => console.log(`Listening on port ${port}.`));
} else {
    console.log('An invalid server.mode was provided. Please check your configuration file.');
}
