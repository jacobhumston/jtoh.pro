/**
 * This module handles roblox api usage.
 *
 * Authored by Jacob Humston
 */
import noblox from 'noblox.js';
import * as emoji from 'node-emoji';

import { Cache } from '../managers/cache';

const robloxCache = new Cache('roblox');

/**
 * Get a Roblox avatar's 3d details.
 * @param userId The user id that the avatar belongs to.
 * @returns Avatar 3d details.
 */
export async function getAvatar3d(userId: number) {
    const result = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-3d?userId=${userId}`)
        .then((res) => res.json())
        .catch(() => null);
    if (!result) return null;
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
    for (var i = 31, t = 0; t < 38; t++) i ^= hash[t].charCodeAt(0);
    return `https://t${(i % 8).toString()}.rbxcdn.com/${hash}`;
}

/**
 * Parse a Roblox account identifier into user details.
 * @param input The input to parse.
 * @returns The parsed result, or null if an error occurred.
 */
export async function parseRobloxAccountInput(input: string | number): Promise<noblox.UserInfo | null> {
    // parse numbers
    if (typeof input === 'number') return await noblox.getUserInfo(input).catch(() => null);
    // parse strings
    if (typeof input === 'string') {
        const parsedString = emoji.strip(input, { preserveSpaces: false }).replaceAll(' ', '');
        if (parsedString.length > 50) return null;
        const result = parsedString.startsWith('!')
            ? // parse user id strings (starts with "!")
              parseInt(parsedString.split('!')[1])
            : // parse usernames
              await noblox.getIdFromUsername(parsedString).catch(() => null);
        return result === null ? null : noblox.getUserInfo(result).catch(() => null);
    }
    return null;
}

export { noblox as robloxApi };
