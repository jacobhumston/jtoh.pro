import { updateBlogDetails } from './components/blogDetails';
import { listenForImages } from './components/imageLoader';
import { updateMenuBar } from './components/menuBar';
import { updatePageTitle } from './components/title';
import { addAuthUI } from './libs/auth';
import { applyTheme, listenForThemSelection } from './libs/theme';
import { addClass, getPageFileName } from './libs/util';

window.addEventListener('load', function () {
    addClass(document.head, '__loaded');
});

applyTheme();
listenForImages();
listenForThemSelection();
addAuthUI();
updateMenuBar();
updatePageTitle();
updateBlogDetails();

try {
    const core = (await import(`./core/${getPageFileName()}.ts`)) as { default: () => void } | null;
    if (core) core.default();
} catch (_) {
    // Do nothing :3
}
