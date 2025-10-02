/**
 * This is a simple script to handle config options.
 * Uses getCLIArgument to create nicely exported variables.
 *
 * Authored by Jacob Humston
 */
import { getCLIArgument, utilCLIValidators } from './managers/argv';

/** Port that the server should run on. Defaults to port 80. */
export const serverPort: number =
    (await getCLIArgument('serverPort', 'integer', true, utilCLIValidators.range(80, 6000))) ?? 80;

/**
 * Whether this server is in development mode or not.
 * Enabling this just adds some useful development tooling.
 * Defaults to true.
 */
export const isDev: boolean = (await getCLIArgument('isDev', 'boolean', true)) ?? true;

/** URL that can be used to access the website. Defaults to localhost */
export const serverURL: URL =
    (await getCLIArgument('serverURL', 'url', true)) ?? new URL(`http://localhost:${serverPort}`);

/** Config options as an object. */
const config = { serverPort, isDev, serverURL };

// make the object the default export for convince
export default config;
