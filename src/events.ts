import { EventEmitter } from 'node:events';
import { WebhookClient } from 'discord.js';
import { discordStaffNotificationsWebhookUrl } from './tokens';

export const events = new EventEmitter();
export const discordStaffWebhook = new WebhookClient({ url: discordStaffNotificationsWebhookUrl });
