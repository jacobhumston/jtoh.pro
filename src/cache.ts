import { convertTo } from '@jacobhumston/tc.js';
import { createCache } from 'cache-manager';
import { Keyv } from 'keyv';

const keyv = new Keyv({});
keyv.serialize = undefined;
keyv.deserialize = undefined;

export const towerstatsCache = createCache({
    stores: [keyv],
    ttl: convertTo({ minutes: 3 }, 'milliseconds'),
    cacheId: 'towerstats'
});
