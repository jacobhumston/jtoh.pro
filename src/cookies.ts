import crypto from 'node:crypto';
import fs from 'node:fs';
import { isDev } from './dev';

if (!fs.existsSync('cache/')) fs.mkdirSync('cache/');
if (!fs.existsSync('cache/cookie-secret'))
    fs.writeFileSync('cache/cookie-secret', crypto.randomBytes(255).toString('base64'));

export const cookieSecret = fs.readFileSync('cache/cookie-secret', 'utf-8');

export const authCookieName = `${isDev ? 'dev-' : ''}auth-token`;
