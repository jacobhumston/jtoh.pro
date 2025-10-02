/**
 * Main file of the server, responsible for starting the server.
 *
 * Authored by Jacob Humston
 */
import { Hono } from 'hono';

import config from './config';
import { buildWebPages, serveStatic } from './managers/web';

const app = new Hono({ strict: true });

// build and serve pages/assets/etc
// this should always be the last step as this also handles 404s
await buildWebPages();
serveStatic(app);

console.log(config);
export default { fetch: app.fetch, port: config.serverPort } as Bun.Serve;
