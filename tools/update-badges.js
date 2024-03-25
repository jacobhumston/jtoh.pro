// JToH Universe ID
const universeId = 3264581003

/**
 * Function to get the badges of the game.
 * @param {string} cursor Page cursor. 
 */
async function getBadges(cursor) {
    // API Endpoint URL
    let url = `https://badges.roblox.com/v1/universes/${universeId}/badges?limit=100&sortOrder=Asc`
    if (cursor) url = `${url}&cursor=${cursor}`
    return await fetch()
}