import type { Context } from 'hono';
import jtohGroupMembers from '../etc/group-members/jtoh.json';
import { getSignedInRobloxUser } from './loginauth';

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
    return (await response.json()).data[0] as any;
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
    return (await response.json()).data[0] as any;
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
    return (await response.json()).data[0].imageUrl as string;
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
    return (await response.json()).data[0].imageUrl as string;
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
    return (await response.json()).data[0].imageUrl as string;
}

export async function parseRobloxAccount(context: Context): Promise<RobloxUserResult | undefined> {
    const providedUser: string = context.req.param('user').slice(0, 20);
    let user: BasicRobloxUserResult | undefined = undefined;
    if (providedUser.startsWith('!')) {
        user = await userIdToUser(parseInt(providedUser.slice(1))).catch(() => undefined);
    } else if (providedUser === '$me') {
        let me = await getSignedInRobloxUser(context);
        if (!me) return undefined;
        user = await userIdToUser(me.id).catch(() => undefined);
    } else if (providedUser === '$random') {
        user = await userIdToUser(
            // @ts-ignore-next-line
            jtohGroupMembers.members[Math.floor(Math.random() * jtohGroupMembers.members.length)].id
        ).catch(() => undefined);
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

// https://devforum.roblox.com/t/using-robloxs-avatar-3d-api-to-import-users-avatars-into-a-website-or-whatever-youd-like/2432524

export function getRobloxCDNFromHash(hash: string) {
    for (var i = 31, t = 0; t < 38; t++) i ^= hash[t].charCodeAt(0);
    return `https://t${(i % 8).toString()}.rbxcdn.com/${hash}`;
}

export async function getRobloxAvatar3dAssets(userId: number) {
    const result1 = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-3d?userId=${userId}`)
        .then((res) => res.json())
        .catch(() => undefined);
    if (!result1) return null;
    if (!result1.imageUrl) return null;

    const result2 = await fetch(result1.imageUrl)
        .then((res) => res.json())
        .catch(() => undefined);
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
