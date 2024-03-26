import http from 'node:http';
import https from 'node:https';
import express from 'express';
import fs from 'node:fs';
import helmet from 'helmet';
import { checkOwnedBadgesLarge } from './modules/badgeOwnership.js';
import getPort from 'get-port';
import open from 'open';
import { rateLimit } from 'express-rate-limit';

const config = JSON.parse(fs.readFileSync('config.json'));

const server = express();
server.disable('x-powered-by');
server.enable('strict routing');
server.enable('case sensitive routing');
server.disable('trust proxy');
if (config.server.mode === 'production') server.set('env', 'production');

server.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                'img-src': ["'self'", 'api.biggamesapi.io']
            }
        }
    })
);

server.use(
    rateLimit({
        windowMs: 2 * 60 * 1000,
        limit: 100,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        validate: { xForwardedForHeader: false }
    })
);

server.use(express.static('src/client/', { extensions: 'html' }));

server.get('/api/badge-check/:id', async function (request, response) {
    if (isNaN(parseInt(request.params.id))) {
        return response.status(400).send({ error: 'Invalid user id.' });
    }
    if (parseInt(request.params.id) <= 0 || parseInt(request.params.id) > 999999999999999) {
        return response.status(400).send({ error: 'User id out of range.' });
    }
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
            imageUrl: `https://api.biggamesapi.io/image/${badgeDetails.iconImageId}`
        };
    });
    response.send(result);
});

server.use(function (_, response) {
    response.status(404).send({ error: '404 - Requested URL not found.' });
});

if (config.server.mode === 'development') {
    const port = await getPort({ port: 80 });
    http.createServer(server).listen(port, () => console.log(`Listening on port ${port}.`));
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
