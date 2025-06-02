import { punishmentsDB } from './db';
import fs from 'node:fs';
import { createModListFile, createModLogFile } from './files';
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { discordModLogWebhookUrl, robloxAdminUserId } from './tokens';
import { parseRobloxAccountV2 } from './login-auth';
import type { ModLogEntry, Punishment, PunishmentType } from './shared/punishment-types';

const modLogWebhook = new WebhookClient({ url: discordModLogWebhookUrl });

export async function getPunishments(userId: string | number): Promise<Punishment[]> {
    return (await punishmentsDB.get(`${userId}`)) || [];
}

export async function addPunishment(userId: string | number, punishment: Punishment): Promise<void> {
    const modList: number[] = JSON.parse(fs.readFileSync(createModListFile(), 'utf-8'));
    if (modList.includes(Number(userId)) || Number(userId) === robloxAdminUserId)
        throw new Error('Cannot add punishment to a mod.');

    const currentPunishments = await getPunishments(userId);
    if (await getPunishmentOfType(userId, punishment.type))
        throw new Error(`User already has a punishment of type ${punishment.type}`);

    currentPunishments.push(punishment);
    await punishmentsDB.set(`${userId}`, currentPunishments);
    addModLogEntry({
        action: `Added punishment: ${punishment.type} (Expires: ${punishment.expires ? new Date(punishment.expires).toUTCString() : 'Never'})`,
        userId: `${userId}`,
        modId: punishment.modId,
        reason: punishment.reason,
        timestamp: Date.now()
    });
}

export async function getPunishmentOfType(userId: string | number, type: PunishmentType): Promise<Punishment | null> {
    const currentPunishments = await getPunishments(userId);
    const punishment = currentPunishments.find((p) => p.type === type) || null;
    if (punishment && punishment.expires && punishment.expires < Date.now()) {
        await removePunishment(userId, type, punishment.modId, 'Punishment expired.');
        return null;
    }
    return punishment;
}

export async function removePunishment(
    userId: string | number,
    type: PunishmentType,
    modId: string | number,
    reason: string
): Promise<void> {
    const currentPunishments = await getPunishments(userId);
    const updatedPunishments = currentPunishments.filter((p) => p.type !== type);
    if (updatedPunishments.length === currentPunishments.length) {
        throw new Error(`User does not have a punishment of type ${type}`);
    }
    await punishmentsDB.set(`${userId}`, updatedPunishments);
    addModLogEntry({
        action: `Removed punishment: ${type}`,
        userId: `${userId}`,
        modId: `${modId}`,
        reason: reason,
        timestamp: Date.now()
    });
}

export function getModLog(): Array<ModLogEntry> {
    return JSON.parse(fs.readFileSync(createModLogFile(), 'utf-8'));
}

export function addModLogEntry(entry: ModLogEntry): void {
    const modLog = getModLog();
    modLog.push(entry);
    fs.writeFileSync(createModLogFile(), JSON.stringify(modLog));

    (async () => {
        const mod = await parseRobloxAccountV2(`!${entry.modId}`);
        const user = await parseRobloxAccountV2(`!${entry.userId}`);
        if (!mod || !user) return;
        await modLogWebhook
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Mod Log Entry')
                        .addFields([
                            { name: 'User', value: `${user.name} \`${entry.userId}\``, inline: true },
                            { name: 'Moderator', value: `${mod.name} \`${entry.modId}\``, inline: true },
                            { name: 'Action', value: entry.action, inline: false },
                            { name: 'Reason', value: entry.reason, inline: false },
                            { name: 'Timestamp', value: `<t:${Math.floor(entry.timestamp / 1000)}:F>`, inline: false }
                        ])
                        .setColor('Random')
                ]
            })
            .catch(console.error);
    })();
}
