/**
 * Get the user from a username.
 * @param {string} username
 * @returns
 */
export async function usernameToUser(username) {
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
        return data.data[0];
    } else {
        throw new Error('User not found');
    }
}

/**
 * Get the user from an id.
 * @param {string|number} id
 * @returns
 */
export async function idToUser(id) {
    const response = await fetch('https://users.roblox.com/v1/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userIds: [id]
        })
    });
    const data = await response.json();

    if (data.data && data.data.length > 0) {
        return data.data[0];
    } else {
        throw new Error('User not found');
    }
}
