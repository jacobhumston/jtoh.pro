import * as discord from 'discord.js';
import { rest } from '../rest';
import { discordInteractionsApplicationId } from '../../tokens';
import { createSelfClientMessageCollector } from '../self-client-discord';

const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${discordInteractionsApplicationId}&permissions=536870912&integration_type=0&scope=bot+applications.commands`;
const inviteUrl2 = `https://discord.com/oauth2/authorize?client_id=${discordInteractionsApplicationId}&permissions=0&integration_type=0&scope=bot+applications.commands`;
const channels = {
    etohTowerWinners: '551938432201654272',
    etohSCTowerWinners: '617297960035811328'
};

export const command = new discord.SlashCommandBuilder()
    .setName('win-notify')
    .setDescription('Get notified when someone completes a tower!')
    .setContexts([
        //discord.InteractionContextType.BotDM,
        //discord.InteractionContextType.PrivateChannel,
        discord.InteractionContextType.Guild
    ])
    .setIntegrationTypes([
        discord.ApplicationIntegrationType.GuildInstall,
        discord.ApplicationIntegrationType.UserInstall
    ]);

export async function execute(interaction: discord.APIChatInputApplicationCommandInteraction) {
    const form = new FormData();

    //if (!interaction.data.options) return;
    //if (interaction.data.options[0].type !== discord.ApplicationCommandOptionType.Subcommand) return;
    //if (interaction.data.options[0].options === undefined) return;

    //const isInServer = interaction.guild_id !== undefined;
    const container = new discord.ContainerBuilder();
    if (!interaction.member || !interaction.guild_id) {
        container.addTextDisplayComponents((text) => text.setContent(`This command can only be executed in a server.`));
    } else {
        const permissionFlags = new discord.PermissionsBitField(BigInt(interaction.member.permissions));
        if (permissionFlags.has('ManageGuild') && permissionFlags.has('ManageWebhooks')) {
            const ourBotsPermissions = new discord.PermissionsBitField(BigInt(interaction.app_permissions));
            if (ourBotsPermissions.has('ManageWebhooks')) {
                container.addTextDisplayComponents((text) => text.setContent('hello!'));
            } else {
                container.addTextDisplayComponents((text) =>
                    text.setContent(
                        `**I do not have permission to manage webhooks**, which is required for this command to work correctly. This will also add me as a bot user in your server.\n\nPlease reinvite me using the following link: ${inviteUrl}\n-# You can also use [this invite](${inviteUrl2}) and give me permission manually.`
                    )
                );
            }
        } else {
            container.addTextDisplayComponents((text) =>
                text.setContent(
                    'You must have the `Manage Server` and the `Manage Webhooks` permission in order to manage win notifications.'
                )
            );
        }
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

export const ephemeral = true;
