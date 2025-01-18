import fs from 'node:fs';

const universeIds = {
    current: 3264581003,
    old: 1055653882,
    reallyOld: 162391357,
    cscd: 3762953501,
    tea: 5488708927,
    atos: 1024613407,
    kmtm: 3223228558,
    tct: 3410456683,
    jtohxl: 4610122749,
    jtohxxl: 6114711481
};

interface BadgeIcon {
    id: number;
    url: string | null;
}

interface Badge {
    id: number;
    imageUrl?: string | null;
    source?: string;
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

let badges: Badge[] = [];

/**
 * Function to get the badges of the game.
 * @param {number} universeId
 * @param {string} [cursor] Page cursor.
 */
async function getBadges(universeId: number, cursor?: string): Promise<void> {
    let url = `https://badges.roblox.com/v1/universes/${universeId}/badges?limit=100&sortOrder=Asc`;
    if (cursor) url += `&cursor=${cursor}`;

    console.log('Fetching badges...');
    const response = await fetch(url);

    if (response.status !== 200) {
        console.log(`Failed to load badges, trying again in 5 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return getBadges(universeId, cursor);
    }

    const json = await response.json();
    const data: Badge[] = json.data;

    if (data.length === 0) {
        console.log('Skipping... (0 badges returned)');
        return;
    }

    console.log('Fetching badge thumbnails...');
    const thumbnails = await getBadgeIcons(data.map((badge) => badge.id));
    console.log(`Successfully fetched ${thumbnails.length} badge thumbnails!`);

    const sourceMap = {
        [universeIds.old]: 'JToH (pre-migration)',
        [universeIds.reallyOld]: 'KToH',
        [universeIds.cscd]: 'CSCD',
        [universeIds.tea]: 'TEA',
        [universeIds.atos]: 'ATOS',
        [universeIds.kmtm]: 'KMTM',
        [universeIds.tct]: 'TCT',
        [universeIds.jtohxl]: 'JToH XL',
        [universeIds.jtohxxl]: 'JToH XXL'
    };

    const source = sourceMap[universeId] || 'JToH';

    for (const badge of data) {
        badge.imageUrl = thumbnails.find((thumbnail) => thumbnail.id === badge.id)?.url || null;
        badge.source = source;
    }

    badges = badges.concat(data);
    console.log(`Successfully loaded ${data.length} badges.`);

    if (json.nextPageCursor) {
        return getBadges(universeId, json.nextPageCursor);
    }
}

// Get badges for all universes.
for (const universeId of Object.values(universeIds)) {
    await getBadges(universeId);
}

// Log a success message.
console.log(`All ${badges.length} badges have been loaded!`);

// Write to data/badges.json
fs.writeFileSync('etc/badges.json', JSON.stringify({ lastUpdated: new Date(), count: badges.length, badges }));

// Finish log.
console.log('data/badges.json has been updated!');
