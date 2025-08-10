import Keyv from 'keyv';
import KeyvSqlite from '@keyv/sqlite';
import fs from 'node:fs';
import { UTCDate } from '@date-fns/utc';
import type { RobloxUserResult } from './roblox';
import { gameNamesArray, type gameNames } from './shared/gamelist';
import { createLeadboardBlacklistFile } from './files';
import { leaderboardCache } from './cache';

if (!fs.existsSync('db/')) fs.mkdirSync('db/');

const statsDB: Record<gameNames, Keyv> = {} as Record<gameNames, Keyv>;
const refCodesDBs: Record<string, Keyv> = {};

gameNamesArray.forEach((game) => {
    const statsDBSqlite = new KeyvSqlite('sqlite://db/stats.sqlite');
    statsDB[game] = new Keyv({ store: statsDBSqlite, namespace: game });
});

const cardsRequestedDBSqlite = new KeyvSqlite('sqlite://db/cardsRequested.sqlite');
const cardsRequestedDB = new Keyv({ store: cardsRequestedDBSqlite });

const skillPointsDBSqlite = new KeyvSqlite('sqlite://db/skillpoints.sqlite');
const skillPointsDB = new Keyv({ store: skillPointsDBSqlite });

const towerCountDBSqlite = new KeyvSqlite('sqlite://db/towerCount.sqlite');
const towerCountDB = new Keyv({ store: towerCountDBSqlite });

const captchaBypassDBSqlite = new KeyvSqlite('sqlite://db/captchaBypass.sqlite');
const captchaBypassDB = new Keyv({ store: captchaBypassDBSqlite });

export async function updateRequestCount(game: gameNames) {
    const today = new UTCDate().toLocaleString('en-US').split(',')[0].replaceAll('/', '-');
    statsDB[game].set(today, ((await statsDB[game].get<number>(today)) ?? 0) + 1);
}

export async function updateCardRequestCount(game: gameNames, user: RobloxUserResult) {
    type data = { count: number; user: RobloxUserResult };
    const key = `${game}-${user.id}`;
    const current = (await cardsRequestedDB.get<data>(key)) ?? { count: 0, user: user };
    if (current.user.thumbnail === undefined) current.user.thumbnail = '/app/assets/default-roblox-profile.png';
    current.count++;
    current.user = user;
    return await cardsRequestedDB.set(key, current);
}

export async function getOrderedDB(
    db: typeof skillPointsDB | typeof cardsRequestedDB | typeof towerCountDB,
    game: gameNames
): Promise<Array<{ count: number; user: RobloxUserResult; rank: number }>> {
    let values: any[] = [];

    let cached = false;
    const cache = leaderboardCache.get(getDBName(db) + game) as any;
    if (cache !== undefined) {
        cached = true;
        values = cache;
    }

    if (!cached) {
        // @ts-ignore-next-line
        for await (const [key, value] of db.iterator()) {
            const [gameKey, _] = key.split('-');
            if (gameKey === game) {
                values.push(value);
            }
        }
        leaderboardCache.set(getDBName(db) + game, values);
    }

    const blackListedUsers: number[] = JSON.parse(fs.readFileSync(createLeadboardBlacklistFile(), 'utf-8'));

    values = values.filter((value) => !blackListedUsers.includes(value.user.id));
    values = values.filter((value: { count: number }) => value.count > 0);
    values.sort((a: { count: number }, b: { count: number }) => b.count - a.count);
    values.forEach((value: { count: number; rank: number }, index: number) => {
        const prev = values[index - 1];
        if (!prev) return (values[index].rank = 1);
        if (prev.count === value.count) {
            values[index].rank = prev.rank;
        } else {
            values[index].rank = prev.rank + 1;
        }
    });

    return values as any;
}

export async function updateSkillPoints(game: gameNames, user: RobloxUserResult, points: number) {
    type data = { count: number; user: RobloxUserResult };
    const key = `${game}-${user.id}`;
    const current = (await skillPointsDB.get<data>(key)) ?? { count: 0, user: user };
    if (current.user.thumbnail === undefined) current.user.thumbnail = '/app/assets/default-roblox-profile.png';
    current.count = points;
    current.user = user;
    return await skillPointsDB.set(key, current);
}

export async function updateTowerCount(game: gameNames, user: RobloxUserResult, towers: number) {
    type data = { count: number; user: RobloxUserResult };
    const key = `${game}-${user.id}`;
    const current = (await towerCountDB.get<data>(key)) ?? { count: 0, user: user };
    if (current.user.thumbnail === undefined) current.user.thumbnail = '/app/assets/default-roblox-profile.png';
    current.count = towers;
    current.user = user;
    return await towerCountDB.set(key, current);
}

