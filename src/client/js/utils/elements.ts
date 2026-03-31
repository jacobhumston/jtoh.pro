/**
 * Client utilities related to elements.
 *
 * Authored by Jacob Humston
 */

/**
 * Create an element.
 * @param tag Tag of this element.
 * @param props Properties of this element.
 * @param children Children to append to this element.
 * @returns The created element.
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    props: Partial<HTMLElementTagNameMap[K]> & {
        /** Optional styles to apply to this element. */
        styles?: Partial<CSSStyleDeclaration>;
    } & {
        /** Optional classes to apply this element. */
        classes?: Array<string>;
    } = {},
    children?: Array<HTMLElement>
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    const { styles, classes, ...rest } = props;
    Object.assign(element, rest);
    if (styles) Object.assign(element.style, styles);
    if (classes) element.classList.add(...classes);
    if (children) element.append(...children);
    return element;
}

/**
 * Get an HTML span element for an icon.
 * @param name The name of the icon.
 * @returns The HTML for this icon.
 */
export function getIconHTML(name: string) {
    return `<span class="icon">${name}</span>`;
}

/**
 * Create an anchor element and use it to download a blob.
 * @param name File name of the downloaded resource.
 * @param blob Blob to download.
 */
export function downloadBlob(name: string, blob: Blob) {
    createElement('a', {
        href: URL.createObjectURL(blob),
        download: name
    }).click();
}
