/**
 * This file handles card backgrounds.
 * That includes pre-created cards and custom cards that can be uploaded by users.
 *
 * Authored by Jacob Humston
 */
import { readdirSync } from 'node:fs';

import { safelyGetPath } from './files';

// load backgrounds
for (const file of readdirSync(safelyGetPath('src/client/assets/card-backgrounds'), { withFileTypes: true })) {
    console.log(file);
}
