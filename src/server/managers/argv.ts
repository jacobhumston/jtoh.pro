/**
 * argv.ts exposes methods to parse CLI arguments.
 * Should be good enough for what I need it for.
 *
 * The first version of this was so insanely messy,
 * lets just say I am very pleased with the current one!
 *
 * Authored by Jacob Humston
 */
import process from 'node:process';

// remove the unneeded arguments, avoid modifying the original array
const args = [...process.argv].splice(2);

/** CLI argument map. */
export type CLIArgumentTypeMap = {
    string: string;
    float: number;
    integer: number;
    boolean: boolean;
    url: URL;
};

/**
 * Get a CLI argument's value.
 * @param name Name of the argument.
 * @param type Type of argument.
 * @param optional If the argument is optional or not.
 * @param validator Optional validator, used for special validation.
 * @returns The parsed result. Throws errors when needed.
 */
export async function getCLIArgument<T extends keyof CLIArgumentTypeMap, O extends boolean>(
    name: string,
    type: T,
    optional: O,
    validator?: (value: CLIArgumentTypeMap[T]) => void | Promise<void>
): Promise<O extends true ? CLIArgumentTypeMap[T] | null : CLIArgumentTypeMap[T]> {
    const argIndex = args.findIndex((arg) => arg === `--${name}`);
    const argValue = argIndex === -1 ? null : (args[argIndex + 1] ?? null);
    if (argValue === null) {
        if (optional === false) {
            throw new Error(`${name} expected a value but was not provided.`);
        } else {
            // @ts-expect-error Fixes a type error.
            return null;
        }
    }

    let result: any; // eslint-disable-line

    // parse strings
    if (type === 'string') {
        if (argValue.length <= 0) throw new Error(`${name} expected a string length greater then 0.`);
        result = argValue;
    }

    // parse int and floats
    if (type === 'float' || type === 'integer') {
        const parsed = type === 'float' ? parseFloat(argValue) : parseInt(argValue);
        if (isNaN(parsed)) throw new Error(`${name} expected a number but is NaN.`);
        result = parsed;
    }

    // parse boolean
    if (type === 'boolean') {
        if (argValue.toLowerCase() === 'true') result = true;
        else if (argValue.toLowerCase() === 'false') result = false;
        else throw new Error(`${name} expected a boolean.`);
    }

    // parse url
    if (type === 'url') {
        try {
            result = new URL(argValue);
        } catch {
            throw new Error(`${name} expected a valid url.`);
        }
        if (result.protocol !== 'http:' && result.protocol !== 'https:')
            throw new Error(`${name} expected a url with the 'http' or the 'https' protocol.`);
    }

    // run validator if needed
    if (validator) await validator(result);
    return result;
}

/** Utility cli validators. */
export const utilCLIValidators = {
    /**
     * Utility range validator.
     * @param min The minimum value.
     * @param max The maximum value.
     * @returns Throws an error if applicable.
     */
    range: function (min: number, max: number) {
        return function (value: number) {
            if (value < min || value > max) throw new Error(`Value must be in range of ${min}-${max}.`);
        };
    }
};

/**
 * A small wrapper around `getCLIArgument` that gets a boolean argument.
 * The default value if not provided is `false`.
 * @param name Name of the cli argument.
 * @returns The provided value or `false`.
 */
export async function getBooleanArg(name: string) {
    return (await getCLIArgument(name, 'boolean', true)) ?? false;
}
