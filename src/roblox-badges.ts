import axios from 'axios';
import { proxyAgent } from './proxy';

const url = 'https://badges.roblox.com/v1/users/{userId}/badges/awarded-dates?badgeIds={badgeIds}';

interface Badge {
    owned: boolean;
    id: number | string;
    awarded: string | null;
}

interface BadgeData {
    badgeId: number;
    awardedDate: string;
}

/**
 * Check for owned badges.
 * @param {string | number} userId
 * @param {Array<string | number>} badges
 * @returns {Promise<Array<Badge>>}
 */
export async function checkOwnedBadges(userId: string | number, badges: Array<string | number>): Promise<Array<Badge>> {
    const ownedBadges: Array<Badge> = badges.map((id) => ({ owned: false, id: id, awarded: null }));
    const response = await axios(url.replace('{userId}', `${userId}`).replace('{badgeIds}', badges.join(',')), {
        httpsAgent: proxyAgent
    }).catch((err) => ({ status: 500, data: err.toString() }));
    if (response.status !== 200) {
        // console.log('Failed to check owned badges, trying again in 1 second...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await checkOwnedBadges(userId, badges);
    } else {
        const result = response.data;
        const data: Array<BadgeData> = result.data;
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
 * @param {string | number} userId
 * @param {Array<string | number>} badges
 * @returns {Promise<Array<Badge>>}
 */
export async function checkOwnedBadgesLarge(
    userId: string | number,
    badges: Array<string | number>,
    progressFunction?: (progress: number, completed: number, total: number) => void
): Promise<Array<Badge>> {
    let ownedBadges: Array<Badge> = [];
    const badgesToCheck: Array<Array<string | number>> = [];
    for (let i = 0; i < badges.length; i += 100) {
        badgesToCheck.push(badges.slice(i, i + 100));
    }

    const requestsToMake: Array<{ userId: number | string; badges: Array<number | string> }> = [];
    for (const badgeChunk of badgesToCheck) {
        requestsToMake.push({ userId: userId, badges: badgeChunk });
    }

    const requests = [];
    for (let i = 0; i < requestsToMake.length; i += 50) {
        requests.push(requestsToMake.slice(i, i + 50));
    }

    let completed = 0;

    const responses: any = [];
    for (const requestChunk of requests) {
        const promises = requestChunk.map((request) =>
            checkOwnedBadges(request.userId, request.badges).then((result) => {
                completed = completed + request.badges.length;
                if (progressFunction) {
                    progressFunction((completed / badges.length) * 100, completed, badges.length);
                }
                return result;
            })
        );
        responses.push(...(await Promise.all(promises)));
    }

    for (const response of responses) {
        ownedBadges = ownedBadges.concat(response);
    }

    return ownedBadges;
}
