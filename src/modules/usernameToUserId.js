/**
 * Get the user id from a username.
 * @param {string} username
 * @returns
 */
export async function usernameToUserId(username) {
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
        return data.data[0].id;
    } else {
        throw new Error('User not found');
    }
}
