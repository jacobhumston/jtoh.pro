import { convertTo } from '@jacobhumston/tc.js';
import tllCache from '@isaacs/ttlcache';

export const towerstatsCache = new tllCache({ max: 1000, ttl: convertTo({ minutes: 10 }, 'milliseconds') });
export const robloxAPICache = new tllCache({ max: 1000, ttl: convertTo({ minutes: 20 }, 'milliseconds') });
export const leaderboardCache = new tllCache({ max: 1000, ttl: convertTo({ minutes: 10 }, 'milliseconds') });
export const htmlCache = new tllCache({ max: 9999999999, ttl: 9999999999 });
