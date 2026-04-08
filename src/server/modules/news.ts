/**
 * This script handles API access to our news service.
 *
 * Authored by Jacob Humston
 */
import GhostAPI from '@tryghost/content-api';

const news = new GhostAPI({
    url: 'https://jtoh-pro.ghost.io',
    key: 'f6caaeff645e232e163e0775c5',
    version: 'v6.0'
});

export default news;

console.log(await news.posts.browse())