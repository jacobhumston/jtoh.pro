/**
 * This file manages redirects.
 *
 * Authored by Jacob Humston
 */
import { createMiddleware } from 'hono/factory';

/** Map of redirects. */
export const redirects = new Map<string, string>([
    ['/login', '/api/auth/roblox'],
    ['/discord-bot', 'https://discord.com/oauth2/authorize?client_id=1285148080189997107'],
    ['/discord-server', 'https://discord.gg/GbdZfUvtjZ'],

    // these are unserious ones
    ['/.env', 'https://giphy.com/gifs/what-the-heck-hell-nah-did-i-saw-yPgAHZKLiTiKUbjIKU'],
    ['/lovelyjacob', 'https://lovelyjacob.com'],
    ['/wp-login.php', 'https://giphy.com/gifs/mic-television-rick-and-morty-summer-tv-4fWetbs5jmtOg']
]);

/** Redirect middleware to handle url redirects. */
export const redirectMiddleware = createMiddleware(async (context, next) => {
    const found = redirects.get(context.req.path);
    if (found) return context.redirect(found);
    return await next();
});
