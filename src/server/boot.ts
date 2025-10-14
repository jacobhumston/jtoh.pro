/**
 * Main file of the server, responsible for starting the server.
 *
 * Authored by Jacob Humston
 */
import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { secureHeaders } from 'hono/secure-headers';

import { readdirSync } from 'node:fs';

import config from './config';
import { getBooleanArg } from './managers/argv';
import { buildFrontend, hotReloadFrontend, serveStatic } from './managers/web';
import { cleanUpLogs, log } from './modules/logger';

// create the hono application
const app = new OpenAPIHono({ strict: true });

// log cleanup
cleanUpLogs();

// utility middlewares
app.use(secureHeaders());

// use Scalar middleware for api docs
// we also need to expose the spec information
app.doc31('/api/spec', {
    openapi: '3.1.0',
    info: { title: 'jtoh.pro API', version: '1', contact: { email: 'support@jtoh.pro', name: 'jtoh.pro Support' } }
});
app.use('/api', Scalar({ url: '/api/spec', showToolbar: 'never' }));

// call the handler method for each route
for (const route of readdirSync('src/server/routes/', { recursive: true, withFileTypes: true })) {
    if (!route.isFile()) continue;
    // no error handling for missing handlers as we want that issue to crash the application
    const file: { handler: (app: OpenAPIHono) => Promise<any> | any } = await import(
        `${route.parentPath.replace('src/server/', './')}/${route.name}`
    );
    file.handler(app);
}

// build and serve pages/assets/etc
// this should always be the last step as this also handles 404s
await buildFrontend();
serveStatic(app);

// hot reloading for development
if ((await getBooleanArg('hot-build')) === true)
    (hotReloadFrontend(), log('info', 'Hot reloading enabled for the frontend.'));

// export server options for bun
export default { fetch: app.fetch, port: config.serverPort } satisfies Bun.Serve.Options<any>;

// log config for convenience
log('info', `Server started with the following config: ${JSON.stringify(config)}`);
