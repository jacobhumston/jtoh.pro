import { getEnvName } from './dev';
import { InfisicalSDK } from '@infisical/sdk';
import { env } from 'bun';
import logger from './logger';

const client = new InfisicalSDK();

await client.auth().universalAuth.login({
    clientId: env.TOKEN_ID as string,
    clientSecret: env.TOKEN_SECRET as string
});

const secrets = await client.secrets().listSecrets({
    environment: getEnvName(),
    projectId: '55bdb45d-6e5a-497f-b8f4-7418bb351130',
    attachToProcessEnv: false
});

if (!secrets) throw new Error('Failed to load secrets from Infisical');

const tokens: any = secrets.secrets
    .map((s) => ({ [s.secretKey]: s.secretValue }))
    .reduce((a, b) => ({ ...a, ...b }), {});

logger.info(`Loaded ${Object.keys(tokens).length} secrets from Infisical!`);

export const discordInteractionsPublicKey = tokens.discordInteractionsPublicKey as string;
export const discordInteractionsApplicationId = tokens.discordInteractionsApplicationId as string;
export const discordInteractionsToken = tokens.discordInteractionsToken as string;
export const robloxAuthClientId = tokens.robloxAuthClientId as string;
export const robloxAuthSecret = tokens.robloxAuthSecret as string;
export const theCatApiToken = tokens.theCatApiToken as string;
export const cloudflareCaptchaSecret = tokens.cloudflareCaptchaSecret as string;
export const robloxAdminUserId = parseInt(tokens.robloxAdminUserId as string) as number;
export const donationsRobloxCloudToken = tokens.donationsRobloxCloudToken as string;
export const towerStatsToken = tokens.towerStatsToken as string;
export const imgurClientId = tokens.imgurClientId as string;
export const imgurClientToken = tokens.imgurClientToken as string;
export const proxyUrl = tokens.proxyUrl as string;
export const cloudflareS3 = JSON.parse(tokens.cloudflareS3 as string);
export const wheelOfNamesToken = tokens.wheelOfNamesToken as string;
export const githubAppSecret = tokens.githubAppSecret as string;
export const githubAppClientId = tokens.githubAppClientId as string;
export const githubAppId = tokens.githubAppId as string;
export const robloxAccountUsername = tokens.robloxAccountUsername as string;
export const robloxAccountId = tokens.robloxAccountId as string;
export const robloxAccountCookie = tokens.robloxAccountCookie as string;
export const discordModLogWebhookUrl = tokens.discordModLogWebhookUrl as string;
export const discordStaffNotificationsWebhookUrl = tokens.discordStaffNotificationsWebhookUrl as string;
export const towerStatsVercelBypassToken = tokens.towerStatsVercelBypassToken as string;
export const discordGeneralWebsiteLogsWebhookUrl = tokens.discordGeneralWebsiteLogsWebhookUrl as string;
export const cloudflareDevTunnel = tokens.cloudflareDevTunnel as string;
export const topggToken = (tokens.topggToken ?? '') as string;
export const discordSelfBotToken = tokens.discordSelfBotToken as string;
export const jacobsAssistantDiscordToken = tokens.JacobsAssistantDiscordToken as string;
