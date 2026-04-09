/**
 * This module manages the background of the website.
 *
 * Authored by Jacob Humston
 */

import { client } from '@client/modules/api';
import storage from '@client/modules/storage';

/**
 * Set the background of the page to a random image.
 */
export async function setRandomBackground() {
    const response = await client.GET('/api/backgrounds/random');
    if (response.data && response.data.url) {
        const img = new Image();
        img.addEventListener('load', () => {
            document.documentElement.style.setProperty('--background-image', `url("${img.src}")`);
            if (document.location.pathname === '/credits') {
                document.documentElement.style.setProperty('--background-image-opacity', '.6');
            } else {
                document.documentElement.style.setProperty('--background-image-opacity', '0.05');
            }
            storage.setItem('prevWebBackground', img.src);
        });
        img.src = response.data.url;
    }
}
