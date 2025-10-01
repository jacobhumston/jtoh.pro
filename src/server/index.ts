/**
 * Main file of the server, responsible for starting the server.
 *
 * Authored by Jacob Humston
 */
import { Hono } from 'hono';

import { serverPort, isDev, serverURL } from './config';
import { buildWebPages, serveStatic } from './managers/web';

const app = new Hono({ strict: true });

// build and serve pages/assets/etc
// this should always be the last step as this also handles 404s
await buildWebPages();
serveStatic(app);

console.log(serverPort, serverURL, isDev);
export default { fetch: app.fetch, port: serverPort } as Bun.Serve;
