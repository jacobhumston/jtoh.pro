/**
 * This script manages the Discord bot.
 *
 * Authored by Jacob Humston
 */
import type { OpenAPIHono } from '@hono/zod-openapi';
import build from 'dressed/build';
import { handleRequest, installCommands } from 'dressed/server';

import { rmSync } from 'node:fs';

import { isDev } from '../config';
import { getBooleanArg } from '../managers/argv';
import { Cache } from '../managers/cache';
import { log } from '../modules/logger';
import apiTokens from '../modules/tokens';

/** Discord bot cache. */
export const botCache = new Cache('discord-bot');

/**
 * Boot up the Discord bot.
 * @param app The server's hono app.
 */
export async function bootDiscordBot(app: OpenAPIHono) {
    // set env variables
    process.env.DISCORD_APP_ID = apiTokens.discordInteractionsApplicationId;
    process.env.DISCORD_PUBLIC_KEY = apiTokens.discordInteractionsPublicKey;
    process.env.DISCORD_TOKEN = apiTokens.discordInteractionsToken;

    // compile commands
    const buildResults = await build({
        build: { root: 'src/server/discord/' }
    });

    // install commands
    // note that we replace uid to prevent the cache from always updating
    if (!isDev && (await getBooleanArg('publishDiscordCommands')) === false) {
        log(
            'warn',
            'Not publishing Discord commands due to being prod. Pass the --publishDiscordCommands flag to bypass.'
        );
    } else {
        if (
            JSON.stringify(
                buildResults.commands.map((c) => {
                    c.uid = '';
                    return c;
                })
            ) !== (await botCache.get('commands'))
        ) {
            await botCache.set(
                'commands',
                JSON.stringify(
                    buildResults.commands.map((c) => {
                        c.uid = '';
                        return c;
                    })
                )
            );

            await installCommands(buildResults.commands);
            log('success', 'Successfully installed Discord bot commands.');
        }
    }

    // delete '.dressed' directory
    rmSync('.dressed', { force: true, recursive: true });

    // handle requests
    app.post('/api/discord', (context) =>
        handleRequest(context.req.raw, buildResults.commands, buildResults.components, buildResults.events)
    );
}
