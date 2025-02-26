import { isDebounceActive, setDebounceActive, setDebounceInactive } from '../libs/debounce';
import { createErrorPopup } from '../libs/quickElements';
import {
    addClass,
    copyDataToClipboard,
    copyTextToClipboard,
    createElement,
    genUUID,
    getElementById,
    getWebIconHTML,
    removeClass,
    temporarilySetElementText,
    wait,
    waitForPageLoad
} from '../libs/util';

/**
 * Handle image example controls.
 * @param path The URL path for loading the image. Note that it should include $username for the user.
 * @returns
 */
export async function handleImageExampleControls(path: string) {
    await waitForPageLoad();

    const inputBox = getElementById('exampleInputUsername') as HTMLInputElement;
    const refreshButton = getElementById('exampleInputRefresh') as HTMLButtonElement;
    const copyImageButton = getElementById('exampleInputCopyImage') as HTMLButtonElement;
    const copyImageURLButton = getElementById('exampleInputCopyURL') as HTMLButtonElement;
    const downloadButton = getElementById('exampleInputDownload') as HTMLButtonElement;
    const image = getElementById('exampleImageOutput') as HTMLImageElement;

    if (!inputBox || !refreshButton || !copyImageButton || !copyImageURLButton || !downloadButton || !image) {
        await createErrorPopup('Failed to load example controls!', 5000);
        console.error('Failed to find example control elements.');
        return;
    }

    /**
     * Get the path for the image.
     * @returns The path for the image.
     */
    function getPath(override?: string): string {
        return path.replace('$username', override ?? inputBox.value);
    }

    /**
     * Update the output image.
     */
    function updateOutput() {
        image.src = '';
        image.src =
            getPath(inputBox.value.trim() === '' ? 'loveliestjacob' : undefined) +
            '?nocache=' +
            genUUID().split('-')[0];
    }

    inputBox.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            updateOutput();
        }
    });

    refreshButton.addEventListener('click', updateOutput);

    const userQuery = new URLSearchParams(window.location.search).get('user');
    if (userQuery) {
        inputBox.value = userQuery;
        updateOutput();
    }

    image.addEventListener('error', () => {
        if (image.src !== '' && image.src !== '/loveliestjacob') {
            image.src = '/loveliestjacob';
        }
    });

    copyImageURLButton.addEventListener('click', async () => {
        if (isDebounceActive('copyImageURL')) return;
        setDebounceActive('copyImageURL');

        const successfullyCopied = await copyTextToClipboard(image.src);
        if (successfullyCopied) {
            const reset = temporarilySetElementText(copyImageURLButton, getWebIconHTML('check') + ' Success!');
            addClass(copyImageURLButton, 'successButton');
            await wait(1000);
            reset();
            removeClass(copyImageURLButton, 'successButton');
        } else {
            const reset = temporarilySetElementText(copyImageURLButton, getWebIconHTML('error') + ' Failed!');
            await wait(1000);
            reset();
        }

        setDebounceInactive('copyImageURL');
    });

    copyImageButton.addEventListener('click', async () => {
        if (isDebounceActive('copyImage')) return;
        setDebounceActive('copyImage');

        const url = image.src;
        const resetPending = temporarilySetElementText(copyImageButton, getWebIconHTML('pending') + ' Loading...');

        const response = await fetch(url)
            .then((res) => res.blob())
            .catch(() => null);
        if (!response) {
            resetPending();
            const reset = temporarilySetElementText(copyImageButton, getWebIconHTML('error') + ' Failed!');
            await wait(1000);
            reset();
            setDebounceInactive('copyImage');
            return;
        }

        const success = await copyDataToClipboard([new ClipboardItem({ 'image/png': response })]);
        resetPending();
        if (success) {
            const reset = temporarilySetElementText(copyImageButton, getWebIconHTML('check') + ' Success!');
            addClass(copyImageButton, 'successButton');
            await wait(1000);
            reset();
            removeClass(copyImageButton, 'successButton');
        } else {
            const reset = temporarilySetElementText(copyImageButton, getWebIconHTML('error') + ' Failed!');
            await wait(1000);
            reset();
        }

        setDebounceInactive('copyImage');
    });

    downloadButton.addEventListener('click', async () => {
        if (isDebounceActive('downloadImage')) return;
        setDebounceActive('downloadImage');

        const url = image.src;
        const resetPending = temporarilySetElementText(downloadButton, getWebIconHTML('pending') + ' Loading...');

        const response = await fetch(url)
            .then((res) => res.blob())
            .catch(() => null);

        if (!response) {
            resetPending();
            const reset = temporarilySetElementText(downloadButton, getWebIconHTML('error') + ' Failed!');
            await wait(1000);
            reset();
            setDebounceInactive('downloadImage');
            return;
        }

        const blobURL = URL.createObjectURL(response);
        const link = createElement('a', {
            href: blobURL,
            download: `${new URL(image.src).pathname.split('/').pop()}.png`
        });
        link.click();
        URL.revokeObjectURL(blobURL);

        resetPending();
        const reset = temporarilySetElementText(downloadButton, getWebIconHTML('check') + ' Success!');
        addClass(downloadButton, 'successButton');
        await wait(1000);
        reset();
        removeClass(downloadButton, 'successButton');

        setDebounceInactive('downloadImage');
        link.remove();
    });
}
