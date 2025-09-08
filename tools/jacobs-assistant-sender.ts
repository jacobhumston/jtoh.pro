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

client.user?.setStatus('dnd');
client.user?.setActivity('(◠‿◠✿)', { type: discord.ActivityType.Custom });

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
const sentMessagesAsUnverified: any = {};

client.on('messageCreate', async (message) => {
    if (!message.guild || !message.member) return;
    if (message.guild.id !== server.id) return;

    if (message.member.roles.cache.has('1285278619735818321')) {
        if (message.content === '$$debug') {
            let reply = 'Debug info:\n';
            reply += `There are currently ${Object.keys(alreadySentTable).length} users in the alreadySentTable.\n`;
            reply += `There are currently ${Object.keys(sentMessagesAsUnverified).length} users in the sentMessagesAsUnverified table.\n`;
            let totalMessages = 0;
            for (const key of Object.keys(sentMessagesAsUnverified)) {
                totalMessages += sentMessagesAsUnverified[key];
            }
            reply += `A total of ${totalMessages} messages have been sent by unverified users.\n`;
            reply += `Ping: ${Date.now() - message.createdTimestamp}ms\n`;
            await message.reply(reply).catch(() => null);
        } else if (message.content === '$$clean') {
            for (const key of Object.keys(alreadySentTable)) {
                delete alreadySentTable[key];
            }
            for (const key of Object.keys(sentMessagesAsUnverified)) {
                delete sentMessagesAsUnverified[key];
            }
            await message.reply('Cleaned!').catch(() => null);
        }
        return;
    }

    if (message.channel.id === '1276779640995713099' || message.channel.id === '1276772986858373290') return;
    if (message.member.roles.cache.has('1412790450380738660')) return;
    // @ts-expect-error
    if (message.channel.parentId === '1285294306579583006') return;
    await message.delete().catch(() => null);
    if (alreadySentTable[message.member.id]) {
        const messageCount: number = sentMessagesAsUnverified[message.member.id] ?? 0;
        const newCount = messageCount + 1;
        sentMessagesAsUnverified[message.member.id] = newCount;
        if (messageCount > 2) {
            await message.member.timeout(24 * 60 * 60 * 1000).catch(() => null);
            await message.channel
                .send(
                    `<@${message.member.id}> to prevent abuse, you have been timed out for 24 hours.\n-# Note that sending a message again without verifying after your timeout expires will lead to being timed-out again.`
                )
                .catch(() => null);
        }
        return;
    }
    alreadySentTable[message.member.id] = true;
    message.channel
        .send(
            `Hey <@${message.member.id}>! Thank you for joining us! Before you can send messages, please run </verify:1014483275626070066> to verify yourself. \n-# If you are having trouble, make a ticket in <#1285295502811861083>.`
        )
        .catch(() => null);
});
