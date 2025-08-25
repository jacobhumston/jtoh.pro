import { getEnvName } from './dev';
import { InfisicalSDK } from '@infisical/sdk';
import { env as _env } from 'bun';
import logger from './logger';

const client = new InfisicalSDK();

await client.auth().universalAuth.login({
    clientId: _env.TOKEN_ID as string,
    clientSecret: _env.TOKEN_SECRET as string
});

const secrets = await client.secrets().listSecrets({
    environment: getEnvName(),
    projectId: '55bdb45d-6e5a-497f-b8f4-7418bb351130',
    attachToProcessEnv: false
});

if (!secrets) throw new Error('Failed to load secrets from Infisical');

const env = secrets.secrets
    .map((s) => ({ [s.secretKey]: s.secretValue }))
    .reduce((a, b) => ({ ...a, ...b }), { ..._env });

logger.info(`Loaded ${Object.keys(env).length} secrets from Infisical!`);

export const discordInteractionsPublicKey = env.discordInteractionsPublicKey as string;
export const discordInteractionsApplicationId = env.discordInteractionsApplicationId as string;
export const discordInteractionsToken = env.discordInteractionsToken as string;
export const robloxAuthClientId = env.robloxAuthClientId as string;
export const robloxAuthSecret = env.robloxAuthSecret as string;
export const theCatApiToken = env.theCatApiToken as string;
export const cloudflareCaptchaSecret = env.cloudflareCaptchaSecret as string;
export const robloxAdminUserId = parseInt(env.robloxAdminUserId as string) as number;
export const donationsRobloxCloudToken = env.donationsRobloxCloudToken as string;
export const towerStatsToken = env.towerStatsToken as string;
export const imgurClientId = env.imgurClientId as string;
export const imgurClientToken = env.imgurClientToken as string;
export const proxyUrl = env.proxyUrl as string;
export const cloudflareS3 = JSON.parse(env.cloudflareS3 as string);
export const wheelOfNamesToken = env.wheelOfNamesToken as string;
export const githubAppSecret = env.githubAppSecret as string;
export const githubAppClientId = env.githubAppClientId as string;
export const githubAppId = env.githubAppId as string;
export const robloxAccountUsername = env.robloxAccountUsername as string;
export const robloxAccountId = env.robloxAccountId as string;
export const robloxAccountCookie = env.robloxAccountCookie as string;
export const discordModLogWebhookUrl = env.discordModLogWebhookUrl as string;
export const discordStaffNotificationsWebhookUrl = env.discordStaffNotificationsWebhookUrl as string;
export const towerStatsVercelBypassToken = env.towerStatsVercelBypassToken as string;
export const discordGeneralWebsiteLogsWebhookUrl = env.discordGeneralWebsiteLogsWebhookUrl as string;
export const cloudflareDevTunnel = env.cloudflareDevTunnel as string;
