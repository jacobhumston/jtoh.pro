import { convertTo } from '@jacobhumston/tc.js';
import tllCache from '@isaacs/ttlcache';

export const towerstatsCache = new tllCache({ max: 1000, ttl: convertTo({ minutes: 3 }, 'milliseconds') });
export const robloxAPICache = new tllCache({ max: 1000, ttl: convertTo({ minutes: 3 }, 'milliseconds') });
