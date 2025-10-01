/**
 * Main file of the server, responsible for starting the server.
 *
 * Authored by Jacob Humston
 */

import { Hono } from 'hono';
import { serveStatic } from './managers/web';

const app = new Hono({ strict: true });

serveStatic(app);

export default { fetch: app.fetch, port: 80 } as Bun.Serve;
