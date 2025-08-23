import * as tokens from '../src/tokens.ts';

console.log(tokens[process.argv[2] as keyof typeof tokens]);
