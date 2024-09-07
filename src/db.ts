import Keyv from 'keyv';
import KeyvSqlite from '@keyv/sqlite';
import fs from 'node:fs';

if (!fs.existsSync('db/')) fs.mkdirSync('db/');
if (!fs.existsSync('db/stats.sqlite')) fs.writeFileSync('db/stats.sqlite', '');

const statsDBSqlite = new KeyvSqlite('sqlite://db/stats.sqlite');
const statsDB = new Keyv({ store: statsDBSqlite });

export { statsDB };
