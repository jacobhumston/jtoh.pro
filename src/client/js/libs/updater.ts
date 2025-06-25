/**
 * Checks if a new version of the website is available.
 * If it is, a request will be sent to the server to update the website.
 */
export async function checkForUpdates() {
    const version = await await fetch('/api/vars')
        .then((res) => res.json())
        .then((data) => data.version)
        .catch(console.error);

    if (!version) return;
    if (version === localStorage.getItem('$VERSION')) return;

    localStorage.setItem('$VERSION', version);
    await fetch('/api/clear-site-cache').catch(console.error);

    return;
}
