// Important needed modules.
import fs from 'node:fs';
import { getBadgeIcons } from '../src/modules/getThumbnail.js';

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
    // console.log(`Fetching '${url}'...`);
    console.log('Fetching badges...');
    const response = await fetch(url);
    if (response.status !== 200) {
        console.log(`Failed to load badges, trying again in 5 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return await getBadges(universeId, cursor);
    } else {
        const json = await response.json();
        const data = json.data;
        if (data.length === 0) {
            console.log('Skipping... (0 badges returned)');
            return;
        }
        console.log('Fetching badge thumbnails...');
        const thumbnails = await getBadgeIcons(data.map((badge) => badge.id));
        console.log(`Successfully fetched ${thumbnails.length} badge thumbnails!`);
        let source = 'JToH';
        if (universeId === oldUniverseId) {
            source = 'JToH (pre-migration)';
        } else if (universeId === reallyOldUniverseId) {
            source = 'KToH';
        }
        for (const badge of data) {
            badge.old = universeId === oldUniverseId || universeId === reallyOldUniverseId;
            badge.imageUrl = thumbnails.find((thumbnail) => thumbnail.id === badge.id).url;
            badge.source = source;
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
console.log(`All ${badges.length} badges have been loaded!`);

// Write to data/badges.json
fs.writeFileSync(
    'data/badges.json',
    JSON.stringify({ lastUpdated: new Date(), count: badges.length, badges: badges }, null, 4)
);

// Finish log.
console.log('data/badges.json has been updated!');
