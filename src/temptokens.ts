import { v4 } from 'uuid';

const tokens: { [key: string]: string } = {};

/**
 * Note: Will override previous token if it exists.
 */
export function generateTempToken(name: string) {
    const token = `T$${v4()}-${v4()}-${v4()}-${v4()}-${v4()}-${v4()}`;
    tokens[name] = token;
}

/**
 * Note: Generates missing token if not found.
 */
export function getTempToken(name: string) {
    return tokens[name] ?? generateTempToken(name);
}
