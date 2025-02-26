import { listenForImages } from './components/imageLoader';
import { updateMenuBar } from './components/menuBar';
import { updatePageTitle } from './components/title';
import { addAuthUI } from './libs/auth';
import { applyTheme, listenForThemSelection } from './libs/theme';
import { getPageFileName } from './libs/util';

applyTheme();
listenForImages();
listenForThemSelection();
addAuthUI();
updateMenuBar();
updatePageTitle();

try {
    const core = (await import(`./core/${getPageFileName()}.ts`)) as { default: () => void } | null;
    if (core) core.default();
} catch (_) {
    // Do nothing :3
}
