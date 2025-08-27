import { Client, TextChannel, Message } from 'discord.js-selfbot-v13';
import { discordSelfBotToken } from './tokens';
const client = new Client();
const token = discordSelfBotToken;

await client.login(token);

/**
 * Creates a message collector on the specified channel.
 * @param channelId The channel ID to create the collector on.
 * @param onmessage The callback to call when a message is collected.
 */
export const createMessageCollector = async (
    channelId: string,
    onmessage: (message: Message) => void | Promise<void>
) => {
    const channel = (await client.channels.fetch(channelId)) as TextChannel;
    const collector = channel.createMessageCollector();
    collector.on('collect', onmessage);
};
