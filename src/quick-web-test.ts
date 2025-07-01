import fs from 'node:fs';
import { isDev } from './dev';
import logger from './logger';
import { wait } from './util';
import { port } from './dev';

const files = fs.readdirSync('./src/web/app/').filter((file) => fs.statSync(`./src/web/app/${file}`).isFile());

export async function quickWebTest(replaceLogger: typeof logger = logger) {
    await wait({ seconds: 1 });
    let failed = false;
    if (!isDev) return;
    for (const file of files) {
        const response = await fetch(`http://localhost:${port}/app/${file}`).catch(() => ({ ok: false }));
        if (!response.ok) {
            replaceLogger.error(`Failed to fetch ${file}`);
            failed = true;
        } else {
            console.log(`(QWT): Loaded ${file}`);
        }
    }
    if (failed === false) replaceLogger.info('Quick web test was successful.');
}
