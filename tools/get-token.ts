/**
 * Simple utility to get a token from the command line.
 *
 * Authored by Jacob Humston
 */
import tokens from '../src/server/modules/tokens';

console.log(tokens[process.argv[2] as keyof typeof tokens]);
