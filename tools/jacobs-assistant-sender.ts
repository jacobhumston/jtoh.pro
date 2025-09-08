import * as discord from 'discord.js';
import { jacobsAssistantDiscordToken } from '../src/tokens';

const client = new discord.Client({
    intents: [
        discord.GatewayIntentBits.Guilds,
        discord.GatewayIntentBits.GuildMembers,
        discord.GatewayIntentBits.GuildMessages,
        discord.GatewayIntentBits.MessageContent
    ]
});
await client.login(jacobsAssistantDiscordToken);

//const logChannel = (await client.channels.fetch('1276772986858373290')) as discord.TextChannel;
const server = await client.guilds.fetch('1275534337625952428');

/*
client.on('guildMemberAdd', async (member) => {
    if (member.guild.id !== server.id) return;

    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    if (member.user.createdAt.getTime() >= twoWeeksAgo) {
        const timeOutTime = twoWeeksAgo - member.user.createdAt.getTime();
        const res = await member.timeout(timeOutTime, 'New account').catch(() => null);
        if (res === null) return;
        logChannel
            .send({ content: `Timeout applied to <@${member.id}> due to the account being new.` })
            .catch(() => null);
    }
});
*/

const alreadySentTable: any = {};

client.on('messageCreate', async (message) => {
    if (!message.guild || !message.member) return;
    if (message.guild.id !== server.id) return;
    if (message.channel.id === '1276779640995713099') return;
    if (message.member.roles.cache.has('1412790450380738660')) return;
    // @ts-expect-error
    if (message.channel.parentId === '1285294306579583006') return;
    await message.delete().catch(() => null);
    if (alreadySentTable[message.member.id]) return;
    alreadySentTable[message.member.id] = true;
    message.channel
        .send(
            `Hey <@${message.member.id}>! Thank you for joining us! Before you can send messages, please run </verify:1014483275626070066> to verify yourself. \n-# If you are having trouble, make a ticket in <#1285295502811861083>.`
        )
        .catch(() => null);
});
