import { getLoggedInUser } from '../libs/auth';
import { isDebounceActive, setDebounceActive, setDebounceInactive } from '../libs/debounce';
import { createErrorPopup } from '../libs/quickElements';
import {
    addChild,
    addClass,
    createElement,
    getElementByIdExpected,
    getWebIconHTML,
    removeClass,
    temporarilySetElementText,
    wait,
    waitForPageLoad
} from '../libs/util';

export default async function () {
    await waitForPageLoad();

    const container = getElementByIdExpected('cardBackgroundsContainer', 'div');
    if (!container) return;

    const cardImagesParentContainer = getElementByIdExpected('cardImagesParentContainer', 'div');
    if (!cardImagesParentContainer) return;

    const account = await getLoggedInUser();

    container.innerHTML = '';

    if (!account.user) return (container.innerHTML = '<p>You must be logged in to use this page!</p>');

    addChild(container, [
        createElement('h2', { innerText: 'General Controls', className: 'accountSettingsHeader' }),
        createElement('div', {}, ['split', 'accountSettingsSplit'])
    ]);

    const removeBackgroundButton = createElement('button', {
        innerHTML: getWebIconHTML('delete') + ' Remove Background',
        type: 'button'
    });
    addChild(container, [removeBackgroundButton]);

    removeBackgroundButton.addEventListener('click', async () => {
        if (isDebounceActive('removeBackgroundButton')) return;
        setDebounceActive('removeBackgroundButton');
        const response = await fetch('/api/account/card-background/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' }
        });
        if (!response.ok) return createErrorPopup('Failed to remove card background.', false);
        addClass(removeBackgroundButton, 'successButton');
        const reset = temporarilySetElementText(removeBackgroundButton, getWebIconHTML('check') + ' Removed!');
        await wait(2000);
        reset();
        removeClass(removeBackgroundButton, 'successButton');
        setDebounceInactive('removeBackgroundButton');
    });

    addChild(container, [
        createElement('h2', { innerText: 'Card Backgrounds', className: 'accountSettingsHeader' }),
        createElement('div', {}, ['split', 'accountSettingsSplit'])
    ]);

    const cardImagesContainer = createElement('div', {
        id: 'cardImagesContainer',
        innerHTML: '<p>Loading...</p>'
    });
    addChild(cardImagesParentContainer, [cardImagesContainer]);

    const toggleCardDarkness = createElement('button', { type: 'button' });
    let darknessActive = false;
    function updateDarkness() {
        toggleCardDarkness.innerHTML = darknessActive
            ? getWebIconHTML('toggle_on') + ' Darkened Preview Enabled'
            : getWebIconHTML('toggle_off') + ' Darkened Preview Disabled';
        for (const child of cardImagesContainer.children) {
            const image = child.children[1];
            if (!image) continue;
            // @ts-expect-error
            darknessActive ? addClass(image, 'darkened-card-photo') : removeClass(image, 'darkened-card-photo');
        }
    }
    updateDarkness();
    toggleCardDarkness.addEventListener('click', () => {
        darknessActive = !darknessActive;
        updateDarkness();
    });
    addChild(container, toggleCardDarkness);

    const toggleBiggerCards = createElement('button', {
        type: 'button',
        innerHTML: getWebIconHTML('toggle_off') + ' Big Previews Disabled'
    });
    let biggerPreviewsEnabled = false;
    toggleBiggerCards.addEventListener('click', function () {
        biggerPreviewsEnabled = !biggerPreviewsEnabled;

        toggleBiggerCards.innerHTML = biggerPreviewsEnabled
            ? getWebIconHTML('toggle_on') + ' Big Previews Enabled'
            : getWebIconHTML('toggle_off') + ' Big Previews Disabled';

        biggerPreviewsEnabled
            ? addClass(cardImagesContainer, 'cardImagesContainerBigger')
            : removeClass(cardImagesContainer, 'cardImagesContainerBigger');

        for (const child of cardImagesContainer.children) {
            biggerPreviewsEnabled
                ? // @ts-expect-error
                  addClass(child, 'cardImageContainerBigger')
                : // @ts-expect-error
                  removeClass(child, 'cardImageContainerBigger');
        }
    });
    addChild(container, toggleBiggerCards);

    const list: { result: Array<{ name: string; extension: string; webPath: string }> } | null = await fetch(
        '/api/account/card-background/list'
    )
        .then((r) => r.json())
        .catch(() => null);
    if (!list) return createErrorPopup('Failed to load card backgrounds.', false);

    addChild(container, [createElement('p', { innerText: 'Select your desired card background bellow.' })]);

    cardImagesContainer.innerHTML = '';
    for (const card of list.result) {
        const cardContainer = createElement('div', { className: 'cardImageContainer' });
        const cardImage = createElement('img', { src: card.webPath, alt: card.name });
        const setCardButton = createElement('button', {
            innerHTML: getWebIconHTML('image') + ' Set as Background',
            type: 'button'
        });

        cardImage.style = `background-image: url('${card.webPath}') !important;`;

        const previewCardButton = createElement('button', { type: 'button' }, 'previewCardButton');
        let previewEnabled = false;
        function updatePreview() {
            previewCardButton.innerHTML = previewEnabled
                ? getWebIconHTML('visibility') + ' Preview'
                : getWebIconHTML('visibility_off') + ' Preview';

            if (previewEnabled) {
                // @ts-expect-error
                cardImage.src = `/preview/${account.user.username}?cardBackgroundOverride=${card.name}`;
                addClass(cardImage, ['darkened-override']);
            } else {
                cardImage.src = card.webPath;
                removeClass(cardImage, ['darkened-override']);
            }
        }
        updatePreview();
        previewCardButton.addEventListener('click', () => {
            previewEnabled = !previewEnabled;
            updatePreview();
        });

        cardImage.width = 350;
        cardImage.height = 150;

        setCardButton.addEventListener('click', async () => {
            if (isDebounceActive('setCardButton')) return;
            setDebounceActive('setCardButton');
            const response = await fetch(`/api/account/card-background/set/${card.name}`, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' }
            });
            if (!response.ok) return createErrorPopup('Failed to set card background.', false);
            addClass(setCardButton, 'successButton');
            const reset = temporarilySetElementText(setCardButton, getWebIconHTML('check') + ' Set!');
            await wait(2000);
            reset();
            removeClass(setCardButton, 'successButton');
            setDebounceInactive('setCardButton');
        });

        addChild(cardContainer, [previewCardButton, cardImage, setCardButton]);
        addChild(cardImagesContainer, [cardContainer]);
    }
}
