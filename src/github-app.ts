import { App } from 'octokit';
import { githubAppId } from './tokens';
import fs from 'node:fs';

export const githubApp = new App({
    appId: githubAppId,
    privateKey: fs.readFileSync('etc/keys/jtoh-pro.2025-05-21.private-key.pem', 'utf-8')
});

export const octokit = await githubApp.getInstallationOctokit(67674782);
