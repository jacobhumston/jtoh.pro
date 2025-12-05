/**
 * This is the token script from jtoh.pro v2.
 * Simply gets API tokens that are stored on https://app.infisical.com/
 *
 * Authored by Jacob Humston
 */
import { InfisicalSDK } from '@infisical/sdk';

import { env } from 'bun';

import { isDev } from '../config';

const client = new InfisicalSDK();

await client.auth().universalAuth.login({
    clientId: env.TOKEN_ID as string,
    clientSecret: env.TOKEN_SECRET as string
});

const secrets = await client.secrets().listSecrets({
    environment: isDev ? 'dev' : 'prod',
    projectId: '55bdb45d-6e5a-497f-b8f4-7418bb351130',
    attachToProcessEnv: false
});

if (!secrets) throw new Error('Failed to load secrets from Infisical');

const tokens: any = secrets.secrets
    .map((s) => ({ [s.secretKey]: s.secretValue }))
    .reduce((a, b) => ({ ...a, ...b }), {});

// TODO: Remove unused tokens after v3 releases.
const discordInteractionsPublicKey = tokens.discordInteractionsPublicKey as string;
const discordInteractionsApplicationId = tokens.discordInteractionsApplicationId as string;
const discordInteractionsToken = tokens.discordInteractionsToken as string;
const robloxAuthClientId = tokens.robloxAuthClientId as string;
const robloxAuthSecret = tokens.robloxAuthSecret as string;
const theCatApiToken = tokens.theCatApiToken as string;
const cloudflareCaptchaSecret = tokens.cloudflareCaptchaSecret as string;
const robloxAdminUserId = parseInt(tokens.robloxAdminUserId as string) as number;
const donationsRobloxCloudToken = tokens.donationsRobloxCloudToken as string;
const towerStatsToken = tokens.towerStatsToken as string;
const imgurClientId = tokens.imgurClientId as string;
const imgurClientToken = tokens.imgurClientToken as string;
const proxyUrl = tokens.proxyUrl as string;
const cloudflareS3 = JSON.parse(tokens.cloudflareS3 as string) as { token: string; keyId: string; accessKey: string };
const wheelOfNamesToken = tokens.wheelOfNamesToken as string;
const robloxAccountUsername = tokens.robloxAccountUsername as string;
const robloxAccountId = tokens.robloxAccountId as string;
const robloxAccountCookie = tokens.robloxAccountCookie as string;
const discordModLogWebhookUrl = tokens.discordModLogWebhookUrl as string;
const discordStaffNotificationsWebhookUrl = tokens.discordStaffNotificationsWebhookUrl as string;
const towerStatsVercelBypassToken = tokens.towerStatsVercelBypassToken as string;
const discordGeneralWebsiteLogsWebhookUrl = tokens.discordGeneralWebsiteLogsWebhookUrl as string;
const cloudflareDevTunnel = tokens.cloudflareDevTunnel as string;
const topggToken = (tokens.topggToken ?? '') as string;
const discordSelfBotToken = tokens.discordSelfBotToken as string;
const jacobsAssistantDiscordToken = tokens.JacobsAssistantDiscordToken as string;
const discordFeedbackWebhook = tokens.discordFeedbackWebhook as string;
const emailAddress = tokens.emailAddress as string;
const emailPassword = tokens.emailPassword as string;

const apiTokens = {
    discordInteractionsPublicKey,
    discordInteractionsApplicationId,
    discordInteractionsToken,
    robloxAuthClientId,
    robloxAuthSecret,
    theCatApiToken,
    cloudflareCaptchaSecret,
    robloxAdminUserId,
    donationsRobloxCloudToken,
    towerStatsToken,
    imgurClientId,
    imgurClientToken,
    proxyUrl,
    cloudflareS3,
    wheelOfNamesToken,
    robloxAccountUsername,
    robloxAccountId,
    robloxAccountCookie,
    discordModLogWebhookUrl,
    discordStaffNotificationsWebhookUrl,
    towerStatsVercelBypassToken,
    discordGeneralWebsiteLogsWebhookUrl,
    cloudflareDevTunnel,
    topggToken,
    discordSelfBotToken,
    jacobsAssistantDiscordToken,
    discordFeedbackWebhook,
    emailAddress,
    emailPassword
};

/** API tokens. */
export default apiTokens;
