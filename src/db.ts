import Keyv from 'keyv';
import KeyvSqlite from '@keyv/sqlite';
import fs from 'node:fs';
import { UTCDate } from '@date-fns/utc';

if (!fs.existsSync('db/')) fs.mkdirSync('db/');
if (!fs.existsSync('db/stats.sqlite')) fs.writeFileSync('db/stats.sqlite', '');

const statsDBSqlite = new KeyvSqlite('sqlite://db/stats.sqlite');
const statsDB = new Keyv({ store: statsDBSqlite });

export async function updateRequestCount() {
    const today = new UTCDate().toLocaleString('en-US').split(',')[0].replaceAll('/', '-');
    statsDB.set(today, ((await statsDB.get<number>(today)) ?? 0) + 1);
}

export { statsDB };
