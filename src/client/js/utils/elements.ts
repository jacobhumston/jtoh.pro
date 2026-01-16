/**
 * Client utilities related to elements.
 *
 * Authored by Jacob Humston
 */

/**
 * Get an HTML span element for an icon.
 * @param name The name of the icon.
 * @returns The HTML for this icon.
 */
export function getIconHTML(name: string) {
    return `<span class="icon">${name}</span>`;
}
