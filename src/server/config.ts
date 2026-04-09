/**
 * This is a simple script to handle config options.
 *
 * Authored by Jacob Humston
 */
import { $ } from 'bun';

import { dev, port, url } from '@server/managers/flags';

/** Port that the server should run on. Defaults to port 80. */
export const serverPort: number = port ?? 80;

/**
 * Whether this server is in development mode or not.
 * Enabling this just adds some useful development tooling.
 * Defaults to true.
 */
export const isDev: boolean = dev ?? true;

/** URL that can be used to access the website. Defaults to localhost */
export const serverURL: URL = url ?? new URL(`http://localhost:${serverPort}`);

/** Current version of the server. This config option cannot be set. */
export const version: string = (await $`git rev-parse --short HEAD`.text()).replace('\n', '');

/** Config options as an object. */
const config = { serverPort, isDev, serverURL, version };

// make the object the default export for convenience
export default config;
