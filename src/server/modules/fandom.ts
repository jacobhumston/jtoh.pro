/**
 * This module enables interaction with fandom wikis.
 *
 * Authored by Jacob Humston
 */
import mediawiki from 'nodemw';
import UserAgent from 'user-agents';

const useragent = new UserAgent().toString();

const etoh = new mediawiki({
    protocol: 'https',
    server: 'jtoh.fandom.com',
    path: '/',
    userAgent: useragent
});

/** Available wiki instances. */
export const wikis = { etoh };
