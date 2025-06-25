import * as discord from 'discord.js';
import { rest } from '../rest';
import { discordInteractionsApplicationId } from '../../tokens';
import { fullNamesArray, gameNamesArray, type gameNames } from '../../shared/gamelist';
import { getURL } from '../../dev';
import { parseRobloxAccountV2 } from '../../login-auth';
import { autocompleteUserSelection, getFocusedOptionName } from '../autocomplete';

export const command = new discord.SlashCommandBuilder()
    .setName('embed')
    .setDescription('Get an embed of a stat card for a user.')
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
            .setDescription(`Get an embed of a stat card for ${fullNamesArray[index]}.`)
            .addStringOption((option) =>
                option
                    .setName('user')
                    .setDescription('The user to get the embed for.')
                    .setRequired(true)
                    .setAutocomplete(true)
            );
        if (game === 'cscd')
            subcommand.addStringOption((option) =>
                option
                    .setName('mode')
                    .setDescription('The mode to get the embed for.')
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
        let url = new URL(`${getURL()}${game === 'etoh' ? '' : '/' + game}/embed/${user.name}`);
        if (game === 'cscd' && interaction.data.options[0].options[1]) {
            const mode = interaction.data.options[0].options[1].value as string;
            if (mode) url.searchParams.append('mode', mode);
        }

        container.addTextDisplayComponents((text) =>
            text.setContent(
                `**Here is your link!**\n-# ${fullGameName} embedded card for [${user.name}](https://roblox.com/users/${user.id}/profile).`
            )
        );

        container.addTextDisplayComponents((text) => text.setContent(url.toString()));

        container.addTextDisplayComponents((text) =>
            text.setContent('-# **Tip:** You can right click the link (or tap and hold on mobile) to copy it.')
        );
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
