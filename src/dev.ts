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
        }
    },
    strict: true,
    allowPositionals: true
});

export const isDev = values.dev ?? false;
export const isBeta = (values.beta ?? false) && isDev == false;

if (isDev) process.env.NODE_ENV = 'development';
else process.env.NODE_ENV = 'production';

export function getURL() {
    if (isBeta) return 'https://beta.jtoh.pro';
    if (isDev) return 'http://localhost';
    return 'https://jtoh.pro';
}

export function getURLWithSlash() {
    return getURL() + '/';
}

export function getURLHost() {
    return new URL(getURL()).host;
}
