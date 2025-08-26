import { Client, TextChannel } from 'discord.js-selfbot-v13';
const client = new Client();
const token = '';

await client.login(token);
const channel = await client.channels.fetch('551938432201654272') as TextChannel;
const collector = channel.createMessageCollector()
collector.on('collect', (message) => {
    console.log(message.content);
})