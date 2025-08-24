import { robloxAPICache } from './cache';
import { donationsRobloxCloudToken, robloxAccountCookie } from './tokens';

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
    verified?: boolean;
};

export interface RobloxUserResult extends BasicRobloxUserResult {
    thumbnail: string | undefined;
}

export async function usernameToUser(username: string): Promise<BasicRobloxUserResult> {
    const response = await fetch(baseUrls.users(`/v1/usernames/users`), {
        method: 'POST',
        body: JSON.stringify({
            usernames: [username],
            excludeBannedUsers: false
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return ((await response.json()) as any).data[0] as any;
}

export async function userIdToUser(userId: number): Promise<BasicRobloxUserResult> {
    const response = await fetch(baseUrls.users(`/v1/users`), {
        method: 'POST',
        body: JSON.stringify({
            userIds: [userId],
            excludeBannedUsers: false
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return ((await response.json()) as any).data[0] as any;
}

export async function userIdToThumbnail(userId: number): Promise<string> {
    const response = await fetch(
        baseUrls.thumbnails(`/v1/users/avatar-headshot?userIds=${userId}&size=352x352&format=Webp&isCircular=false`),
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    return ((await response.json()) as any).data[0].imageUrl as string;
}

export async function userIdToThumbnailFull(userId: number): Promise<string> {
    const response = await fetch(
        baseUrls.thumbnails(`/v1/users/avatar?userIds=${userId}&size=352x352&format=Webp&isCircular=false`),
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    return ((await response.json()) as any).data[0].imageUrl as string;
}

export async function userIdToThumbnailBust(userId: number): Promise<string> {
    const response = await fetch(
        baseUrls.thumbnails(`/v1/users/avatar-bust?userIds=${userId}&size=352x352&format=Webp&isCircular=false`),
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    return ((await response.json()) as any).data[0].imageUrl as string;
}

// https://devforum.roblox.com/t/using-robloxs-avatar-3d-api-to-import-users-avatars-into-a-website-or-whatever-youd-like/2432524

export function getRobloxCDNFromHash(hash: string) {
    for (var i = 31, t = 0; t < 38; t++) i ^= hash[t].charCodeAt(0);
    return `https://t${(i % 8).toString()}.rbxcdn.com/${hash}`;
}

export async function getRobloxAvatar3dAssets(userId: number) {
    const result1 = (await fetch(`https://thumbnails.roblox.com/v1/users/avatar-3d?userId=${userId}`)
        .then((res) => res.json())
        .catch(() => undefined)) as any;
    if (!result1) return null;
    if (!result1.imageUrl) return null;

    const result2 = (await fetch(result1.imageUrl)
        .then((res) => res.json())
        .catch(() => undefined)) as any;
    if (!result2) return null;
    if (!result2.camera || !result2.aabb || !result2.mtl || !result2.obj || !result2.textures) return null;

    return {
        camera: result2.camera,
        aabb: result2.aabb,
        mtl: getRobloxCDNFromHash(result2.mtl),
        obj: getRobloxCDNFromHash(result2.obj),
        textures: result2.textures.map((texture: string) => getRobloxCDNFromHash(texture))
    };
}

export async function listRobloxDatastores() {
    const response = await fetch(`https://apis.roblox.com/cloud/v2/universes/4728993116/data-stores`, {
        method: 'GET',
        headers: {
            'x-api-key': donationsRobloxCloudToken
        }
    });
    return await response.json();
}

export async function getRobloxPlacesDetails(placeIds: [number]): Promise<any[]> {
    const response = await fetch(
        `https://games.roblox.com/v1/games/multiget-place-details?placeIds=${placeIds.join(',')}`,
        {
            headers: {
                cookie: '.ROBLOSECURITY=' + robloxAccountCookie
            },
            credentials: 'include'
        }
    ).catch(() => {
        return { json: () => [] };
    });
    return (await response.json()) as any;
}

export async function getRobloxFriendsWithCache(
    userId: number
): Promise<Array<{ id: number; name: string; displayName: string }> | null> {
    if (robloxAPICache.has(`friends:${userId}`)) return robloxAPICache.get<any>(`friends:${userId}`);

    const response = await fetch(`https://friends.roblox.com/v1/users/${userId}/friends`).catch(() => null);
    if (!response) return null;

    const json = await response.json().catch(() => null);
    if (!json || json['data'] === undefined) return null;

    let data = json.data;
    data = data.filter((user: any) => user.id !== -1);
    //data = data.filter((user: any) => user.name !== '');

    robloxAPICache.set(`friends:${userId}`, data);
    return data as any;
}
