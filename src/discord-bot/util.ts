import * as discord from 'discord.js';

export function getUserId(interaction: discord.APIInteraction): string {
    const user = interaction.member?.user || interaction.user;
    return user?.id || interaction.id;
}
