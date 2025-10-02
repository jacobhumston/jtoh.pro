/**
 * Main file of the server, responsible for starting the server.
 *
 * Authored by Jacob Humston
 */
import { Hono } from 'hono';

import config from './config';
import { getCLIArgument } from './managers/argv';
import { buildFrontend, serveStatic } from './managers/web';

// create the hono application
const app = new Hono({ strict: true });

// build and serve pages/assets/etc
// this should always be the last step as this also handles 404s
if (((await getCLIArgument('skipBuild', 'boolean', true)) ?? false) === false) await buildFrontend();
serveStatic(app);

export default { fetch: app.fetch, port: config.serverPort } as Bun.Serve;
