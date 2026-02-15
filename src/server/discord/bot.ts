/**
 * This script manages the Discord bot.
 *
 * Authored by Jacob Humston
 */
import type { OpenAPIHono } from '@hono/zod-openapi';
import { verifyKey } from 'discord-interactions';
import { InteractionResponseType, InteractionType, MessageFlags, type APIInteraction } from 'discord.js';

import { parseComponentID, registeredComponentHandlers } from '@discord/components';
import { api } from '@discord/rest';
import { commands } from '@discord/util';
import { Cache } from '@server/managers/cache';
import { log } from '@server/modules/logger';
import apiTokens from '@server/modules/tokens';

/** Discord bot cache. */
export const botCache = new Cache('discord-bot');

/**
 * Listen for requests from Discord.
 * @param app The server's hono app.
 */
export async function listenForDiscordRequests(app: OpenAPIHono) {
    // update commands (if needed)
    const commandData = commands.map((c) => c.command);
    if (JSON.stringify(await botCache.get('commands')) !== JSON.stringify(commandData)) {
        await api.applicationCommands.bulkOverwriteGlobalCommands(
            apiTokens.discordInteractionsApplicationId,
            commandData
        );
        await botCache.set('commands', commandData);
        log('success', 'Published Discord commands.');
    }

    // serve commands
    app.post('/api/discord', async (context) => {
        const data = await context.req.text().catch(() => '');
        const validRequest = await verifyKey(
            data,
            context.req.header('X-Signature-Ed25519') ?? '',
            context.req.header('X-Signature-Timestamp') ?? '',
            apiTokens.discordInteractionsPublicKey
        );

        if (!validRequest) {
            context.status(401);
            return context.text('Invalid request.');
        }

        const json: APIInteraction = await JSON.parse(data);
        if (json.type === InteractionType.Ping) {
            return context.json({ type: InteractionResponseType.Pong });
        } else if (json.type === InteractionType.ApplicationCommand) {
            const foundCommand = commands.find((cmd) => cmd.command.name === json.data.name);
            if (foundCommand) {
                foundCommand.execute(json).catch((error) => {
                    api.interactions
                        .followUp(json.id, json.token, {
                            content: `Something went wrong ${error}`
                        })
                        .catch(() => null);
                });
            } else {
                api.interactions
                    .editReply(json.id, json.token, {
                        content: 'Unknown command.'
                    })
                    .catch(() => null);
            }
            return context.json({ type: InteractionResponseType.DeferredChannelMessageWithSource });
        } else if (json.type === InteractionType.ApplicationCommandAutocomplete) {
        } else if (json.type === InteractionType.MessageComponent) {
            const id = json.data.custom_id;
            const parsed = parseComponentID(id);
            const foundHandler = registeredComponentHandlers.get(parsed.id);
            if (foundHandler) {
                foundHandler.callback(json);
                if (foundHandler.finite === true) registeredComponentHandlers.delete(parsed.id);
            } else {
                api.interactions
                    .followUp(apiTokens.discordInteractionsApplicationId, json.token, {
                        content:
                            'Buttons/dropdowns/etc have expired for this interaction, please run the command again.',
                        flags: MessageFlags.Ephemeral
                    })
                    .catch(() => null);
            }
            return context.json({ type: InteractionResponseType.DeferredMessageUpdate });
        } else if (json.type === InteractionType.ModalSubmit) {
        }

        context.status(200);
        return context.text('OK');
    });
}