export async function getPlaceInLeaderboard(
    db: typeof skillPointsDB | typeof cardsRequestedDB | typeof towerCountDB,
    game: gameNames,
    user: RobloxUserResult
) {
    const values = await getOrderedDB(db, game);
    const userValue = values.find((value: { user: RobloxUserResult }) => value.user.id === user.id);
    if (userValue === undefined) return null;
    return userValue.rank;
}

export async function getTotalInLeaderboard(
    db: typeof skillPointsDB | typeof cardsRequestedDB | typeof towerCountDB,
    game: gameNames
) {
    const values = await getOrderedDB(db, game);
    if (values.length === 0) return 0;
    return values[values.length - 1].rank;
}

const loginAuthDBSqlite = new KeyvSqlite('sqlite://db/authLogin.sqlite');
const loginAuthDB = new Keyv({ store: loginAuthDBSqlite });

const gameBadgesDBSqlite = new KeyvSqlite('sqlite://db/gameBadges.sqlite');
const gameBadgesDB = new Keyv({ store: gameBadgesDBSqlite });

const accountConfigDBSqlite = new KeyvSqlite('sqlite://db/accountConfig.sqlite');
const accountConfigDB = new Keyv({ store: accountConfigDBSqlite });

const captchaTokensDBSqlite = new KeyvSqlite('sqlite://db/captchaTokens.sqlite');
const captchaTokensDB = new Keyv({ store: captchaTokensDBSqlite });

const punishmentsDBSqlite = new KeyvSqlite('sqlite://db/punishments.sqlite');
const punishmentsDB = new Keyv({ store: punishmentsDBSqlite });

const discordBotConfigDBSqlite = new KeyvSqlite('sqlite://db/discordBotConfig.sqlite');
const discordBotConfigDB = new Keyv({ store: discordBotConfigDBSqlite });

const customSitesDBSqlite = new KeyvSqlite('sqlite://db/customSites.sqlite');
const customSitesDB = new Keyv({ store: customSitesDBSqlite });

const referralsDBSqlite = new KeyvSqlite('sqlite://db/referrals.sqlite');
const referralsDB = new Keyv({ store: referralsDBSqlite });

export function getReferralCodeDB(code: string) {
    if (refCodesDBs[code]) return refCodesDBs[code];
    refCodesDBs[code] = new Keyv({ store: new KeyvSqlite('sqlite://db/referrals.sqlite'), namespace: code });
    return refCodesDBs[code];
}

export async function updateReferralCount(code: string) {
    const today = new UTCDate().toLocaleString('en-US').split(',')[0].replaceAll('/', '-');
    const codeDB = getReferralCodeDB(code);
    codeDB.set(today, ((await codeDB.get<number>(today)) ?? 0) + 1);
}

export {
    statsDB,
    cardsRequestedDB,
    loginAuthDB,
    skillPointsDB,
    captchaBypassDB,
    gameBadgesDB,
    accountConfigDB,
    captchaTokensDB,
    towerCountDB,
    punishmentsDB,
    discordBotConfigDB,
    customSitesDB,
    referralsDB
};

export function getDBName(
    db:
        | typeof statsDB
        | typeof cardsRequestedDB
        | typeof skillPointsDB
        | typeof loginAuthDB
        | typeof captchaBypassDB
        | typeof gameBadgesDB
        | typeof accountConfigDB
        | typeof captchaTokensDB
        | typeof towerCountDB
        | typeof punishmentsDB
        | typeof discordBotConfigDB
        | typeof customSitesDB
        | typeof referralsDB
) {
    if (db === statsDB) return 'stats';
    if (db === cardsRequestedDB) return 'cardsRequested';
    if (db === skillPointsDB) return 'skillPoints';
    if (db === loginAuthDB) return 'authLogin';
    if (db === captchaBypassDB) return 'captchaBypass';
    if (db === gameBadgesDB) return 'gameBadges';
    if (db === accountConfigDB) return 'accountConfig';
    if (db === captchaTokensDB) return 'captchaTokens';
    if (db === towerCountDB) return 'towerCount';
    if (db === punishmentsDB) return 'punishments';
    if (db === discordBotConfigDB) return 'discordBotConfig';
    if (db === customSitesDB) return 'customSites';
    if (db === referralsDB) return 'referrals';
    throw new Error('Invalid DB.');
}
