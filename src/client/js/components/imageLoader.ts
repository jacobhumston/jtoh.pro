import { addClass, getBody, removeClass } from '../libs/util';

export async function listenForImages() {
    function addImageEventListeners(img: HTMLImageElement) {
        img.addEventListener('load', (event) => {
            addClass(event.target as HTMLImageElement, 'imageIsLoaded');
        });
        img.addEventListener('error', (event) => {
            removeClass(event.target as HTMLImageElement, 'imageIsLoaded');
        });
        if (img.complete && img.naturalWidth !== 0) {
            addClass(img, 'imageIsLoaded');
        }
        const attributeObserver = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                    removeClass(img, 'imageIsLoaded');
                }
            }
        });
        attributeObserver.observe(img, { attributes: true });
    }

    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                    // @ts-expect-error
                    if (node.tagName === 'IMG') {
                        // @ts-expect-error
                        addImageEventListeners(node);
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        // @ts-expect-error
                        const imgs = node.getElementsByTagName('img');
                        for (const img of imgs) {
                            addImageEventListeners(img);
                        }
                    }
                }
            }
        }
    });

    observer.observe(await getBody(), { childList: true, subtree: true });

    const existingImages = document.getElementsByTagName('img');
    for (const img of existingImages) {
        addImageEventListeners(img);
    }
}
