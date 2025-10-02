/**
 * Main file of the server, responsible for starting the server.
 *
 * Authored by Jacob Humston
 */
import { Hono } from 'hono';

import config from './config';
import { getCLIArgument } from './managers/argv';
import { buildFrontend, serveStatic } from './managers/web';
import { cleanUpLogs, log } from './modules/logger';

// create the hono application
const app = new Hono({ strict: true });

// log cleanup
cleanUpLogs();

// build and serve pages/assets/etc
// this should always be the last step as this also handles 404s
if (((await getCLIArgument('skipBuild', 'boolean', true)) ?? false) === false) await buildFrontend();
serveStatic(app);

// export server options for bun
export default { fetch: app.fetch, port: config.serverPort } as Bun.Serve;

// log config for convenience
log('info', `Server started with the following config: ${JSON.stringify(config)}`);
