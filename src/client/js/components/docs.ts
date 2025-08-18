import { inView } from '@jsfns/web';
import { document, window } from '../libs/global';
import { log } from '../libs/logger';
import {
    addChild,
    createElement,
    getElementByIdExpected,
    getWebIconHTML,
    waitForElementByIdExpected,
    waitForPageLoad
} from '../libs/util';

/** Initialize a 'docs' page. */
export async function initDocumentPage() {
    const documentsSelector = await waitForElementByIdExpected('documentSelector', 'div', { timeout: 999999 });
    if (!documentsSelector) return log('error', 'Missing document element.');

    const documents = [
        { name: 'Terms of Service', path: '/app/docs/terms', icon: 'contract' },
        { name: 'Privacy Policy', path: '/app/docs/privacy', icon: 'policy' },
        { name: 'Cookie Policy', path: '/app/docs/cookies', icon: 'cookie' },
        { name: 'Copyright Notice', path: '/app/docs/copyright', icon: 'copyright' },
        { name: 'Refunds and Cancellations', path: '/app/docs/refunds', icon: 'money_off' }
    ];

    for (const doc of documents) {
        addChild(
            documentsSelector,
            createElement('a', { href: doc.path, innerHTML: `${getWebIconHTML(doc.icon)} ${doc.name}` })
        );
    }

    await waitForPageLoad();

    const contentsSelector = getElementByIdExpected('documentSectionSelector', 'div');
    if (!contentsSelector) return log('error', 'Missing document element.');

    const headers: Array<HTMLHeadingElement> = [];
    headers.push(...document.getElementsByTagName('h1'));
    headers.push(...document.getElementsByTagName('h2'));

    const url = new URL(window.location.href);

    for (const header of headers) {
        const urlClone = new URL(url.href);
        urlClone.searchParams.delete('section');
        urlClone.searchParams.set('section', encodeURIComponent(header.innerText));
        const element = createElement('a', { href: urlClone.href, innerText: header.innerText });
        element.dataset.level = header.tagName;
        addChild(contentsSelector, element);
        element.addEventListener('click', (event) => {
            event.preventDefault();
            const newElement = headers.find(
                (thisElement) =>
                    thisElement.innerText ===
                    decodeURIComponent(new URL(element.href).searchParams.get('section') as string)
            );
            if (newElement) newElement.scrollIntoView();
            window.history.replaceState({}, document.title, element.href);
        });
    }

    if (url.searchParams.has('section')) {
        const element = headers.find(
            (element) => element.innerText === decodeURIComponent(url.searchParams.get('section') as string)
        );
        if (element) element.scrollIntoView();
    }

    function updateLinks() {
        for (const link of Array.from(contentsSelector?.children ?? [])) {
            const header = headers.find((h) => h.innerHTML === link.innerHTML);
            const thisLink = link as HTMLAnchorElement;
            if (header) {
                const viewing = inView(header).inside;
                if (viewing) {
                    thisLink.dataset.viewing = 'true';
                    for (const link of Array.from(contentsSelector?.children ?? [])) {
                        if (link.innerHTML !== thisLink.innerHTML) {
                            const newLink = link as HTMLAnchorElement;
                            newLink.dataset.viewing = 'false';
                        }
                    }
                    break;
                }
            }
        }
    }

    updateLinks();
    document.addEventListener('scroll', updateLinks);
}
