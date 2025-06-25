import * as discord from 'discord.js';
import { rest } from '../rest';
import { discordInteractionsApplicationId } from '../../tokens';
import { fullNamesArray, gameNamesArray, type gameNames } from '../../shared/gamelist';
import { getURL } from '../../dev';
import { parseRobloxAccountV2 } from '../../login-auth';
import { autocompleteUserSelection, getFocusedOptionName } from '../autocomplete';
import { addRecent } from '../util';

export const command = new discord.SlashCommandBuilder()
    .setName('card')
    .setDescription('Get a stat card for a user.')
    .setContexts([
        discord.InteractionContextType.BotDM,
        discord.InteractionContextType.PrivateChannel,
        discord.InteractionContextType.Guild
    ])
    .setIntegrationTypes([
        discord.ApplicationIntegrationType.GuildInstall,
        discord.ApplicationIntegrationType.UserInstall
    ]);

gameNamesArray.forEach((game, index) => {
    command.addSubcommand((subcommand) => {
        subcommand
            .setName(game)
            .setDescription(`Get a stat card for ${fullNamesArray[index]}.`)
            .addStringOption((option) =>
                option
                    .setName('user')
                    .setDescription('The user to get the card for.')
                    .setRequired(true)
                    .setAutocomplete(true)
            );
        if (game === 'cscd')
            subcommand.addStringOption((option) =>
                option
                    .setName('mode')
                    .setDescription('The mode to get the card for.')
                    .setRequired(false)
                    .setChoices([
                        { name: 'All Jumps', value: 'aj' },
                        { name: 'Legit', value: 'legit' }
                    ])
            );
        return subcommand;
    });
});

export async function execute(interaction: discord.APIChatInputApplicationCommandInteraction) {
    const form = new FormData();

    if (!interaction.data.options) return;

    if (interaction.data.options[0].type !== discord.ApplicationCommandOptionType.Subcommand) return;
    if (interaction.data.options[0].options === undefined) return;

    const game = interaction.data.options[0].name;
    const username = interaction.data.options[0].options[0].value;

    const fullGameName = fullNamesArray[gameNamesArray.indexOf(game as gameNames)];

    const container = new discord.ContainerBuilder();
    const user = await parseRobloxAccountV2(username as string);

    if (user) {
        await addRecent(interaction, user.name);

        let url = new URL(`${getURL()}${game === 'etoh' ? '' : '/' + game}/${user.name}`);
        if (game === 'cscd' && interaction.data.options[0].options[1]) {
            const mode = interaction.data.options[0].options[1].value as string;
            if (mode) url.searchParams.append('mode', mode);
        }

        const image = await fetch(url.toString()).catch(() => null);
        if (image === null || image.status !== 200) {
            container.addTextDisplayComponents((text) =>
                text.setContent(`**Failed to fetch image.** This is unlikely to be your fault. Please try again.`)
            );

            container.addActionRowComponents((row) =>
                row.addComponents(
                    new discord.ButtonBuilder()
                        .setStyle(discord.ButtonStyle.Link)
                        .setLabel('Get Support')
                        .setURL(`https://discord.jtoh.pro`)
                )
            );
        } else {
            form.append('files[0]', await image.blob(), `jtoh-pro-card-${user.name}.png`);
            container.addTextDisplayComponents((text) =>
                text.setContent(
                    `**Here is your card!**\n-# ${fullGameName} card for [${user.name}](https://roblox.com/users/${user.id}/profile).`
                )
            );
            container.addMediaGalleryComponents((media) =>
                media.addItems((builder) => builder.setURL(`attachment://jtoh-pro-card-${user.name}.png`))
            );
            container.addActionRowComponents((row) =>
                row.addComponents(
                    new discord.ButtonBuilder()
                        .setStyle(discord.ButtonStyle.Link)
                        .setLabel('Image URL')
                        .setURL(url.toString()),
                    new discord.ButtonBuilder()
                        .setStyle(discord.ButtonStyle.Link)
                        .setLabel('Web Controls')
                        .setURL(`${getURL()}/app/${game}?user=${user.name}`),
                    new discord.ButtonBuilder()
                        .setStyle(discord.ButtonStyle.Link)
                        .setLabel('TowerStats Profile')
                        .setURL(`${getURL()}/towerstats/${game}/${user.name}`)
                )
            );
            container.addTextDisplayComponents((text) =>
                text.setContent(
                    `-# Card generated by [jtoh.pro](${getURL()}) with stats provided by [TowerStats.com](https://towerstats.com).`
                )
            );
        }
    } else {
        container.addTextDisplayComponents((text) => {
            text.setContent(`**The user you requested does not exist.** Please try again.

Available User Options: 
- \`{Roblox Username}\`
- \`!{Roblox User ID}\`
-# *(Do not include the brackets.)*
                `);
            return text;
        });

        container.addActionRowComponents((row) =>
            row.addComponents(
                new discord.ButtonBuilder()
                    .setStyle(discord.ButtonStyle.Link)
                    .setLabel('Need Help?')
                    .setURL(`https://discord.jtoh.pro`)
            )
        );
    }

    const payload: discord.RESTPostAPIInteractionFollowupJSONBody = {
        components: [container.toJSON()],
        flags: discord.MessageFlags.IsComponentsV2
    };
    form.set('payload_json', JSON.stringify(payload));

    await rest
        .patch(discord.Routes.webhookMessage(discordInteractionsApplicationId, interaction.token, '@original'), {
            body: form,
            passThroughBody: true
        })
        .catch(console.log);
}

export async function autocomplete(
    interaction: discord.APIApplicationCommandAutocompleteInteraction
): Promise<discord.APICommandAutocompleteInteractionResponseCallbackData> {
    const focusedOptionName = getFocusedOptionName(interaction);
    if (focusedOptionName !== 'user') return { choices: [] };
    return await autocompleteUserSelection(interaction);
}
