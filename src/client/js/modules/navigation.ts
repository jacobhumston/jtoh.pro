/**
 * This module handles navigation aspects, such as
 * user display, page access, etc.
 *
 * Authored by Jacob Humston
 */

/**
 * Handle navigation events, etc.
 * This also update current navigation, such as buttons
 * who's appearance changes based on what page the
 * user is currently on.
 */
export function handleNavigation() {
    const pageNavigation = document.getElementById('pageNavigation');
    const navigationToggle = document.getElementById('navigationToggle');
    if (!pageNavigation || !navigationToggle) return console.log('Page navigation missing.');

    for (const element of pageNavigation.children) {
        if (element instanceof HTMLAnchorElement) {
            const url = new URL(element.href);
            if (url.pathname === window.location.pathname) {
                element.classList.add('currentPage');
            }
        }
    }

    navigationToggle.addEventListener('click', function () {
        if (pageNavigation.classList.contains('navigationDropDownEnabled')) {
            pageNavigation.classList.remove('navigationDropDownEnabled');
            navigationToggle.innerHTML = '<span class="icon">menu</span> Menu';
            navigationToggle.style.backgroundColor = '';
        } else {
            pageNavigation.classList.add('navigationDropDownEnabled');
            navigationToggle.innerHTML = '<span class="icon">close</span> Close Menu';
            navigationToggle.style.backgroundColor = 'var(--red)';
        }
    });
}
