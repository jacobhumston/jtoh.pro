import { parseArgs } from 'util';

const { values } = parseArgs({
    args: Bun.argv,
    options: {
        dev: {
            type: 'boolean'
        }
    },
    strict: true,
    allowPositionals: true
});

export const isDev = values.dev ?? false;
