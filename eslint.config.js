import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.BaseConfig[]} */
export default [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            eqeqeq: 'error'
        }
    },
    {
        files: ['**/*.{ts,tsx}']
    },
    {
        ignores: ['tools/', 'static/']
    }
];
