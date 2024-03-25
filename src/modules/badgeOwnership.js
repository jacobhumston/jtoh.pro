import fs from 'node:fs';
import flatCache from 'flat-cache';

const cache = flatCache.load('badgeOwners', 'cache/');

//                                             // User Id                            // Badge id(s) (split via a comma)
const url = 'https://badges.roblox.com/v1/users/{userId}/badges/awarded-dates?badgeIds={badgeIds}';

/**
 * Check for owned badges.
 * @param {string|number} userId
 * @param {Array<string|number>} badges
 * @returns {Promise<Array<{ owned: boolean, id: number, awarded: string|null }>>}
 */
export async function checkOwnedBadges(userId, badges) {
    const ownedBadges = badges.map((id) => ({ owned: false, id: id }));
    const response = await fetch(url.replace('{userId}', `${userId}`).replace('{badgeIds}', badges.join(',')));
    if (response.status !== 200) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return await checkOwnedBadges(userId, badges);
    } else {
        const result = await response.json();
        /** @type {Array<{ badgeId: number, awardedDate: string }>} */
        const data = result.data;
        ownedBadges.forEach((badge, index) => {
            const found = data.find((value) => value.badgeId == badge.id);
            if (found) {
                ownedBadges[index] = {
                    owned: true,
                    id: badge.id,
                    awarded: found.awardedDate
                };
            } else {
                ownedBadges[index] = {
                    owned: false,
                    id: badge.id,
                    awarded: null
                };
            }
        });
        return ownedBadges
    }
}

const badges = JSON.parse(fs.readFileSync('data/badges.json').toString('utf-8')).badges.map(((badge) => badge.id))

console.log(
    await checkOwnedBadges(2614622891, badges.splice(0, 100)),
);
