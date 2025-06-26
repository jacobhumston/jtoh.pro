import * as discord from 'discord.js';
import { discordBotConfigDB } from '../db';

export function getUserId(interaction: discord.APIInteraction): string {
    const user = interaction.member?.user || interaction.user;
    return user?.id || interaction.id;
}

export async function addRecent(interaction: discord.APIInteraction, username: string): Promise<void> {
    const userId = getUserId(interaction);
    const config = (await discordBotConfigDB.get(`${userId}`)) ?? {};

    if (!config.ac_recent) config.ac_recent = [];
    if (!config.ac_pinned) config.ac_pinned = [];

    if (config.ac_recent.includes(username) || config.ac_pinned.includes(username)) return;
    if (config.ac_recent.length >= 2) config.ac_recent.shift();

    config.ac_recent.push(username);
    await discordBotConfigDB.set(`${userId}`, config);
    return;
}
