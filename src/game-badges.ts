import jsonc from 'jsonc-parser';
import { gameBadgesDB } from './db';
import { convertTo } from '@jacobhumston/tc.js';
import { wait } from './util';

interface BadgeIcon {
    id: number;
    url: string | null;
}

interface Badge {
    id: number;
    imageUrl?: string | null;
    statistics: {
        awardedCount: number;
    };
}

/**
 * Get the icon of badges.
 * @param {Array<number>} badgeIds
 * @returns {Promise<Array<BadgeIcon>>}
 */
export async function getBadgeIcons(badgeIds: number[]): Promise<BadgeIcon[]> {
    const response = await fetch(
        `https://thumbnails.roblox.com/v1/badges/icons?badgeIds=${badgeIds.join(',')}&size=150x150&format=Png&isCircular=false`
    );

    if (response.status !== 200) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return getBadgeIcons(badgeIds);
    }

    const data: { targetId: number; imageUrl: string }[] = (await response.json()).data;
    return badgeIds.map((id) => ({
        id,
        url: data.find((thumbnail) => thumbnail.targetId === id)?.imageUrl || null
    }));
}

/**
 * Function to get the badges of the game.
 * @param {number} universeId
 * @param {string} [cursor] Page cursor.
 */
export async function getBadges(badges: Array<any>, universeId: number, cursor?: string): Promise<void> {
    let url = `https://badges.roblox.com/v1/universes/${universeId}/badges?limit=100&sortOrder=Asc`;
    if (cursor) url += `&cursor=${cursor}`;

    //console.log('Fetching badges...');
    const response = await fetch(url);

    if (response.status !== 200) {
        //console.log(`Failed to load badges, trying again in 5 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return getBadges(badges, universeId, cursor);
    }

    const json = await response.json();
    let data: Badge[] = json.data;

    data = data.filter((badge) => badge.statistics.awardedCount > 0);

    if (data.length === 0) {
        //console.log('Skipping... (0 badges returned)');
        return;
    }

    //console.log('Fetching badge thumbnails...');
    const thumbnails = await getBadgeIcons(data.map((badge) => badge.id));
    //console.log(`Successfully fetched ${thumbnails.length} badge thumbnails!`);

    for (const badge of data) {
        badge.imageUrl = thumbnails.find((thumbnail) => thumbnail.id === badge.id)?.url || null;
    }

    badges.push(...data);
    //console.log(`Successfully loaded ${data.length} badges.`);

    if (json.nextPageCursor) {
        return getBadges(badges, universeId, json.nextPageCursor);
    }
}

export async function getRobloxGamesUniverseIds(): Promise<{ universeIds: number[] }> {
    return fetch('https://data.jtoh.pro/lists/games.jsonc', { cache: 'no-store' })
        .then((response) => response.text())
        .then((data) => {
            const json = jsonc.parse(data);
            return { universeIds: json.universeIds };
        })
        .catch(async () => {
            await wait({ seconds: 5 });
            return getRobloxGamesUniverseIds();
        });
}

async function update(force: boolean = false): Promise<void> {
    const universeIds = (await getRobloxGamesUniverseIds()).universeIds;
    for (const id of universeIds) {
        const exists = await gameBadgesDB.has('_' + id.toString());
        if (exists && !force) continue;
        const badges: any = [];
        await getBadges(badges, id);
        await gameBadgesDB.set('_' + id.toString(), badges);
    }

    // @ts-expect-error
    for await (const [key, _] of gameBadgesDB.iterator()) {
        const id = parseInt(key.slice(1));
        if (!universeIds.includes(id)) {
            await gameBadgesDB.delete(key);
        }
    }
}

update();
setInterval(() => update(true), convertTo({ days: 0.25 }, 'milliseconds'));
