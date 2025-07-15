const startLoadTime = window.performance.now();

import { updateBlogDetails } from './components/blog-details';
import { listenForImages } from './components/image-loader';
import { updateMenuBar } from './components/menu-bar';
// import { initProgressBar } from './components/progress-bar';
import { updatePageTitle } from './components/title';
import { addAuthUI, handleLoginRedirect } from './libs/auth';
import { displayDevBanner, logConsolePasteWarning } from './libs/security';
import { applyTheme, listenForThemSelection } from './libs/theme';
import { checkForUpdates } from './libs/updater';
import { addClass, getPageFileName, hookFetchLogger } from './libs/util';

const url = new URL(document.location.href);
const devLoggerEnabled = url.hostname !== 'jtoh.pro';
if (devLoggerEnabled) hookFetchLogger();

window.addEventListener('load', function () {
    addClass(document.head, '__loaded');
    document.body.style.cursor = 'default';
});

logConsolePasteWarning();
applyTheme();
listenForImages();
listenForThemSelection();
addAuthUI();
updateMenuBar();
updatePageTitle();
updateBlogDetails();
handleLoginRedirect();
// initProgressBar();
checkForUpdates();

if (
    url.hostname !== 'localhost' &&
    url.hostname !== 'jtoh.pro' &&
    url.hostname !== 'beta.jtoh.pro' &&
    !url.hostname.endsWith('.jtoh.pro') &&
    !url.hostname.endsWith('.etoh.pro') &&
    !url.hostname.endsWith('.roblox-obby.pro') &&
    !url.hostname.endsWith('.localhost')
) {
    if (url.host.endsWith('devtunnels.ms') || url.host.endsWith('app.github.dev')) {
        const response = await fetch('/api/vars').catch(() => ({ json: () => ({ usingCustomUrl: false }) }));
        const { usingCustomUrl } = await response.json();
        if (!usingCustomUrl) document.location.href = 'https://jtoh.pro';
    } else {
        document.location.href = 'https://jtoh.pro';
    }
}

try {
    const core = (await import(`./core/${getPageFileName()}.ts`)) as { default: () => Promise<void> } | null;
    if (core) await core.default();
} catch (_) {
    // Do nothing :3
    // hahah i LIED!
    console.log(`%c[Client] No core module found for this site.`, 'color: #caff4fff; font-weight: bold;');
}

displayDevBanner();

if (devLoggerEnabled)
    console.log(
        `%c[Client] Loaded in ${Math.round(window.performance.now() - startLoadTime)}ms`,
        'color: #4fffad; font-weight: bold;'
    );
