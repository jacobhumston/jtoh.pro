// Important needed modules.
import fs from 'node:fs';

// JToH Universe ID
const universeId = 3264581003;
const oldUniverseId = 1055653882;
const reallyOldUniverseId = 162391357;

// JToh Badges
let badges = [];

/**
 * Function to get the badges of the game.
 * @param {string} cursor Page cursor.
 */
async function getBadges(universeId, cursor) {
    // API Endpoint URL
    let url = `https://badges.roblox.com/v1/universes/${universeId}/badges?limit=100&sortOrder=Asc`;
    if (cursor) url = `${url}&cursor=${cursor}`;
    console.log(`Fetching '${url}'...`);
    const response = await fetch(url);
    if (response.status !== 200) {
        console.log(`Failed to load badges, trying again in 5 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return await getBadges(universeId, cursor);
    } else {
        const json = await response.json();
        const data = json.data;
        for (const badge of data) {
            badge.old = universeId === oldUniverseId || universeId === reallyOldUniverseId;
        }
        badges = badges.concat(data);
        console.log(`Successfully loaded ${data.length} badges.`);
        if (json.nextPageCursor !== null) {
            return await getBadges(universeId, json.nextPageCursor);
        } else {
            return;
        }
    }
}

// Get badges.
await getBadges(reallyOldUniverseId);
await getBadges(oldUniverseId);
await getBadges(universeId);

// Log a success message.
console.log(`All ${badges.length} have been loaded!`);

// Write to data/badges.json
fs.writeFileSync(
    'data/badges.json',
    JSON.stringify({ lastUpdated: new Date(), count: badges.length, badges: badges }, null, 4)
);

// Finish log.
console.log('data/badges.json has been updated!');
