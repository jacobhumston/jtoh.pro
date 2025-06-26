import * as discord from 'discord.js';
import { rest } from '../rest';
import { discordInteractionsApplicationId } from '../../tokens';
import { discordBotConfigDB } from '../../db';
import { getUserId } from '../util';
import { getURLHost } from '../../dev';
import { randomUUIDv7 } from 'bun';
import fs from 'node:fs';
import archiver from 'archiver';
import { parseRobloxAccountV2 } from '../../login-auth';

export const command = new discord.SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure your bot settings.')
    .setContexts([
        discord.InteractionContextType.BotDM,
        discord.InteractionContextType.PrivateChannel,
        discord.InteractionContextType.Guild
    ])
    .setIntegrationTypes([
        discord.ApplicationIntegrationType.GuildInstall,
        discord.ApplicationIntegrationType.UserInstall
    ]);

command.addSubcommandGroup((group) =>
    group
        .setName('autocomplete')
        .setDescription('Configure your user autocomplete settings.')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('pin')
                .setDescription('Pin a user to your autocompletion.')
                .addStringOption((option) =>
                    option.setName('user').setDescription('The user to pin.').setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName('slot')
                        .setDescription('The slot to pin the user to.')
                        .setRequired(true)
                        .addChoices({ name: '1', value: '1' }, { name: '2', value: '2' }, { name: '3', value: '3' })
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('unpin')
                .setDescription('Unpin a user from your autocompletion.')
                .addStringOption((option) =>
                    option
                        .setName('slot')
                        .setDescription('The slot to unpin from.')
                        .setRequired(true)
                        .addChoices({ name: '1', value: '1' }, { name: '2', value: '2' }, { name: '3', value: '3' })
                )
        )
        .addSubcommand((subcommand) => subcommand.setName('clear').setDescription('Clear your pinned users.'))
        .addSubcommand((subcommand) => subcommand.setName('view').setDescription('View your pinned users.'))
);

command.addSubcommand((subcommand) =>
    subcommand.setName('download').setDescription('Download your data that was stored by the bot.')
);

