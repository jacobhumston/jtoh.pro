import { document, window } from './libs/global';

const startLoadTime = window.performance.now();

import { updateBlogDetails } from './components/blog-details';
import { listenForImages } from './components/image-loader';
import { updateMenuBar } from './components/menu-bar';
// import { initProgressBar } from './components/progress-bar';
import { updatePageTitle } from './components/title';
import { addAuthUI, handleLoginRedirect } from './libs/auth';
import { disableLogger, log } from './libs/logger';
import { displayDevBanner, logConsolePasteWarning } from './libs/security';
import { applyTheme, listenForThemSelection } from './libs/theme';
import { checkForUpdates } from './libs/updater';
import { addClass, addOpenIconToAnchorLinks, getPageFileName, hookFetchLogger } from './libs/util';

const url = new URL(document.location.href);

if (url.searchParams.has('ref')) {
    url.searchParams.delete('ref');
    document.location.href = url.toString();
}

const devLoggerEnabled = url.hostname !== 'jtoh.pro';
if (devLoggerEnabled) {
    hookFetchLogger();
} else {
    disableLogger();
}

window.addEventListener('load', function () {
    addClass(document.head, '__loaded');
    document.body.style.cursor = 'default';
});

window.addEventListener('DOMContentLoaded', addOpenIconToAnchorLinks);

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
} catch (error) {
    // Do nothing :3
    // hahaha i LIED!
    log('error', `${error}`);
    console.error(error);
}

displayDevBanner();
log('success', `Loaded in ${Math.round(window.performance.now() - startLoadTime)}ms`);
