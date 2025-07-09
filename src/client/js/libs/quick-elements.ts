import { numberFormatter } from './formatters';
import { addChild, createElement, getBody, insertChild } from './util';

/**
 * Create an error popup with the specified error message.
 * @param error The error message.
 * @param autoClose The time in milliseconds to auto-close the popup, or false to disable auto-close.
 * @returns
 */
export async function createErrorPopup(error: string, autoClose: number | false): Promise<HTMLDivElement> {
    const errorPopup = createElement('div', { className: 'errorPopup' });
    const errorPopupText = createElement('p', { className: 'errorPopupText', innerText: error });
    const errorPopupClose = createElement('button', {
        className: 'errorPopupClose',
        innerText: 'Close',
        type: 'button'
    });

    addChild(errorPopup, [errorPopupText, errorPopupClose]);

    if (autoClose) {
        const autoCloseText = createElement('p', {
            innerText: `This popup will automatically close within ${numberFormatter.format(autoClose / 1000)} seconds of it being opened.`,
            className: 'errorPopupAutoCloseNotice'
        });
        addChild(errorPopup, autoCloseText);
    }

    let closed = false;
    if (autoClose) {
        setTimeout(() => {
            if (closed === false) {
                errorPopup.remove();
            }
        }, autoClose);
    }

    errorPopupClose.addEventListener('click', () => {
        errorPopup.remove();
        closed = true;
    });

    insertChild(await getBody(), 'afterbegin', errorPopup);

    window.scroll({ top: 0, left: 0, behavior: 'smooth' });

    return errorPopup;
}
