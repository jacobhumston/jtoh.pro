import * as discord from 'discord.js';
import { rest } from '../rest';
import { discordInteractionsApplicationId } from '../../tokens';
import { getURL } from '../../dev';

export const command = new discord.SlashCommandBuilder()
    .setName('feedback')
    .setDescription('Provide feedback for jtoh.pro!')
    .setContexts([
        discord.InteractionContextType.BotDM,
        discord.InteractionContextType.PrivateChannel,
        discord.InteractionContextType.Guild
    ])
    .setIntegrationTypes([
        discord.ApplicationIntegrationType.GuildInstall,
        discord.ApplicationIntegrationType.UserInstall
    ]);

export async function execute(interaction: discord.APIChatInputApplicationCommandInteraction) {
    const form = new FormData();
    const container = new discord.ContainerBuilder();

    container.addTextDisplayComponents((text) =>
        text.setContent(`**Provide Feedback**\nTo provide feedback, visit: ${getURL()}/feedback`)
    );

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
        .catch(() => {});
}
