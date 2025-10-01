/**
 * argv.ts exposes methods to parse CLI arguments.
 * Should be good enough for what I need it for.
 *
 * TODO: fix the hell that is these types (not a big enough deal atm to worry about it)
 * * results are always 'never', so it was all pointless?
 *
 * Authored by Jacob Humston
 */

// remove the unneeded arguments
const args = [...process.argv].splice(2);

/** An expected argument. */
export type ExpectedArg<T extends 'string' | 'number' | 'boolean' = 'string' | 'number' | 'boolean'> = {
    /** Name of this argument. */
    name: string;
    /** Type of this argument. */
    type: T;
    /**
     * Whether this argument is optional or not.
     * NOTE: This should always be false for boolean arguments.
     */
    optional: boolean;
    /** Optional validator function to run. Should throw error if failed. */
    validator?: (value: T extends 'string' ? string : T extends 'number' ? number : boolean) => void | Promise<void>;
};

/** An expected argument with its parsed value. */
export type ParsedArg<T extends ExpectedArg> = T & {
    /** The parsed value of this argument. */
    value: T extends { type: 'string'; optional: true }
        ? string | null
        : T extends { type: 'string'; optional: false }
          ? string
          : T extends { type: 'number'; optional: true }
            ? number | null
            : T extends { type: 'number'; optional: false }
              ? number
              : T extends { type: 'boolean'; optional: true }
                ? boolean | null
                : T extends { type: 'boolean'; optional: false }
                  ? boolean
                  : never;
};

/**
 * Create an expected argument.
 * @param arg The expected argument to create.
 * @returns The expected argument.
 */
export function createExpectedArg<T extends 'string' | 'number' | 'boolean'>(arg: ExpectedArg<T>): ExpectedArg<T> {
    return arg;
}

/**
 * Parse arguments, providing your expected ones.
 * @param expectedArgs The arguments you expect.
 * @returns The expected arguments, throws errors when needed.
 */
export async function parseArgs<T extends readonly ExpectedArg[]>(
    expectedArgs: T
): Promise<{
    [K in keyof T]: T[K] extends ExpectedArg ? ParsedArg<T[K]> : never;
}> {
    const results: any = [];
    for (const arg of expectedArgs) {
        const newArg: any = { ...arg };
        const nameIndex = args.findIndex((a) => a === `--${arg.name}`);
        const foundValue = nameIndex === -1 ? undefined : args[nameIndex + 1];

        // handle boolean arguments (optional is ignored here)
        if (arg.type === 'boolean') {
            nameIndex === -1 ? (newArg.value = false) : (newArg.value = true);
            if (arg.validator) await arg.validator(newArg.value);
            results.push(newArg);
            continue;
        }

        // handle missing arguments
        if (nameIndex === -1 || foundValue === undefined || foundValue.startsWith('--')) {
            if (arg.optional !== true)
                throw Error(`Argument '${arg.name}' (typeof ${arg.type}) was expected but not provided.`);
            newArg.value = null;
            results.push(newArg);
        } else {
            let value: string | number = foundValue;
            // handle number arguments
            if (arg.type === 'number') {
                value = parseFloat(value);
                if (isNaN(value))
                    throw new Error(
                        `Value provided for the argument '${arg.name}' was expected to be a number, however was NaN instead.`
                    );
            } else if (arg.type === 'string') {
                if (value.length === 0)
                    throw new Error(`Value provided for the argument '${arg.name}' received an empty string.`);
            }
            if (arg.validator) await arg.validator(value);
            newArg.value = value;
            results.push(newArg);
        }
    }
    return results;
}

/**
 * A simple range validator which can be used to validate arguments.
 * @param value The provided value.
 * @param min The minimum number for this range.
 * @param max The maximum number for this range.
 */
export function minMaxValidator(value: number, min: number, max: number) {
    if (value > max || value < min) throw new Error(`Provided value is not in range. (${min}-${max})`);
}
