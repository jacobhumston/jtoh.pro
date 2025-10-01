/**
 * argv.ts exposes methods to parse CLI arguments.
 *
 * Authored by Jacob Humston
 */
import { argv } from 'node:process';

// remove the unneeded arguments
const args = argv.splice(0, 2);



export function parseArgs() {

}