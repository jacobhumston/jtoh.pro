import * as discord from 'discord.js';
import { rest } from '../rest';
import { discordInteractionsApplicationId } from '../../tokens';
import { fullNamesArray, gameNamesArray, type gameNames } from '../../shared/gamelist';
import { getURL } from '../../dev';
import { parseRobloxAccountV2 } from '../../login-auth';

export const command = new discord.SlashCommandBuilder()
    .setName('stats')
    .setDescription('Get the jtoh.pro stats of a game.')
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
            .setDescription(`Get the jtoh.pro stats cof for ${fullNamesArray[index]}.`);
        return subcommand;
    });
});

export async function execute(interaction: discord.APIChatInputApplicationCommandInteraction) {
    const form = new FormData();

    if (!interaction.data.options) return;

    if (interaction.data.options[0].type !== discord.ApplicationCommandOptionType.Subcommand) return;
    if (interaction.data.options[0].options === undefined) return;


    const fullGameName = fullNamesArray[gameNamesArray.indexOf(game as gameNames)];

    const container = new discord.ContainerBuilder();

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
