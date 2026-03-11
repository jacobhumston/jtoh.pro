/**
 * This module manages notifications, popups, etc.
 *
 * Authored by Jacob Humston
 */
import sanitizeHtml from 'sanitize-html';

import storage from '@client/modules/storage';

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
 * **Warning:** This function does not sanitize HTML.
 * @param message The message to display.
 * @param notificationId ID of this notification. Notifications with an ID will only be displayed once.
 * @param callback Optional callback to execute after the popup is dismissed.
 */
export function createPopupNotification(message: string, notificationId?: string, callback?: () => void) {
    if (notificationId) {
        const notifications = storage.getItem('viewedNotifications') ?? [];
        if (notifications.includes(notificationId)) return;
        notifications.push(notificationId);
        storage.setItem('viewedNotifications', notifications);
    }

    const container = document.createElement('div');
    const box = document.createElement('div');
    const info = document.createElement('p');
    const close = document.createElement('button');

    container.classList.add('notificationPopup');
    box.classList.add('box');
    info.classList.add('info');
    close.classList.add('close');

    info.innerHTML = message;
    close.innerText = 'Close';

    container.appendChild(box);
    box.append(info, close);
    document.body.insertAdjacentElement('afterbegin', container);

    close.addEventListener('click', function () {
        container.remove();
        if (callback) callback();
    });
}
