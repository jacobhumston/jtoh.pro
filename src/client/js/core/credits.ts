import { createErrorPopup } from '../libs/quick-elements';
import {
    addChild,
    addClass,
    createElement,
    getElementByIdExpected,
    getWebIconHTML,
    waitForPageLoad
} from '../libs/util';

export default async function () {
    await waitForPageLoad();

    const creditsContainer = getElementByIdExpected('creditsContainer', 'div');
    const packagesContainer = getElementByIdExpected('packagesContainer', 'div');
    if (!creditsContainer || !packagesContainer) return createErrorPopup('Failed to load page elements.', false);

    const credits = await (
        await fetch('/api/credits').catch(() => ({ json: async () => ({ error: 'Failed to load.' }) }))
    ).json();

    const packages = await (
        await fetch('/api/credits/packages').catch(() => ({ json: async () => ({ error: 'Failed to load.' }) }))
    ).json();

    if (packages.error || credits.error) return createErrorPopup('Failed to load credits.', false);

    const packageCount = createElement('h3', { innerText: `${packages.count} Packages`, id: 'packageCount' });
    const downloadLicenses = createElement('a', {
        download: 'licenses.txt',
        href: '/api/credits/packages/licenses.txt',
        innerText: 'Download Licenses',
        id: 'downloadLicenses'
    });
    addChild(packagesContainer, [packageCount, downloadLicenses, createElement('br')]);

    new Promise(() => {
        for (const pkg of packages.packages) {
            const packageElement = createElement('a', {
                innerText: `${pkg.name}`,
                href: pkg.url,
                target: '_blank'
            });
            const versionElement = createElement('span', { innerText: pkg.version });

            addClass(packageElement, 'packageElement');
            addClass(versionElement, 'packageVersionElement');

            addChild(packageElement, versionElement);

            if (!pkg.isSub) {
                const star = createElement('span', { innerHTML: getWebIconHTML('star') });
                addClass(star, 'packageStarElement');
                addChild(packageElement, star);
            }

            addChild(packagesContainer, packageElement);
        }
    });

    new Promise(async () => {
        for (const person of credits.credits) {
            const creditsElement = createElement('div', {}, ['creditsElement']);

            const creditsPictureElement = createElement('div', {}, ['creditsPictureElement']);
            addChild(
                creditsPictureElement,
                createElement('img', {
                    src: person.user.thumbnail ?? '/app/assets/default-roblox-profile.png',
                    alt: person.user.name
                })
            );

            const creditsNameElement = createElement('p', { innerText: person.user.displayName }, [
                'creditsNameElement'
            ]);
            addChild(
                creditsNameElement,
                createElement('span', { innerText: '@' + person.user.name }, ['creditsUsernameElement'])
            );

            const creditsInfoElement = createElement('p', { innerText: person.info }, ['creditsInfoElement']);
            const creditsViewProfileElement = createElement(
                'a',
                { innerText: 'View Profile', href: person.user.profile, target: '_blank' },
                ['creditsViewProfileElement']
            );

            addChild(creditsElement, [
                creditsPictureElement,
                creditsNameElement,
                creditsInfoElement,
                creditsViewProfileElement
            ]);
            addChild(creditsContainer, creditsElement);
        }
    });
}
