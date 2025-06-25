import { Hono } from 'hono';
import tweetnacl from 'tweetnacl';
import { discordInteractionsApplicationId, discordInteractionsPublicKey, discordInteractionsToken } from '../tokens';
import fs from 'node:fs';
import logger from '../logger';
import { getURL } from '../dev';
import * as discord from 'discord.js';
import { wait } from '../util';
import { rest } from './rest';
import { getUserId } from './util';
import { discordBotConfigDB } from '../db';

export const discordAPIURL = 'https://discord.com/api/v10';
export const commands: discord.SlashCommandBuilder[] = [];

export const commandExecutions: {
    [key: string]: (interaction: discord.APIApplicationCommandInteraction) => Promise<void>;
} = {};

export const autocompleteExecutions: {
    [key: string]: (
        interaction: discord.APIApplicationCommandAutocompleteInteraction
    ) => Promise<discord.APICommandAutocompleteInteractionResponseCallbackData>;
} = {};

export const isEphemeral: {
    [key: string]: boolean;
} = {};

for (const commandPath of fs.readdirSync('src/discord-bot/commands/')) {
    const { command, execute, autocomplete, ephemeral } = await import(`./commands/${commandPath}`);
    commands.push(command);
    try {
        commandExecutions[command.toJSON().name] = execute;
        if (autocomplete) autocompleteExecutions[command.toJSON().name] = autocomplete;
        if (ephemeral) isEphemeral[command.toJSON().name] = ephemeral;
    } catch (e) {
        logger.error(`Failed to load command ${commandPath}: ${e}`);
        process.exit(1);
    }
}

export async function publishDiscordCommands() {
    const commandString = JSON.stringify(commands.map((command) => command.toJSON()));
    const commandHash = getURL() + '\n' + btoa(commandString);
    if (!fs.existsSync('cache/')) fs.mkdirSync('cache/');
    if (!fs.existsSync('cache/discord-commands')) fs.writeFileSync('cache/discord-commands', '');

    const cache = fs.readFileSync('cache/discord-commands', 'utf-8');
    if (cache === commandHash) {
        logger.info('Discord commands are already up to date.');
        return;
    }

    logger.info('Publishing Discord commands...');
    fs.writeFileSync('cache/discord-commands', commandHash);

    const appId = discordInteractionsApplicationId;
    const url = `${discordAPIURL}/applications/${appId}/commands`;
    return fetch(url, {
        method: 'PUT',
        headers: {
            Authorization: `Bot ${discordInteractionsToken}`,
            'Content-Type': 'application/json'
        },
        body: commandString
    });
}

export default function discordInteractions(app: Hono) {
    app.post('/api/discord-interactions', async (context) => {
        const signature = context.req.header('X-Signature-Ed25519') ?? '';
        const timestamp = context.req.header('X-Signature-Timestamp') ?? '';
        let body = await context.req.text();

        if (!signature || !timestamp || !body) {
            return context.json({ error: 'Invalid request.' }, 400);
        }

        const isVerified = tweetnacl.sign.detached.verify(
            // @ts-ignore
            Buffer.from(timestamp + body),
            Buffer.from(signature, 'hex'),
            Buffer.from(discordInteractionsPublicKey, 'hex')
        );

        if (!isVerified) {
            return context.json({ error: 'Invalid request.' }, 400);
        }

        const data: discord.APIInteraction = JSON.parse(body);
        if (data.type === discord.InteractionType.Ping) {
            return context.json({ type: discord.InteractionResponseType.Pong });
        } else if (data.type === discord.InteractionType.ApplicationCommand) {
            const command = commands.find((cmd: any) => cmd.name === data.data.name);
            if (command) {
                new Promise(async () => {
                    await wait({ seconds: 1 });
                    const response = await rest
                        .get(discord.Routes.webhookMessage(discordInteractionsApplicationId, data.token, '@original'))
                        .catch(() => null);
                    if (response) {
                        commandExecutions[command.name](data);
                    } else {
                        const config = (await discordBotConfigDB.get(`${getUserId(data)}`)) ?? {};
                        config.dm_notifs = config.dm_notifs ?? [];
                        if (config.dm_notifs.includes('command_timeout')) return;
                        config.dm_notifs.push('command_timeout');
                        const channel = await rest
                            .post(discord.Routes.userChannels(), {
                                body: JSON.stringify({ recipient_id: getUserId(data) }),
                                passThroughBody: true,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            })
                            .catch(console.error);
                        if (!channel) return;
                        const res = await rest
                            // @ts-ignore
                            .post(discord.Routes.channelMessages(channel.id), {
                                body: JSON.stringify({
                                    content: `Hello! You are receiving this message because you attempted to execute a command, however we did not respond in time.\n-# Discord requires applications to respond within 3 seconds.\n\nIf this is happening frequently, please let us know!\nYou will only receive this message once. \n-# Note that if you receive the error again, it's for the same reason as stated above.\n\n*The command did not execute and no data was modified, created, or deleted. Please try again.*`
                                }),
                                passThroughBody: true,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            })
                            .catch(console.error);
                        if (res) await discordBotConfigDB.set(`${getUserId(data)}`, config);
                        logger.error(`Failed to execute command ${command.name}: Interaction response not found.`);
                    }
                });

                const flags = isEphemeral[command.name]
                    ? discord.MessageFlags.IsComponentsV2 | discord.MessageFlags.Ephemeral
                    : discord.MessageFlags.IsComponentsV2;

                return context.json({
                    type: discord.InteractionResponseType.DeferredChannelMessageWithSource,
                    data: { flags: flags }
                });
            }
        } else if (data.type === discord.InteractionType.ApplicationCommandAutocomplete) {
            const command = commands.find((cmd: any) => cmd.name === data.data.name);
            if (command && autocompleteExecutions[command.name]) {
                return context.json({
                    type: discord.InteractionResponseType.ApplicationCommandAutocompleteResult,
                    data: await autocompleteExecutions[command.name](data)
                }) as any;
            } else {
                return context.json({
                    type: discord.InteractionResponseType.ApplicationCommandAutocompleteResult,
                    data: { choices: [] }
                }) as any;
            }
        }

        return context.json({
            type: discord.InteractionResponseType.ChannelMessageWithSource,
            data: { content: "I'm unable to respond to this interaction." }
        }) as any;
    });

    app.get('/api/discord-commands', async (context) => {
        return context.json(commands.map((command) => command.toJSON()));
    });
}
