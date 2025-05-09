import { parseArgs } from 'util';
import process from 'node:process';
import { argv } from 'bun';

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
        },
        cookie: {
            type: 'string'
        }
    },
    strict: true,
    allowPositionals: true
});

export const isDev = values.dev ?? false;
export const isBeta = (values.beta ?? false) && isDev == false;
export const port = parseInt(values.port ?? '80') ?? 80;
export const usingCustomUrl = !!values.url;

if (isDev) process.env.NODE_ENV = 'development';
else process.env.NODE_ENV = 'production';

export function getProvidedURL(): string | null {
    return values.url ?? null;
}

export function getURL(): string {
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

export function getURLObj() {
    return new URL(getURL());
}

export function getArgsAsString() {
    return argv.toSpliced(0, 2).join(' ');
}
