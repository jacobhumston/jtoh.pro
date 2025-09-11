import * as discord from 'discord.js';
import { jacobsAssistantDiscordToken } from '../src/tokens';
import * as kaokun from 'kaokun';
// @ts-ignore
import prettySeconds from 'pretty-seconds';
import process from 'node:process';

const client = new discord.Client({
    intents: [
        discord.GatewayIntentBits.Guilds,
        discord.GatewayIntentBits.GuildMembers,
        discord.GatewayIntentBits.GuildMessages,
        discord.GatewayIntentBits.MessageContent
    ]
});
await client.login(jacobsAssistantDiscordToken);

const logChannel = (await client.channels.fetch('1276772986858373290')) as discord.TextChannel;
const server = await client.guilds.fetch('1275534337625952428');
const unverifiedChannel = (await await client.channels.fetch('1414822254868434974')) as discord.TextChannel;

let joinCheckEnabled: boolean = true;

client.on('guildMemberAdd', async (member) => {
    if (member.guild.id !== server.id) return;

    if (!joinCheckEnabled) return;

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    if (member.user.createdAt.getTime() >= weekAgo) {
        const res = await member.ban({ reason: 'new account' }).catch(() => null);
        if (res === null) return;
        logChannel
            .send({ content: `Banned <@${member.id}> due to the account being new. ${member.id}` })
            .catch(() => null);
    }
});

const alreadySentTable: any = {};
const sentMessagesAsUnverified: any = {};

client.on('messageCreate', async (message) => {
    if (!message.guild || !message.member) return;
    if (message.guild.id !== server.id) return;

    if (message.member.roles.cache.has('1285278619735818321')) {
        if (message.content === '$$debug') {
            const container = new discord.ContainerBuilder();
            container.addTextDisplayComponents((text) => text.setContent('**Debug Info**'));
            container.addTextDisplayComponents((text) =>
                text.setContent(`\`\`\`ts
>         joinCheckEnabled : ${joinCheckEnabled}
>         alreadySentTable : Array<${Object.keys(alreadySentTable).length}>
> sentMessagesAsUnverified : Array<${Object.keys(sentMessagesAsUnverified).length}>
>               (i)   ping : ${client.ws.ping.toPrecision(2)}ms
>               (i)   user : ${client.user?.username} (${client.user?.id})
>               (i) uptime : ${prettySeconds(process.uptime())}
\`\`\``)
            );

            await message
                .reply({ flags: discord.MessageFlags.IsComponentsV2, components: [container] })
                .catch(() => null);
        } else if (message.content === '$$clean') {
            for (const key of Object.keys(alreadySentTable)) {
                delete alreadySentTable[key];
            }
            for (const key of Object.keys(sentMessagesAsUnverified)) {
                delete sentMessagesAsUnverified[key];
            }
            await message.reply('Cleaned!').catch(() => null);
        } else if (message.content === '$$toggle-jc') {
            joinCheckEnabled = !joinCheckEnabled;
            await message.reply('Join check has been toggled! New Value: `' + joinCheckEnabled.toString() + '`');
        } else if (message.content === '$$help') {
            await message
                .reply(
                    `Commands: 
* \`$$help\` - Help command.
* \`$$clean\` - Clean tables.
* \`$$debug\` - Debug information. (View config.)
* \`$$toggle-jc\` - Toggle join check. (If \`false\`, account age check will be disabled.)`
                )
                .catch(() => null);
        }
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
    unverifiedChannel
        .send(
            `Hey <@${message.member.id}>! Thank you for joining us! Before you can send messages, please run </verify:1014483275626070066> to verify yourself. \n-# If you are having trouble, see: https://www.towerstats.com/blog#post/how-to-verify`
        )
        .catch(() => null);
});

function updateStatus() {
    try {
        client.user?.setStatus('idle');
        client.user?.setActivity(`${kaokun.happy(undefined, 8)}`, { type: discord.ActivityType.Custom });
    } catch {
        // no
    }
}

updateStatus();
setInterval(updateStatus, 10 * 60 * 1000);
