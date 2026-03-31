/**
 * This script handles the background directory.
 *
 * Authored by Jacob Humston
 */
import { domReady } from '@jsfns/web';
import { downloadZip } from 'client-zip';

import { client } from '@client/modules/api';
import { createPopupNotification } from '@client/modules/notifications';
import { downloadBlob, getIconHTML } from '@client/utils/elements';

await new Promise((resolve) => domReady(() => resolve(0)));

const cardBackgrounds = await client.GET('/api/cards/backgrounds');
const webBackgrounds = await client.GET('/api/backgrounds');

const container = document.getElementById('container') as HTMLDivElement;
const downloadZipButton = document.getElementById('downloadZip') as HTMLButtonElement;

if (!cardBackgrounds.data || !webBackgrounds.data) {
    createPopupNotification('Failed to load backgrounds. Please try again.', undefined, () => window.location.reload());
} else {
    const allBackgrounds = [...webBackgrounds.data, ...cardBackgrounds.data];

    downloadZipButton.addEventListener('click', async () => {
        downloadZipButton.disabled = true;

        let total: number = 0;
        let done: number = 0;

        function update() {
            downloadZipButton.innerHTML = `${getIconHTML('folder_zip')} Downloading... (${done}/${total})`;
        }

        const files = allBackgrounds.map(async (background) => {
            total++;
            update();

            const response = await fetch(background.url);
            const blob = await response.blob();

            const type = webBackgrounds.data.find((b) => b.url === background.url) ? 'web' : 'card';

            done++;
            update();

            return {
                name: `${type}/${new URL(background.url).pathname.split('/').pop()}`,
                input: blob
            };
        });

        const resolvedFiles = await Promise.all(files);

        const blob = await downloadZip(resolvedFiles).blob();
        downloadBlob('backgrounds.zip', blob);

        downloadZipButton.innerHTML = `${getIconHTML('folder_zip')} Download ZIP`;
        downloadZipButton.disabled = false;
    });
}
