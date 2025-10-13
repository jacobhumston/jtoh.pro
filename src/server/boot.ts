/**
 * Main file of the server, responsible for starting the server.
 *
 * Authored by Jacob Humston
 */
import { OpenAPIHono } from '@hono/zod-openapi';

import config from './config';
import { getBooleanArg } from './managers/argv';
import './managers/database';
import { buildFrontend, hotReloadFrontend, serveStatic } from './managers/web';
import { cleanUpLogs, log } from './modules/logger';

// create the hono application
const app = new OpenAPIHono({ strict: true });

// log cleanup
cleanUpLogs();

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
