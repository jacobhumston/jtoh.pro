/**
 * This is a simple script to handle config options.
 * Uses parseArgs to create nicely exported variables.
 *
 * Authored by Jacob Humston
 */
import { createExpectedArg, minMaxValidator, parseArgs } from './managers/argv';

/** Parsed configuration options from the CLI. */
export const config = await parseArgs([
    createExpectedArg({
        name: 'port',
        type: 'number',
        optional: false,
        validator: (value) => minMaxValidator(value, 80, 5000)
    }),
    createExpectedArg({
        name: 'dev',
        type: 'boolean',
        optional: false
    }),
    createExpectedArg({
        name: 'url',
        type: 'string',
        optional: true,
        validator: (value) => {
            new URL(value);
        }
    })
]);

/** Port that the server should run on. */
export const serverPort: number = config[0].value;

/**
 * Whether this server is in development mode or not.
 * Enabling this just adds some useful development tooling.
 */
export const isDev: boolean = config[1].value;

/**
 * URL of the server.
 * Will default to localhost if not provided.
 */
export const serverURL: URL =
    config[2].value === null ? new URL(`http://localhost:${serverPort}`) : new URL(config[2].value);
