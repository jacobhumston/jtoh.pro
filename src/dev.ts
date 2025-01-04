import { parseArgs } from 'util';
import process from 'node:process';

const { values } = parseArgs({
    args: Bun.argv,
    options: {
        dev: {
            type: 'boolean'
        },
        beta: {
            type: 'boolean'
        },
        port: {
            type: 'string'
        },
        url: {
            type: 'string'
        }
    },
    strict: true,
    allowPositionals: true
});

export const isDev = values.dev ?? false;
export const isBeta = (values.beta ?? false) && isDev == false;
export const port = parseInt(values.port ?? '80') ?? 80;

if (isDev) process.env.NODE_ENV = 'development';
else process.env.NODE_ENV = 'production';

export function getURL() {
    if (values.url) return values.url;
    if (isBeta) return 'https://beta.jtoh.pro';
    if (isDev) return `http://localhost:${port}`;
    return 'https://jtoh.pro';
}

export function getURLWithSlash() {
    return getURL() + '/';
}

export function getURLHost() {
    return new URL(getURL()).host;
}
