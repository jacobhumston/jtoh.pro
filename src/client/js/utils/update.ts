/**
 * This script handles client updates.
 *
 * Authored by Jacob Humston
 */
import { client } from '@client/modules/api';

/**
 * Check for updates, and update the client if needed.
 */
export async function checkForUpdates() {
    const currentVersion = localStorage.getItem('clientVersion') ?? '';
    const response = await client.GET('/api/update', { params: { query: { clientVersion: currentVersion } } });
    if (response.data) {
        if (response.data.update) {
            localStorage.setItem('clientVersion', response.data.version);
            console.log('Client updated.');

            // check to make sure the client updated,
            // if so we can attempt a refresh
            if (localStorage.getItem('clientVersion') === response.data.version) window.location.reload();
        }
    } else {
        console.error(response.error);
    }
}
