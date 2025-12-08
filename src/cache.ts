import { convertTo } from '@jacobhumston/tc.js';
import { TTLCache } from '@isaacs/ttlcache';

export const towerstatsCache = new TTLCache({ max: 1000, ttl: convertTo({ minutes: 10 }, 'milliseconds') });
export const robloxAPICache = new TTLCache({ max: 1000, ttl: convertTo({ minutes: 20 }, 'milliseconds') });
export const leaderboardCache = new TTLCache({ max: 1000, ttl: convertTo({ minutes: 1 }, 'milliseconds') });
export const htmlCache = new TTLCache({ max: 2147483647, ttl: 2147483647 });
