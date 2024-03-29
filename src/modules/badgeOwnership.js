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
        return ownedBadges;
    }
}

/**
 * Check for owned badges.
 * @param {string|number} userId
 * @param {Array<string|number>} badges
 * @returns {Promise<Array<{ owned: boolean, id: number, awarded: string|null }>>}
 */
export async function checkOwnedBadgesLarge(userId, badges) {
    let ownedBadges = [];
    const badgesToCheck = [];
    for (let i = 0; i < badges.length; i += 100) {
        badgesToCheck.push(badges.slice(i, i + 100));
    }
    for (const badges of badgesToCheck) {
        ownedBadges = ownedBadges.concat(await checkOwnedBadges(userId, badges));
    }
    return ownedBadges;
}
