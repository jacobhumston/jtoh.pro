import { getEnvName } from './dev';
import { InfisicalSDK } from '@infisical/sdk';

const client = new InfisicalSDK();

await client.auth().universalAuth.login({
    clientId: Bun.env.TOKEN_ID as string,
    clientSecret: Bun.env.TOKEN_SECRET as string
});

await client.secrets().listSecrets({
    environment: getEnvName(),
    projectId: '55bdb45d-6e5a-497f-b8f4-7418bb351130',
    attachToProcessEnv: true
});

export const discordInteractionsPublicKey = Bun.env.discordInteractionsPublicKey as string;
export const discordInteractionsApplicationId = Bun.env.discordInteractionsApplicationId as string;
export const discordInteractionsToken = Bun.env.discordInteractionsToken as string;
export const robloxAuthClientId = Bun.env.robloxAuthClientId as string;
export const robloxAuthSecret = Bun.env.robloxAuthSecret as string;
export const theCatApiToken = Bun.env.theCatApiToken as string;
export const cloudflareCaptchaSecret = Bun.env.cloudflareCaptchaSecret as string;
export const robloxAdminUserId = parseInt(Bun.env.robloxAdminUserId as string) as number;
export const donationsRobloxCloudToken = Bun.env.donationsRobloxCloudToken as string;
export const towerStatsToken = Bun.env.towerStatsToken as string;
export const imgurClientId = Bun.env.imgurClientId as string;
export const imgurClientToken = Bun.env.imgurClientToken as string;
export const proxyUrl = Bun.env.proxyUrl as string;
export const cloudflareS3 = JSON.parse(Bun.env.cloudflareS3 as string);
export const wheelOfNamesToken = Bun.env.wheelOfNamesToken as string;
export const githubAppSecret = Bun.env.githubAppSecret as string;
export const githubAppClientId = Bun.env.githubAppClientId as string;
export const githubAppId = Bun.env.githubAppId as string;
export const robloxAccountUsername = Bun.env.robloxAccountUsername as string;
export const robloxAccountId = Bun.env.robloxAccountId as string;
export const robloxAccountCookie = Bun.env.robloxAccountCookie as string;
export const discordModLogWebhookUrl = Bun.env.discordModLogWebhookUrl as string;
export const discordStaffNotificationsWebhookUrl = Bun.env.discordStaffNotificationsWebhookUrl as string;
export const towerStatsVercelBypassToken = Bun.env.towerStatsVercelBypassToken as string;
export const discordGeneralWebsiteLogsWebhookUrl = Bun.env.discordGeneralWebsiteLogsWebhookUrl as string;
