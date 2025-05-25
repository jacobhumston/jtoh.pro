import { updateBlogDetails } from './components/blog-details';
import { listenForImages } from './components/imageLoader';
import { updateMenuBar } from './components/menu-bar';
import { initProgressBar } from './components/progress-bar';
import { updatePageTitle } from './components/title';
import { addAuthUI, handleLoginRedirect } from './libs/auth';
import { applyTheme, listenForThemSelection } from './libs/theme';
import { addClass, getPageFileName } from './libs/util';

window.addEventListener('load', function () {
    addClass(document.head, '__loaded');
    document.body.style.cursor = 'default';
});

applyTheme();
listenForImages();
listenForThemSelection();
addAuthUI();
updateMenuBar();
updatePageTitle();
updateBlogDetails();
handleLoginRedirect();
initProgressBar();

const url = new URL(document.location.href);
if (url.hostname !== 'localhost' && url.hostname !== 'jtoh.pro' && url.hostname !== 'beta.jtoh.pro') {
    if (url.host.endsWith('devtunnels.ms')) {
        const response = await fetch('/api/vars').catch(() => ({ json: () => ({ usingCustomUrl: false }) }));
        const { usingCustomUrl } = await response.json();
        if (!usingCustomUrl) document.location.href = 'https://jtoh.pro';
    } else {
        document.location.href = 'https://jtoh.pro';
    }
}

try {
    const core = (await import(`./core/${getPageFileName()}.ts`)) as { default: () => void } | null;
    if (core) core.default();
} catch (_) {
    // Do nothing :3
}
