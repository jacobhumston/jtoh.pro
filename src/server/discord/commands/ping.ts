import { ButtonStyle, ComponentType, MessageFlags } from 'discord-api-types/v10';
import { type APIApplicationCommandInteraction, type RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';

import { createComponentID, parseComponentID, registerComponentHandler } from '@discord/components';
import { api } from '@discord/rest';
import apiTokens from '@server/modules/tokens';

/**
 * A simple ping command that tests the components handler.
 *
 * Authored by Jacob Humston
 */
const command: RESTPostAPIApplicationCommandsJSONBody = {
    name: 'ping',
    description: 'Test command!'
};

/**
 * Execute this command.
 * @param interaction The interaction.
 */
async function execute(interaction: APIApplicationCommandInteraction) {
    const buttonId = createComponentID([`${interaction.channel.name ?? 'unknown channel'}`]);
    const success = await api.interactions
        .editReply(apiTokens.discordInteractionsApplicationId, interaction.token, {
            content: 'Pong!',
            components: [
                {
                    type: ComponentType.ActionRow,
                    components: [
                        {
                            type: ComponentType.Button,
                            style: ButtonStyle.Primary,
                            custom_id: buttonId,
                            label: 'Button!'
                        }
                    ]
                }
            ]
        })
        .catch(() => null);
    if (success !== null) {
        registerComponentHandler(buttonId, async (interaction) => {
            const source = interaction.data.custom_id;
            await api.interactions
                .followUp(apiTokens.discordInteractionsApplicationId, interaction.token, {
                    content: `${parseComponentID(source).data}`,
                    flags: MessageFlags.Ephemeral
                })
                .catch(() => null);
        });
    }
}

/** Exported command. */
export const commandData = { command, execute };
export default commandData;
