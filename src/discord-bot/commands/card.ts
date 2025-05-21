import * as discord from 'discord.js';
import { rest } from '../rest';
import { discordInteractionsApplicationId } from '../../tokens';
import { fullNamesArray, gameNamesArray } from '../../shared/gamelist';

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
                option.setName('user').setDescription('The user to get the card for.').setRequired(true)
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

export async function execute(interaction: discord.APIApplicationCommandInteraction) {
    const form = new FormData();

    rest.patch(discord.Routes.webhookMessage(discordInteractionsApplicationId, interaction.token, '@original'), {
        body: form,
        passThroughBody: true
    });
}
