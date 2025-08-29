import { getThumbmark } from '@thumbmarkjs/thumbmarkjs';
import { document, window } from './global';
import { getDefaultLoggerStylesheet, log } from './logger';
import DOMPurify from 'dompurify';

/**
 * Add a class or multiple classes to an element.
 * @param element The element to add the class to.
 * @param className The class or array of classes to add.
 */
export function addClass(element: HTMLElement, className: string | string[]): void {
    if (Array.isArray(className)) {
        element.classList.add(...className);
    } else {
        element.classList.add(className);
    }
    return;
}

/**
 * Remove a class or multiple classes from an element.
 * @param element The element to remove the class from.
 * @param className The class or array of classes to remove.
 */
export function removeClass(element: HTMLElement, className: string | string[]): void {
    if (Array.isArray(className)) {
        element.classList.remove(...className);
    } else {
        element.classList.remove(className);
    }
    return;
}

/**
 * Create an element with the specified tag and properties.
 * @param tag The tag of the element to create.
 * @param properties The properties to assign to the element, if any.
 * @param classes The classes to add to the element, if any.
 * @param children The children to add to the element, if any.
 * @returns The created element.
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    properties?: Partial<HTMLElementTagNameMap[K]>,
    classes?: string | string[],
    children?: HTMLElement | HTMLElement[]
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag) as HTMLElementTagNameMap[K];
    if (properties) Object.assign(element, properties);
    if (classes) addClass(element, classes);
    if (children) addChild(element, children);
    return element;
}

/**
 * Add a child element to a parent element.
 * This can be used in place of `parent.appendChild(child)`.
 * @param parent A parent element.
 * @param child A child element or an array of child elements.
 */
export function addChild(parent: HTMLElement, children: HTMLElement | HTMLElement[]): void {
    if (Array.isArray(children)) {
        for (const child of children) {
            parent.appendChild(child);
        }
    } else {
        parent.appendChild(children);
    }
    return;
}

/**
 * Remove a child element from a parent element.
 * @param parent A parent element.
 * @param children A child element or an array of child elements.
 */
export function removeChild(parent: HTMLElement, children: HTMLElement | HTMLElement[]): void {
    if (Array.isArray(children)) {
        for (const child of children) {
            parent.removeChild(child);
        }
    } else {
        parent.removeChild(children);
    }
    return;
}

/**
 * Get an element with the id of an expected type.
 * @param id The id of the element.
 * @param type The expected type of the element.
 * @returns The element with the specified id, or null if it doesn't exist. (or if it is not of the expected type)
 */
export function getElementByIdExpected<K extends keyof HTMLElementTagNameMap>(
    id: string,
    type: K
): HTMLElementTagNameMap[K] | null {
    let element = document.getElementById(id);
    if (element) element = element.tagName === type.toUpperCase() ? element : null;
    return element as HTMLElementTagNameMap[typeof type] | null;
}

/**
 * Get an element with it's id.
 * @param id The id of the element.
 * @returns The element with the specified id, or null if it doesn't exist.
 */
export function getElementById(id: string): HTMLElement | null {
    return document.getElementById(id);
}

/**
 * Wait for element options.
 */
export type WaitForElementOptions = {
    /** The amount of time in ms before the wait will expire, resulting in a null result. */
    timeout?: number;
    /** The interval in ms to check for the element. */
    interval?: number;
};

/**
 * Wait for element class options.
 */
export interface WaitForElementClassOptions extends WaitForElementOptions {
    /** The amount of the element to wait for. Default is 1. */
    amount?: number;
}

/**
 * Wait for an element to be added to the DOM.
 * @param id The id of the element to wait for.
 * @param options The options for the wait.
 * @returns A promise that resolves to the element with the specified id, or null if it doesn't exist after the set timeout.
 */
