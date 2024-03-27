import flatCache from 'flat-cache';

const cache = flatCache.load('usernameIds', 'cache/');

/**
 * Get the user id from a username.
 * @param {string} username
 * @returns
 */
export async function usernameToUserId(username) {
    if (cache.getKey(username.toLowerCase())) return cache.getKey(username.toLowerCase());

    const response = await fetch('https://users.roblox.com/v1/usernames/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            usernames: [username]
        })
    });
    const data = await response.json();

    if (data.data && data.data.length > 0) {
        cache.setKey(username.toLowerCase(), data.data[0].id);
        cache.save(true);
        return data.data[0].id;
    } else {
        throw new Error('User not found');
    }
}
