import axios from 'axios';
import { proxyAgent } from './proxy';
import type { Hono } from 'hono';
import { getRobloxGamesUniverseIds } from './game-badges';
import { gameBadgesDB } from './db';
import { verifyContext } from './captcha';
import events from 'node:events';
import { addSocketManager } from './socket';
import { usernameToUser } from './roblox';
import { convertTo } from '@jacobhumston/tc.js';
import { v4 } from 'uuid';

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
    for (let i = 0; i < requestsToMake.length; i += 100) {
        requests.push(requestsToMake.slice(i, i + 100));
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

export async function getAllBadges(): Promise<{
    total: { badges: number; games: number };
    games: any;
    badges: number[];
}> {
    const universes = (await getRobloxGamesUniverseIds()).universeIds;
    let total = 0;
    let result: any = {};
    let badgeIds: any = [];
    for (const game of universes) {
        const badges = await gameBadgesDB.get('_' + game.toString());
        if (badges) {
            result[game.toString()] = badges;
            total += badges.length;
            badgeIds.push(...badges.map((badge: any) => badge.id));
        }
    }
    result = {
        total: {
            badges: total,
            games: universes.length
        },
        games: result,
        badges: badgeIds
    };
    return result;
}

export function badgesEndpoints(app: Hono) {
    app.get('/api/badges/all', async (context) => {
        const captchaResult = await verifyContext(context);
        if (captchaResult) return captchaResult;

        return context.json(await getAllBadges());
    });

    const websocketPublisher = new events.EventEmitter();
    const badgeRequests = new Map<
        string,
        { userId: string | number; result: any; expires: number; completed: boolean; progress: any }
    >();

    app.get('/api/badges/check', async (context) => {
        const captchaResult = await verifyContext(context);
        if (captchaResult) return captchaResult;

        const user = await usernameToUser(context.req.query('username') ?? '').catch(() => null);
        if (!user) return context.json({ error: 'Invalid username.' }, 400);

        let foundRequest = undefined;
        badgeRequests.forEach((value, key) => {
            if (value.userId === user.id) {
                foundRequest = key;
            }
        });
        if (foundRequest) return context.json({ resultId: foundRequest });

        const badges = (await getAllBadges()).badges;
        const resultId = v4();

        new Promise(async (resolve) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const result = await checkOwnedBadgesLarge(user.id, badges, (progress, completed, total) => {
                const progess = {
                    requestId: resultId,
                    progress: progress,
                    completed: completed,
                    total: total
                };

                websocketPublisher.emit(resultId, progess);

                const current = badgeRequests.get(resultId) as any;
                badgeRequests.set(resultId, {
                    userId: current.userId,
                    completed: current.completed,
                    result: current.result,
                    expires: current.expires,
                    progress: progess
                });
            });

            const current = badgeRequests.get(resultId) as any;
            badgeRequests.set(resultId, {
                userId: user.id,
                completed: true,
                result: result,
                expires: Date.now() + convertTo({ minutes: 1 }, 'milliseconds'),
                progress: current.progress
            });

            websocketPublisher.emit(resultId, current.progress);

            resolve(undefined);
        });

        badgeRequests.set(resultId, {
            userId: user.id,
            completed: false,
            result: [],
            expires: Date.now() + convertTo({ minutes: 30 }, 'milliseconds'),
            progress: {}
        });

        return context.json({ resultId: resultId });
    });

    app.get('/api/badges/check/:resultId', async (context) => {
        const resultId = context.req.param('resultId');
        const request = badgeRequests.get(resultId);
        if (!request) return context.json({ error: 'Invalid result ID.' }, 400);

        if (!request.completed) return context.json({ error: 'Request is still in progress.' }, 400);

        setTimeout(() => {
            badgeRequests.delete(resultId);
        }, 1000);

        return context.json(request.result);
    });

    addSocketManager('badge-check-progress', (context) => {
        return {
            onOpen(_, ws) {
                const resultId = context.req.query('resultId') ?? '';
                const request = badgeRequests.get(resultId);
                if (!request) return ws.close();

                ws.send(JSON.stringify(request.progress));

                const listener = (data: any) => {
                    ws.send(JSON.stringify(data));
                    if (badgeRequests.get(resultId)?.completed === true) {
                        setTimeout(() => {
                            ws.close();
                        }, 1000);
                        websocketPublisher.off(resultId, listener);
                    }
                };

                websocketPublisher.on(resultId, listener);

                setTimeout(() => {
                    if (request.completed) {
                        ws.close();
                        websocketPublisher.off(resultId, listener);
                    }
                }, 1000);
            },
            onMessage() {},
            onClose() {}
        };
    });

    setInterval(
        () => {
            badgeRequests.forEach((value, key) => {
                if (value.expires < Date.now()) {
                    badgeRequests.delete(key);
                }
            });
        },
        convertTo({ seconds: 10 }, 'milliseconds')
    );

    app.get('/api/badges/:universeId', async (context) => {
        const captchaResult = await verifyContext(context);
        if (captchaResult) return captchaResult;

        const universeId = context.req.param('universeId');
        const badges = await gameBadgesDB.get('_' + universeId);
        if (badges) {
            return context.json({ universeId: universeId, total: badges.length, badges: badges });
        } else {
            return context.json({ error: 'No badges found for this universe.' });
        }
    });
}
