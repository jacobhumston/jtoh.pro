import * as discord from 'discord.js';
import { jacobsAssistantDiscordToken } from '../src/tokens';
import { createSelfClientMessageCollector } from '../src/discord-bot/self-client-discord';

const client = new discord.Client({ intents: [discord.GatewayIntentBits.Guilds] });
await client.login(jacobsAssistantDiscordToken);

const logChannel = (await client.channels.fetch('1411546549904736378')) as discord.TextChannel;

createSelfClientMessageCollector('551938432201654272', async (message) => {
    if (!message.content.includes('Tower Rush')) return;
    await logChannel.send(message.content).catch(console.error);
});

createSelfClientMessageCollector('617297960035811328', async (message) => {
    if (!message.content.includes('Tower Rush')) return;
    await logChannel.send(message.content).catch(console.error);
});
