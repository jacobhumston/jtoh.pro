/**
 * This file handles card backgrounds.
 * That includes pre-created card backgrounds and custom card background that can be uploaded by users.
 *
 * Authored by Jacob Humston
 */
import { readdirSync } from 'node:fs';

import type { CardBackgroundSchema } from '@schemas/cards';
import { serverURL } from '@server/config';
import { safelyGetPath } from '@server/managers/files';

const cardBackgroundImages: Array<CardBackgroundSchema> = [];

// load backgrounds
for (const file of readdirSync(safelyGetPath('src/client/assets/card-backgrounds'), {
    withFileTypes: true,
    recursive: true
})) {
    if (!file.isFile()) continue;
    const path = `assets/${file.parentPath.split('assets/')[1]}/${file.name}`;
    const id = file.name.split('.')[0];

    // A quick check to make sure there are no duplicate IDs
    const foundMatch = cardBackgroundImages.find((background) => background.id === id);
    if (foundMatch !== undefined)
        throw new Error(`Duplicate card background ID found: ${id} (${file.parentPath}/${file.name})`);

    cardBackgroundImages.push({
        id,
        isCustom: false,
        url: `${serverURL.href}${path}`,
        category: path.split('/')[2]
    });
}

/**
 * Returns all card backgrounds.
 * This function does NOT include custom backgrounds.
 * Use {@linkcode getCardBackgroundByID} for a specific card background.
 * @returns List of card backgrounds.
 */
export function getCardBackgrounds(): Array<CardBackgroundSchema> {
    return cardBackgroundImages;
}

/**
 * Get the details of a card background via ID.
 * This function can NOT be used to get a custom background.
 * Use {@linkcode getCardBackgrounds} for a list of card backgrounds.
 * @param id The ID of the card background.
 * @returns The card background, or `null` if no matches.
 */
export function getCardBackgroundByID(id: string): CardBackgroundSchema | null {
    return cardBackgroundImages.find((background) => background.id === id) ?? null;
}
