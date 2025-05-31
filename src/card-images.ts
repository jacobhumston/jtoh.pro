import fs from 'node:fs';
import logger from './logger';

const cardImages: Record<string, { name: string; extension: string; webPath: string; custom: boolean }> = {};
const cardImageFiles = fs.readdirSync('./src/web/app/assets/card-photos/');

for (const file of cardImageFiles) {
    if (file.split('.').length !== 2) {
        logger.warn(`(SKIPPING) Invalid card image file: ${file}`);
        continue;
    }
    const [name, extension] = file.split('.');
    cardImages[name] = { name, extension, webPath: `/app/assets/card-photos/${file}`, custom: false };
}

export function getCardImages() {
    return cardImages;
}

export function cardImageCheck() {
    const names = Object.keys(cardImages);
    for (const name of names) {
        if (names.filter((n) => n === name).length > 1) {
            logger.warn(`Duplicate card image name: ${name}`);
        }
    }

    for (const image of Object.values(cardImages)) {
        if (image.extension !== 'png' && image.extension !== 'jpg') {
            logger.warn(`Invalid card image extension: ${image.extension}`);
        }
    }
}
