/**
 * This file handles requests sent by Discord.
 *
 * Authored by Jacob Humston
 */
import type { OpenAPIHono } from '@hono/zod-openapi';
import build from 'dressed/build';
import { handleRequest } from 'dressed/server';

/**
 * Handle discord requests.
 * @param app The server's hono app.
 */
export default function handleDiscordRequests(app: OpenAPIHono, buildResults: Awaited<ReturnType<typeof build>>) {
    app.post('/api/discord', (context) =>
        handleRequest(context.req.raw, buildResults.commands, buildResults.components, buildResults.events)
    );
}
