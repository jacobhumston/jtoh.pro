import { Hono } from 'hono';
import tweetnacl from 'tweetnacl';
import { discordInteractionsApplicationId, discordInteractionsPublicKey, discordInteractionsToken } from '../tokens';
import fs from 'node:fs';
import logger from '../logger';
import { getURL } from '../dev';
import * as discord from 'discord.js';
import { generalLogsWebhook } from '../events';

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
    if (commandPath.startsWith('_')) {
        logger.info('Skipping command "' + commandPath + "'");
        continue;
    }
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
                    commandExecutions[command.name](data);
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

    app.post('/api/discord-events', async (context) => {
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

        context.res.headers.set('Content-Type', 'application/json');

        const data: discord.APIWebhookEvent = JSON.parse(body);
        if (data.type === discord.ApplicationWebhookType.Ping) return new Response(null, { status: 204 });
        if (data.type === discord.ApplicationWebhookType.Event) {
            const event = data.event;
            if (
                event.type === discord.ApplicationWebhookEventType.ApplicationAuthorized &&
                event.data.integration_type !== undefined
            ) {
                const eventData = event.data;
                const embed = new discord.EmbedBuilder();
                embed.setTitle('Discord Bot Installed');
                embed.addFields(
                    { name: 'User', value: `${eventData.user.username} \`${eventData.user.id}\``, inline: true },
                    { name: 'Scopes', value: eventData.scopes.map((s) => `\`${s}\``).join(', '), inline: true },
                    {
                        name: 'Guid',
                        value: eventData.guild
                            ? `${eventData.guild.name} \`${eventData.guild.id}\`\n* Owner ID: \`${eventData.guild.owner_id}\` \n* Vanity? ${eventData.guild.vanity_url_code ? `https://discord.gg/${eventData.guild.vanity_url_code}` : 'No'}`
                            : 'Guild N/A (User Install)',
                        inline: false
                    }
                );
                generalLogsWebhook.send({ embeds: [embed] }).catch(logger.info);
            }
        }

        return new Response(null, { status: 204 });
    });
}
