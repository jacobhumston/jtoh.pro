import jsonc from 'jsonc-parser';

interface BadgeIcon {
    id: number;
    url: string | null;
}

interface Badge {
    id: number;
    imageUrl?: string | null;
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
    const data: Badge[] = json.data;

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
        });
}
