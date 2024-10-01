import Keyv from 'keyv';
import KeyvSqlite from '@keyv/sqlite';
import fs from 'node:fs';
import { UTCDate } from '@date-fns/utc';
import type { RobloxUserResult } from './roblox';
import type { gameNames } from './gamelist';

if (!fs.existsSync('db/')) fs.mkdirSync('db/');
if (!fs.existsSync('db/stats.sqlite')) fs.writeFileSync('db/stats.sqlite', '');

const statsDBSqlite = new KeyvSqlite('sqlite://db/stats.sqlite');
const statsDB = new Keyv({ store: statsDBSqlite });

const cardsRequestedDBSqlite = new KeyvSqlite('sqlite://db/cardsRequested.sqlite');
const cardsRequestedDB = new Keyv({ store: cardsRequestedDBSqlite });

export async function updateRequestCount() {
    const today = new UTCDate().toLocaleString('en-US').split(',')[0].replaceAll('/', '-');
    statsDB.set(today, ((await statsDB.get<number>(today)) ?? 0) + 1);
}

export async function updateCardRequestCount(game: gameNames, user: RobloxUserResult) {
    type data = { count: number; user: RobloxUserResult };
    const key = `${game}-${user.id}`;
    const current = (await cardsRequestedDB.get<data>(key)) ?? { count: 0, user: user };
    if (current.user.thumbnail === undefined) current.user.thumbnail = '/app/assets/default-roblox-profile.png';
    current.count++;
    return await cardsRequestedDB.set(key, current);
}

export async function getOrderedCardRequests(game: gameNames) {
    const values: any = [];
    // @ts-ignore-next-line
    for await (const [key, value] of cardsRequestedDB.iterator()) {
        const [gameKey, _] = key.split('-');
        if (gameKey === game) {
            if (value.user.name === 'LoveliestJacob') continue;
            values.push(value);
        }
    }
    values.sort((a: { count: number }, b: { count: number }) => b.count - a.count);
    return values;
}

export { statsDB, cardsRequestedDB };
