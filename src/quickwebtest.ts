import fs from 'node:fs';
import { isDev } from './dev';
import logger from './logger';
import { wait } from './util';

const files = fs.readdirSync('./src/web/app/').filter((file) => fs.statSync(`./src/web/app/${file}`).isFile());

export async function quickWebTest() {
    await wait({ seconds: 1 });
    let failed = false;
    if (!isDev) return;
    for (const file of files) {
        const response = await fetch(`http://localhost:80/app/${file}`).catch(() => ({ ok: false }));
        if (!response.ok) {
            logger.error(`Failed to fetch ${file}`);
            failed = true;
        }
    }
    if (failed === false) logger.info('Quick web test was succesful.');
}
