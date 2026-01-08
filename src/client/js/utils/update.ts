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
        }
    } else {
        console.error(response.error);
    }
}
