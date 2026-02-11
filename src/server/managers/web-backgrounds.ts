/**
 * This file manages web backgrounds.
 * This is mostly copied from card-background.ts, however I decided
 * to keep the logic separate, because web backgrounds are basic and do
 * not support custom uploads, etc.
 *
 * Authored by Jacob Humston
 */
import random from 'random';

import { readdirSync } from 'node:fs';

import { serverURL } from '@server/config';
import { safelyGetPath } from '@server/managers/files';

// web background array
const backgrounds: Array<{ category: string; url: string; id: string }> = [];

// load backgrounds
for (const file of readdirSync(safelyGetPath('src/client/assets/backgrounds'), {
    withFileTypes: true,
    recursive: true
})) {
    if (!file.isFile()) continue;
    const path = `assets/${file.parentPath.split('assets/')[1]}/${file.name}`;
    const id = file.name.split('.')[0];

    // A quick check to make sure there are no duplicate IDs
    const foundMatch = backgrounds.find((background) => background.id === id);
    if (foundMatch !== undefined)
        throw new Error(`Duplicate card background ID found: ${id} (${file.parentPath}/${file.name})`);

    backgrounds.push({
        id,
        url: `${serverURL.href}${path}`,
        category: path.split('/')[2]
    });
}
/**
 * Get a random web background.
 * @param category An optional category to choose from.
 * @returns The random background, can be null if the provided category was invalid.
 */
export function getRandomWebBackground(category?: string): (typeof backgrounds)[0] | null {
    const choices = category
        ? backgrounds.filter((background) => background.category.toLowerCase() === category.toLowerCase())
        : backgrounds;
    if (choices.length === 0) return null;
    return random.choice(choices) ?? null;
}
