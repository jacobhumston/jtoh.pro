import { punishmentsDB } from './db';
import fs from 'node:fs';
import { createModListFile, createModLogFile } from './files';
import { WebhookClient } from 'discord.js';
import { discordModLogWebhookUrl } from './tokens';

const modLogWebhook = new WebhookClient({ url: discordModLogWebhookUrl });

export const punishmentTypes = ['UploadCardBackgroundBan', 'LoginBan'];
export type PunishmentType = 'UploadCardBackgroundBan' | 'LoginBan';

export interface Punishment {
    type: PunishmentType;
    reason: string;
    modId: string;
    expires: number | null;
}

export interface ModLogEntry {
    modId: string;
    userId: string;
    action: string;
    reason: string;
    timestamp: number;
}

export async function getPunishments(userId: string | number): Promise<Punishment[]> {
    return (await punishmentsDB.get(`${userId}`)) || [];
}

export async function addPunishment(userId: string | number, punishment: Punishment): Promise<void> {
    const modList: number[] = JSON.parse(fs.readFileSync(createModListFile(), 'utf-8'));
    if (modList.includes(Number(userId))) throw new Error('Cannot add punishment to a mod.');

    const currentPunishments = await getPunishments(userId);
    if (await getPunishmentOfType(userId, punishment.type))
        throw new Error(`User already has a punishment of type ${punishment.type}`);
    currentPunishments.push(punishment);
    await punishmentsDB.set(`${userId}`, currentPunishments);
    addModLogEntry({
        action: `Added punishment: ${punishment.type}`,
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
    modLogWebhook.send({ content: '```json\n' + JSON.stringify(entry, null, 4) + '```' }).catch(() => {});
}
