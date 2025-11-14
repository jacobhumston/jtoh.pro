/**
 * This script manages the Discord bot.
 *
 * Authored by Jacob Humston
 */
import type { OpenAPIHono } from '@hono/zod-openapi';
import build from 'dressed/build';
import { rmSync } from 'node:fs';

import handleDiscordRequests from './requests';

/**
 * Boot up the Discord bot.
 * @param app The server's hono app.
 */
export async function bootDiscordBot(app: OpenAPIHono) {
    // compile commands
    const buildResults = await build({ build: { root: 'src/server/discord/' }});

    // delete '.dressed' directory
    rmSync('.dressed', { force: true, recursive: true });

    // clear console
    console.clear();

    // handle requests
    handleDiscordRequests(app, buildResults);
}
