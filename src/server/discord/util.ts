/**
 * List of commands and other utilities.
 *
 * Authored by Jacob Humston
 */
import type { APIInteraction } from 'discord.js';

import ping from '@discord/commands/ping';

/** An array of commands. */
export const commands = [ping];

/**
 * Get a user from the interaction.
 * @param interaction The interaction.
 * @returns The user.
 */
export function getUserFromInteraction(interaction: APIInteraction) {
    const user = interaction.member?.user || interaction.user;
    if (!user) throw new Error('User cannot be received from the interaction.');
    return user;
}
