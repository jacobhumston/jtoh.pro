/**
 * This module handles navigation aspects, such as
 * user display, page access, etc.
 *
 * Authored by Jacob Humston
 */

/**
 * Update current navigation, such as buttons
 * who's appearance changes based on what page the
 * user is currently on.
 */
export function updateCurrentNavigation() {
    const pageNavigation = document.getElementById('pageNavigation');
    if (!pageNavigation) return console.log('Page navigation missing.');

    for (const element of pageNavigation.children) {
        if (element instanceof HTMLAnchorElement) {
            const url = new URL(element.href);
            if (url.pathname === window.location.pathname) {
                element.classList.add('currentPage');
            }
        }
    }
}
