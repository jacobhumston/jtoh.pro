/**
 * This module manages notifications, popups, etc.
 *
 * Authored by Jacob Humston
 */
import sanitizeHtml from 'sanitize-html';

/**
 * Create a banner notification that will appear at the top
 * of the website.
 * @param message The message to include in this banner.
 * @param color The background color of this notification.
 * @returns An object containing the element and a delete method.
 */
export function createBannerNotification(message: string, color: 'blue' | 'red' | 'green' | 'yellow') {
    const msg = sanitizeHtml(message);
    const element = document.createElement('div');
    element.innerText = msg;
    element.classList.add('notificationBanner');
    document.body.insertAdjacentElement('afterbegin', element);

    element.style.backgroundColor = `var(--${color})`;

    return {
        element,
        delete: () => element.remove()
    };
}

/**
 * Create a popup notification.
 * @param message The message to display.
 * @param callback Optional callback to execute after the popup is dismissed.
 */
export function createPopupNotification(message: string, callback?: () => void) {
    const msg = sanitizeHtml(message);
    const container = document.createElement('div');
    const box = document.createElement('div');
    const info = document.createElement('p');
    const close = document.createElement('button');

    container.classList.add('notificationPopup');
    box.classList.add('box');
    info.classList.add('info');
    close.classList.add('close');

    info.innerText = msg;
    close.innerText = 'Close';

    container.appendChild(box);
    box.append(info, close);
    document.body.insertAdjacentElement('afterbegin', container);

    close.addEventListener('click', function () {
        container.remove();
        if (callback) callback();
    });
}
