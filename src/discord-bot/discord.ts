import { Hono } from 'hono';
import tweetnacl from 'tweetnacl';
import { discordInteractionsApplicationId, discordInteractionsPublicKey, discordInteractionsToken } from '../tokens';
import fs from 'node:fs';
import logger from '../logger';
import { getURL } from '../dev';
import * as discord from 'discord.js';

export const discordAPIURL = 'https://discord.com/api/v10';
export const commands: discord.SlashCommandBuilder[] = [];
export const commandExecutions: {
    [key: string]: (interaction: discord.APIApplicationCommandInteraction) => Promise<void>;
} = {};

for (const commandPath of fs.readdirSync('src/discord-bot/commands/')) {
    const { command, execute } = await import(`./commands/${commandPath}`);
    commands.push(command);
    commandExecutions[command.toJSON().name] = execute;
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
                commandExecutions[command.name](data);
                return context.json({
                    type: discord.InteractionResponseType.DeferredChannelMessageWithSource,
                    data: { flags: discord.MessageFlags.IsComponentsV2 }
                });
            }
        }

        return context.json({
            type: discord.InteractionResponseType.ChannelMessageWithSource,
            data: { content: "I'm unable to respond to this interaction." }
        }) as any;
    });
}
