import http from 'node:http';
import https from 'node:https';
import express from 'express';
import fs from 'node:fs';
import helmet from 'helmet';

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
    response.send('soon :) ~ LovelyJacob');
});

if (config.server.mode === 'development') {
    const port = 80;
    http.createServer(server).listen(port, () => console.log(`Listening on port ${port}.`));
} else if (config.server.mode === 'production') {
    const port = 443;
    https
        .createServer(
            {
                key: fs.readFileSync(config.server.key),
                cert: fs.readFileSync(config.server.cert)
            },
            server
        )
        .listen(port, () => console.log(`Listening on port ${port}.`));
}