export function waitForElementById(id: string, options: WaitForElementOptions): Promise<HTMLElement | null> {
    const alreadyFound = getElementById(id);
    if (alreadyFound) return new Promise((resolve) => resolve(alreadyFound));

    return new Promise((resolve) => {
        let timer: number;
        let interval: number;

        interval = setInterval(() => {
            const element = getElementById(id);
            if (element) {
                clearInterval(interval);
                clearTimeout(timer);
                resolve(element);
            }
        }, options.interval ?? 100);

        timer = setTimeout(() => {
            clearInterval(interval);
            resolve(null);
        }, options.timeout ?? 5000);
    });
}

/**
 * Wait for an element to be added to the DOM.
 * @param id The id of the element to wait for.
 * @param options The options for the wait.
 * @returns A promise that resolves to the element with the specified id and type, or null if it doesn't exist after the set timeout.
 */
export async function waitForElementByIdExpected<K extends keyof HTMLElementTagNameMap>(
    id: string,
    type: K,
    options: WaitForElementOptions
): Promise<HTMLElementTagNameMap[K] | null> {
    const element = await waitForElementById(id, options);
    return element && element.tagName === type.toUpperCase() ? (element as HTMLElementTagNameMap[K]) : null;
}

/**
 * A promise that resolves after a specified amount of time in ms.
 * @param ms The amount of time in ms to wait.
 */
export function wait(ms: number): Promise<undefined> {
    return new Promise((resolve) => setTimeout(() => resolve(undefined), ms));
}

/**
 * Get the file name of the current page.
 * Note: This will return 'custom-site' if root[data-custom] is set to true.
 * @returns The file name of the current page.
 */
export function getPageFileName(): string {
    if (document.documentElement.dataset.custom === 'true') return 'custom-site';

    const href = new URL(document.location.href);
    const path = href.pathname.split('/');
    // Work around for index.html
    if (path[path.length - 1] === '') return 'index';
    return path[path.length - 1].split('.')[0];
}

/**
 * Generate a UUID.
 * @returns The generated UUID.
 */
export function genUUID(): string {
    /**
    let uuid = '';
    try {
        uuid = window.crypto.randomUUID();
    } catch (e) {
        console.error(e);
        // https://www.grepper.com/answers/653315/js+uuid+generator?ucard=1
        uuid = String('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx').replace(/[xy]/g, (character) => {
            const random = (Math.random() * 16) | 0;
            const value = character === 'x' ? random : (random & 0x3) | 0x8;
            return value.toString(16);
        });
    }
    return uuid;
    */
    return window.crypto.randomUUID();
}

/**
 * Get a web icon's HTML.
 * @param name The name of the web icon.
 * @returns Icon HTML.
 */
export function getWebIconHTML(name: string): string {
    return `<span class="materialSymbolsRounded">${name}</span>`;
}

let loaded = false;

/**
 * Wait for the page's DOM to load.
 */
export async function waitForPageLoad(): Promise<void> {
    if (loaded) return Promise.resolve();
    return new Promise((resolve) => {
        if (document.readyState === 'complete') {
            loaded = true;
            resolve();
        } else {
            window.addEventListener('DOMContentLoaded', () => {
                loaded = true;
                resolve();
            });
        }
    });
}

/**
 * Insert a child element to a parent element.
 * @param parent A parent element.
 * @param where The position to insert the child element.
 * @param child A child element or an array of child elements.
 */
export function insertChild(parent: HTMLElement, where: InsertPosition, children: HTMLElement | HTMLElement[]): void {
    if (Array.isArray(children)) {
        for (const child of children) {
            parent.insertAdjacentElement(where, child);
        }
    } else {
        parent.insertAdjacentElement(where, children);
    }
    return;
}

/**
 * Util function to get the document's body.
 * @returns The document's body.
 */
export async function getBody(): Promise<HTMLElement> {
    await waitForPageLoad();
    return document.body;
}

/**
 * Util function to get the document's head.
 * @returns The document's head.
 */
export async function getHead(): Promise<HTMLElement> {
    await waitForPageLoad();
    return document.head;
}

/**
 * Copy text to the clipboard.
 * @param text The text to copy to the clipboard.
 * @returns Whether the text was successfully copied to the clipboard.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
    let success = true;
    await navigator.clipboard.writeText(text).catch(() => {
        success = false;
    });
    return success;
}

/**DataTransfer
 * Copy data to the clipboard. Make sure to handle errors!
 * @param data The data to copy to the clipboard.
 */
