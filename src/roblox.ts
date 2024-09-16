import type { Context } from 'hono';

const baseUrls = {
    users: function (path: string): string {
        return `https://users.roblox.com${path}`;
    },
    thumbnails: function (path: string): string {
        return `https://thumbnails.roblox.com${path}`;
    }
};

export type BasicRobloxUserResult = {
    id: number;
    name: string;
    displayName: string;
};

export async function usernameToUser(username: string): Promise<BasicRobloxUserResult> {
    const response = await fetch(baseUrls.users(`/v1/usernames/users`), {
        method: 'POST',
        body: JSON.stringify({
            usernames: [username],
            excludeBannedUsers: true
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return (await response.json()).data[0] as any;
}

export async function userIdToUser(userId: number): Promise<BasicRobloxUserResult> {
    const response = await fetch(baseUrls.users(`/v1/users`), {
        method: 'POST',
        body: JSON.stringify({
            userIds: [userId],
            excludeBannedUsers: true
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return (await response.json()).data[0] as any;
}

export async function userIdToThumbnail(userId: number): Promise<string> {
    const response = await fetch(
        baseUrls.thumbnails(`/v1/users/avatar-headshot?userIds=${userId}&size=352x352&format=Png&isCircular=false`),
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    return (await response.json()).data[0].imageUrl as string;
}

export async function auth(context: Context) {
    const providedUser: string = context.req.param('user').slice(0, 20);
    let user: BasicRobloxUserResult | undefined = undefined;
    if (providedUser.startsWith('!')) {
        user = await userIdToUser(parseInt(providedUser.slice(1))).catch(() => undefined);
    } else {
        user = await usernameToUser(providedUser).catch(() => undefined);
    }
    const data =
        user !== undefined
            ? {
                  id: user.id,
                  name: user.name,
                  displayName: user.displayName,
                  thumbnail: await userIdToThumbnail(user.id).catch(() => undefined)
              }
            : undefined;
    return data;
}
