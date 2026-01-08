/**
 * Utility helpers for Discord components.
 *
 * Authored by Jacob Humston
 */
import { convertTo } from '@jacobhumston/tc.js';
import type { APIMessageComponentInteraction } from 'discord-api-types/v10';
import { v4 } from 'uuid';

import { createTask } from '@server/managers/tasks';

/** Registered component handlers. */
export const registeredComponentHandlers: Map<
    string,
    { created: Date; finite: boolean; callback: (data: APIMessageComponentInteraction) => Promise<any> }
> = new Map();

/**
 * Register a callback to handle interactions for a component.
 * @param id The ID of the component to handle.
 * @param callback The callback to handle the interaction.
 * @param finite Default false, if true, the component will never expire but only work once.
 */
export function registerComponentHandler(
    id: string,
    callback: (data: APIMessageComponentInteraction) => Promise<any>,
    finite?: boolean
) {
    registeredComponentHandlers.set(parseComponentID(id).id, {
        created: new Date(),
        callback,
        finite: finite ?? false
    });
}

// sweeper for discord component handlers
createTask(
    'Discord Component Handler Sweeper',
    'Removes handlers for components that have existed for more then 15 minutes.',
    { minutes: 5 },
    function () {
        registeredComponentHandlers.forEach((value, key) => {
            if (
                Date.now() - value.created.getTime() > convertTo({ minutes: 15 }, 'milliseconds') &&
                value.finite === false
            )
                registeredComponentHandlers.delete(key);
        });
    }
);

/**
 * Create a component ID.
 * @param data The data to include in this ID.
 * @param fromID Optionally pass an ID to update the data of, instead of creating an entirely new ID.
 * @returns The created ID.
 */
export function createComponentID(data: Array<string>, fromID?: string): string {
    if (fromID) {
        const parsed = parseComponentID(fromID);
        return `${parsed.id}:${data.join(',')}`;
    }
    return `${v4().split('-')[0]}:${data.join(',')}`;
}

/**
 * Parse a component ID.
 * @param id The ID to parse.
 * @returns The ID string along with the data it contains.
 */
export function parseComponentID(id: string): { id: string; data: Array<string> } {
    const parsed = id.split(':');
    return { id: parsed[0], data: parsed[1].split(',') };
}