export async function copyDataToClipboard(data: ClipboardItem[]): Promise<boolean> {
    let success = true;
    await navigator.clipboard.write(data).catch(() => {
        success = false;
    });
    return success;
}

/**
 * Temporarily set an element's text.
 * @param element The element to set the text of.
 * @param text The text to set.
 * @returns A function to reset the element's text.
 */
export function temporarilySetElementText(element: HTMLElement, text: string): () => void {
    const originalText = element.innerHTML;
    element.innerHTML = text;
    return () => {
        element.innerHTML = originalText;
        return;
    };
}

/**
 * Wait for the window to load.
 */
export async function waitForWindowLoad(): Promise<void> {
    await wait(200);
    const head = await getHead();
    if (!head.classList.contains('__loaded')) return await waitForWindowLoad();
    return;
}

/**
 * Get the URL of the websocket.
 * @param type The type of the websocket.
 * @returns The URL of the websocket.
 */
export function getWebsocketURL(type: string): string {
    const url = new URL(window.location.href);
    return `${url.protocol === 'https:' ? 'wss' : 'ws'}://${url.host}/api/socket?type=${type}`;
}

/**
 * Wait for an element to be added to the DOM.
 * @param id The class of the element to wait for.
 * @param options The options for the wait.
 * @returns A promise that resolves to the elements of the specific class, or null if it doesn't exist after the set timeout.
 */
export function waitForElementsByClassName(
    className: string,
    options: WaitForElementClassOptions
): Promise<HTMLCollection | null> {
    const alreadyFound = document.getElementsByClassName(className);
    if (alreadyFound && alreadyFound.length >= (options.amount ?? 1))
        return new Promise((resolve) => resolve(alreadyFound));

    return new Promise((resolve) => {
        let timer: number;
        let interval: number;

        interval = setInterval(() => {
            const element = document.getElementsByClassName(className);
            if (element && alreadyFound.length >= (options.amount ?? 1)) {
                clearInterval(interval);
                clearTimeout(timer);
                resolve(element);
            }
        }, options.interval ?? 100);

        timer = setTimeout(() => {
            clearInterval(interval);
            resolve(null);
        }, options.timeout ?? 5000);
    });
}

const robloxAccountCache: Record<string, { id: number; name: string; displayName: string; thumbnail: string }> = {};

/**
 * Fetch a Roblox account's details by user value. (Such as !id or username.)
 * @param user The user value to fetch the account details for.
 * @returns The user details, or undefined if the user does not exist or an error occurred.
 */
export async function getRobloxAccountDetails(
    user: string
): Promise<undefined | { id: number; name: string; displayName: string; thumbnail: string }> {
    if (robloxAccountCache[user] && !user.startsWith('$')) return robloxAccountCache[user];

    const response = await fetch(`/api/util/roblox-user/${user}`).catch(console.error);
    if (!response || !response.ok) return undefined;
    const data = (await response.json().catch(console.error)) as
        | { id: number; name: string; displayName: string; thumbnail: string }
        | undefined;

    if (data) {
        robloxAccountCache[user] = data;
        return data;
    }
    return undefined;
}

/**
 * Update the page's display URL without reloading the page.
 * @param url The new URL to set as the display URL.
 */
export function updatePageDisplayURL(url: string) {
    try {
        window.history.replaceState({}, document.title, url);
    } catch (error) {
        console.error(error);
    }
}

/**
 * Hook the fetch logger to log all fetch requests to the console.
 */
