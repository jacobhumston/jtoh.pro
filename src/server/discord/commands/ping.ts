/**
 * A simple ping command that tests the components handler.
 *
 * Authored by Jacob Humston
 */
import {
    ButtonStyle,
    ComponentType,
    MessageFlags,
    type APIApplicationCommandInteraction,
    type RESTPostAPIApplicationCommandsJSONBody
} from 'discord.js';

import { createComponentID, parseComponentID, registerComponentHandler } from '@discord/components';
import { api } from '@discord/rest';
import { getUserFromInteraction } from '@discord/util';
import apiTokens from '@server/modules/tokens';

const command: RESTPostAPIApplicationCommandsJSONBody = {
    name: 'ping',
    description: 'Pong!'
};

/**
 * Execute this command.
 * @param interaction The interaction.
 */
async function execute(interaction: APIApplicationCommandInteraction) {
    const user = getUserFromInteraction(interaction);
    const buttonId = createComponentID(['Hello!', ` This command was executed by ${user.global_name}!`]);

    await api.interactions.editReply(apiTokens.discordInteractionsApplicationId, interaction.token, {
        content: 'Pong!',
        components: [
            {
                type: ComponentType.ActionRow,
                components: [
                    {
                        type: ComponentType.Button,
                        style: ButtonStyle.Secondary,
                        custom_id: buttonId,
                        label: 'Test this button!',
                        emoji: { name: '🏓' }
                    }
                ]
            }
        ]
    });

    registerComponentHandler(buttonId, async (interaction) => {
        const source = interaction.data.custom_id;
        await api.interactions
            .followUp(apiTokens.discordInteractionsApplicationId, interaction.token, {
                content: `${parseComponentID(source).data.join('')}`,
                flags: MessageFlags.Ephemeral
            })
            .catch(() => null);
    });
}

/** Exported command. */
export const commandData = { command, execute };
export default commandData;
