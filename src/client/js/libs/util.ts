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
 * @param properties The properties to assign to the element.
 * @returns The created element.
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    properties?: Partial<HTMLElementTagNameMap[K]>
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag) as HTMLElementTagNameMap[K];
    if (properties) Object.assign(element, properties);
    return element;
}

/**
 * Add a child element to a parent element.
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
            parent.appendChild(child);
        }
    } else {
        parent.appendChild(children);
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
 * Wait for an element to be added to the DOM.
 * @param id The id of the element to wait for.
 * @param options The options for the wait.
 * @returns A promise that resolves to the element with the specified id, or null if it doesn't exist after the set timeout.
 */
export function waitForElementById(id: string, options: WaitForElementOptions): Promise<HTMLElement | null> {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const element = getElementById(id);
            if (element) {
                clearInterval(interval);
                clearTimeout(timer);
                resolve(element);
            }
        }, options.interval ?? 100);

        const timer = setTimeout(() => {
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
 * @returns The file name of the current page.
 */
export function getPageFileName(): string {
    const href = new URL(document.location.href);
    const path = href.pathname.split('/');
    return path[path.length - 1].split('.')[0];
}

/**
 * Generate a UUID.
 * @returns The generated UUID.
 */
export function genUUID(): string {
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
}

/**
 * Get a web icon's HTML.
 * @param name The name of the web icon.
 * @returns Icon HTML.
 */
export function getWebIconHTML(name: string): string {
    return `<span class="materialSymbolsRounded">${name}</span>`;
}
