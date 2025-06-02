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
