import http from 'node:http';
import https from 'node:https';
import express from 'express';
import fs from 'node:fs';
import helmet from 'helmet';
import { checkOwnedBadgesLarge } from './modules/badgeOwnership.js';

const config = JSON.parse(fs.readFileSync('config.json'));

const server = express();
server.disable('x-powered-by');
server.enable('strict routing');
server.enable('case sensitive routing');
if (config.server.mode === 'production') server.set('env', 'production');
server.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                'img-src': ["'self'"]
            }
        }
    })
);

server.get('/', function (_, response) {
    response.send('soon :) ~ LovelyJacob - To check your badges, open /api/badge-check/userId');
});

server.get('/api/badge-check/:id', async function (request, response) {
    const badges = JSON.parse(fs.readFileSync('data/badges.json').toString('utf-8')).badges.map((badge) => badge.id);
    response.send(await checkOwnedBadgesLarge(request.params.id, badges));
});

if (config.server.mode === 'development') {
    const port = 80;
    http.createServer(server).listen(port, () => console.log(`Listening on port ${port}.`));
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
}
