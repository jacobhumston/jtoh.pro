/**
 * This module handles roblox api usage.
 *
 * Authored by Jacob Humston
 */
import * as emoji from 'node-emoji';
import { fetchApi, fetchApiSplit } from 'rozod';
import { getAssets, getUsersAvatar3d } from 'rozod/lib/endpoints/thumbnailsv1';
import { getUsersUserid, postUsernamesUsers } from 'rozod/lib/endpoints/usersv1';

import { serverURL } from '@server/config';

/**
 * Get a Roblox avatar's 3d details.
 * @param userId The user id that the avatar belongs to.
 * @returns Avatar 3d details.
 */
export async function getAvatar3d(userId: number) {
    const result = await fetchApi(getUsersAvatar3d, { userId }, { throwOnError: true }).catch(() => null);
    if (result === null) return;
    if (result.imageUrl === null) return null;

    const avatar = (await fetch(result.imageUrl)
        .then((res) => res.json())
        .catch(() => null)) as {
        camera: {
            position: { x: number; y: number; z: number };
            direction: { x: number; y: number; z: number };
            fov: number;
        };
        aabb: { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } };
        mtl: string;
        obj: string;
        textures: Array<string>;
    };
    if (!avatar) return null;

    // manually convert roblox cdn hashes, so we don't have to later
    avatar.mtl = getRobloxCDNUrlFromHash(avatar.mtl);
    avatar.obj = getRobloxCDNUrlFromHash(avatar.obj);
    avatar.textures = avatar.textures.map((a) => getRobloxCDNUrlFromHash(a));

    return avatar;
}

/**
 * Get the a Roblox cdn url from a hash.
 * @param hash The hash to get the url from.
 * @returns The url.
 */
export function getRobloxCDNUrlFromHash(hash: string) {
    let g = 0;
    for (let i = 31, t = 0; t < 38; t++) {
        i ^= hash[t].charCodeAt(0);
        g = i;
    }
    return `https://t${(g % 8).toString()}.rbxcdn.com/${hash}`;
}

/**
 * Parse a Roblox account identifier into user details.
 * @param input The input to parse.
 * @returns The parsed result, or null if an error occurred.
 */
export async function parseRobloxAccountInput(input: string | number) {
    // parse numbers
    if (typeof input === 'number')
        return await fetchApi(getUsersUserid, { userId: input }, { throwOnError: true }).catch(() => null);

    // parse strings
    if (typeof input === 'string') {
        const parsedString = emoji.strip(input, { preserveSpaces: false }).replaceAll(' ', '');
        if (parsedString.length > 50) return null;
        const result = parsedString.startsWith('!')
            ? // parse user id strings (starts with "!")
              parseInt(parsedString.split('!')[1])
            : // parse usernames
              await fetchApi(
                  postUsernamesUsers,
                  { body: { usernames: [input], excludeBannedUsers: false } },
                  { throwOnError: true }
              ).catch(() => null);

        if (result === null) return null;

        return await fetchApi(
            getUsersUserid,
            {
                userId: typeof result === 'object' ? (result as { data: Array<{ id: number }> }).data[0].id : result
            },
            { throwOnError: true }
        ).catch(() => null);
    }

    return null;
}

/**
 * Get the URL of the default avatar headshot.
 * @returns The URL of the avatar headshot.
 */
export function getDefaultAvatarHeadshot() {
    return `${serverURL}assets/roblox-headshot.webp`;
}

/**
 * Get asset thumbnail urls.
 * @param assetIds The asset IDs to get the thumbnails of.
 * @returns Thumbnail urls.
 */
export async function getAssetThumbnails(assetIds: Array<number>): Promise<Record<number, string | null>> {
    const result: Record<number, string | null> = {};
    await fetchApiSplit(
        getAssets,
        { format: 'Webp', size: '512x512', assetIds: assetIds },
        { assetIds: 100 },
        (value) => {
            for (const img of value.data) {
                result[img.targetId] = img.imageUrl ?? null;
            }
            return value;
        },
        { retries: 10, retryDelay: 2500 }
    );
    return result;
}