export async function execute(interaction: discord.APIChatInputApplicationCommandInteraction) {
    const form = new FormData();

    if (!interaction.data.options) return;

    const container = new discord.ContainerBuilder();

    if (interaction.data.options[0].type === discord.ApplicationCommandOptionType.Subcommand) {
        const command = interaction.data.options[0];
        if (command.name === 'download') {
            const storedData = (await discordBotConfigDB.get(`${getUserId(interaction)}`)) ?? {};

            const fileName = `temp/archive-${randomUUIDv7()}.zip`;
            fs.writeFileSync(fileName, '');
            let finished = false;
            const writable = fs.createWriteStream(fileName);
            writable.on('close', () => {
                finished = true;
            });
            const archive = archiver('zip');
            archive.pipe(writable);
            archive.append(JSON.stringify(storedData), {
                name: 'data.json'
            });
            archive.append(
                `>> ACCOUNT DATA REQUEST @ ${getURLHost()} (jtoh.pro Discord Bot)
Account data request for @${interaction.member ? interaction.member?.user.username : interaction.user?.username}.
Requested and delivered on ${new Date().toUTCString()}.
The contents delivered should NOT be shared with anyone.

>> FILE INFORMATION
"data.json" - Data stored by the bot for your Discord account.

>> HAVE QUESTIONS?
Join our support server at https://discord.jtoh.pro
Create a "General Website Support Ticket" in #get-support
            `,
                { name: 'READ-ME.txt' }
            );
            archive.finalize();
            await new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (finished) {
                        clearInterval(interval);
                        resolve(void 0);
                    }
                }, 100);
            });
            const file = fs.readFileSync(fileName);
            const fileData = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as any;
            fs.rmSync(fileName);
            form.set('files[0]', new Blob([fileData], { type: 'application/zip' }), 'jtoh-pro-discord-data.zip');

            container.addTextDisplayComponents((text) =>
                text.setContent('Your data has been prepared and is ready for download.')
            );
            container.addFileComponents((file) => file.setURL('attachment://jtoh-pro-discord-data.zip'));
            container.addTextDisplayComponents((text) =>
                text.setContent(
                    '-# This data is unlikely to include any personal information, however it is recommended that you do not share this data with anyone.'
                )
            );
        } else {
            container.addTextDisplayComponents((text) => text.setContent('Unknown config command.'));
        }
    } else if (
        interaction.data.options[0].type === discord.ApplicationCommandOptionType.SubcommandGroup &&
        interaction.data.options[0].name === 'autocomplete'
    ) {
        const command = interaction.data.options[0].options[0];
        const userId = getUserId(interaction);
        const config = (await discordBotConfigDB.get(`${userId}`)) ?? {};

        if (!config.ac_recent) config.ac_recent = [];
        if (!config.ac_pinned) config.ac_pinned = [];

        if (command.name === 'pin') {
            const user = command.options?.find((opt) => opt.name === 'user')?.value as string;
            const slot = command.options?.find((opt) => opt.name === 'slot')?.value as string;
            const parsedUser = await parseRobloxAccountV2(user);

            if (!user || !slot || !parsedUser) {
                container.addTextDisplayComponents((text) =>
                    text.setContent('Please provide a valid user and slot to pin.')
                );
            } else if (config.ac_pinned.includes(parsedUser.name)) {
                container.addTextDisplayComponents((text) =>
                    text.setContent(`The user ${parsedUser.name} is already pinned.`)
                );
            } else {
                config.ac_pinned[parseInt(slot) - 1] = parsedUser.name;
                config.ac_pinned[0] = config.ac_pinned[0] ?? null;
                config.ac_pinned[1] = config.ac_pinned[1] ?? null;
                config.ac_pinned[2] = config.ac_pinned[2] ?? null;
                await discordBotConfigDB.set(`${userId}`, config);
                container.addTextDisplayComponents((text) =>
                    text.setContent(`📌 Pinned ${parsedUser.name} to slot ${slot}.`)
                );
            }
        } else if (command.name === 'unpin') {
            const slot = command.options?.find((opt) => opt.name === 'slot')?.value as string;

            if (!slot || !config.ac_pinned[parseInt(slot) - 1]) {
                container.addTextDisplayComponents((text) =>
                    text.setContent(
                        'Please provide a valid slot to unpin from.' + !config.ac_pinned[parseInt(slot) - 1]
                            ? ' **The slot is empty.**'
                            : ''
                    )
                );
            } else {
                const originalName = config.ac_pinned[parseInt(slot) - 1];
                config.ac_pinned[parseInt(slot) - 1] = null;
                config.ac_pinned[0] = config.ac_pinned[0] ?? null;
                config.ac_pinned[1] = config.ac_pinned[1] ?? null;
                config.ac_pinned[2] = config.ac_pinned[2] ?? null;
                await discordBotConfigDB.set(`${userId}`, config);
                container.addTextDisplayComponents((text) =>
                    text.setContent(`📌 Unpinned ${originalName} from slot ${slot}.`)
                );
            }
        } else if (command.name === 'clear') {
            config.ac_pinned = [];
            await discordBotConfigDB.set(`${userId}`, config);
            container.addTextDisplayComponents((text) => text.setContent('📌 Cleared all pinned users.'));
        } else if (command.name === 'view') {
            if (config.ac_recent.length === 0) {
                container.addTextDisplayComponents((text) =>
                    text.setContent('⏰ **Recent users:**\n-# No recent users found.')
                );
            } else {
                container.addTextDisplayComponents((text) =>
                    text.setContent(`⏰ **Recent users:**\n* ${config.ac_recent.join('\n * ')}`)
                );
            }

            if (config.ac_pinned.length === 0) {
                container.addTextDisplayComponents((text) =>
                    text.setContent('📌 **Pinned users:**\n-# No pinned users found.')
                );
            } else {
                container.addTextDisplayComponents((text) =>
                    text.setContent(
                        `📌 **Pinned users:**\n* (1) ${config.ac_pinned[0] ?? 'None'}\n* (2) ${config.ac_pinned[1] ?? 'None'}\n* (3) ${config.ac_pinned[2] ?? 'None'}`
                    )
                );
            }
        } else {
            container.addTextDisplayComponents((text) => text.setContent('Unknown config command.'));
        }
    }

    const payload: discord.RESTPostAPIInteractionFollowupJSONBody = {
        components: [container.toJSON()],
        flags: discord.MessageFlags.IsComponentsV2 | discord.MessageFlags.Ephemeral
    };
    form.set('payload_json', JSON.stringify(payload));

    await rest
        .patch(discord.Routes.webhookMessage(discordInteractionsApplicationId, interaction.token, '@original'), {
            body: form,
            passThroughBody: true
        })
        .catch(console.log);
}

export const ephemeral = true;