export function hookFetchLogger(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args: Parameters<typeof originalFetch>) => {
        const response = await originalFetch(...args);
        let url = args[0].toString();
        if (url.startsWith('/')) {
            url = new URL(url, window.location.href).href;
        }
        const newURL = new URL(url);
        //newURL.searchParams.keys().forEach((key) => newURL.searchParams.delete(key));
        //if (!url.startsWith('https://')) log('error', 'Fetch request to an insecure URL detected!');
        log(
            'info',
            `Fetch ${(args[1] ?? {}).method ?? 'GET'} request to %c${newURL.hostname.replaceAll('.', '/')} @ ${newURL.pathname}%c completed with status ${response.status} (${response.ok ? 'OK' : 'ERROR'})`,
            [
                getDefaultLoggerStylesheet({
                    color: '#00bfff',
                    extra: [
                        { name: 'text-decoration', value: 'none' },
                        { name: 'margin-left', value: '-5px' }
                    ]
                }),
                getDefaultLoggerStylesheet({ 'padding-right': '5px' })
            ]
        );
        return response;
    };
}

/**
 * Convert a string to a color based on its content.
 * SOURCE: https://stackoverflow.com/a/16348977
 * @param str The string to convert to a color.
 * @returns The hex code. (Includes the #)
 */
export function stringToColorHex(str: string) {
    let hash = 0;
    str.split('').forEach((char) => {
        hash = char.charCodeAt(0) + ((hash << 5) - hash);
    });
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += value.toString(16).padStart(2, '0');
    }
    return color;
}

/**
 *  Adds open in new icon to anchor elements that need it.
 */
export function addOpenIconToAnchorLinks() {
    const anchorElements = document.getElementsByTagName('a');
    for (const a of anchorElements) {
        if (a.target === '_blank' && a.childElementCount === 0) {
            if (a.parentElement && a.parentElement.id === 'copyright') continue;
            const icon = getWebIconHTML('open_in_new');
            a.insertAdjacentHTML('beforeend', icon);
            addClass(a, 'anchorElementWithIcon');
        }
    }
}

/**
 * Clean/remove HTML.
 * @param dirty The dirty HTML to clean.
 * @returns The cleaned HTML.
 */
export function removeHTML(dirty: string): string {
    return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: false } });
}

/**
 * Get browser fingerprint.
 * @returns Browser fingerprint.
 */
export async function getBrowserFingerprint(): Promise<string> {
    const fingerprint = await getThumbmark();
    return fingerprint.thumbmark;
}

/** An element creator. */
type ElementCreator<P extends HTMLElement> = <T extends keyof HTMLElementTagNameMap>(
    tag: T,
    childCreator?: (creator: ElementCreator<HTMLElementTagNameMap[T]>) => ElementCreator<HTMLElementTagNameMap[T]>,
    modify?: (element: HTMLElementTagNameMap[T], parent: P) => Promise<void> | void
) => ElementCreator<P>;

/**
 * Start a new element creator.
 * @param parentElement The parent element.
 * @returns The element creator.
 */
export function newElementCreator<P extends HTMLElement>(parentElement: P): ElementCreator<P> {
    /**
     * Add an element to the parent element.
     * @param tag The tag of the element to create.
     * @param childCreator A function that takes an element creator for the created element, allowing you to add children to it.
     * @param modify A function that takes the created element and parent element, allowing you to modify the created element before it is added to the parent element. Note that it will not wait for async calls to finish.
     * @returns The element creator for the parent element, allowing you to chain calls.
     */
    const addElement = (<T extends keyof HTMLElementTagNameMap>(
        tag: T,
        childCreator?: (creator: ElementCreator<HTMLElementTagNameMap[T]>) => ElementCreator<HTMLElementTagNameMap[T]>,
        modify?: (element: HTMLElementTagNameMap[T], parent: P) => Promise<void> | void
    ) => {
        const element = createElement(tag);
        if (childCreator) childCreator(newElementCreator(element));
        if (modify) modify(element, parentElement);
        addChild(parentElement, element);
        return addElement as ElementCreator<P>;
    }) as ElementCreator<P>;

    return addElement;
}

/**
 * Takes `element` and sets it inner html to be `string` where each `"~{index}""` string match is replaced with `replacers[index]`.
 * @param element The element.
 * @param string The string.
 * @param replacers The replacers.
 */
export function safeSetHTML(element: HTMLElement, string: string, replacers: string[]) {
    let newString = string;
    for (const index in replacers) {
        newString = newString.replaceAll(`~{${index}}`, replacers[parseInt(index)]);
    }
    element.innerHTML = newString;
    return;
}
