/**
 * Flag manager and parser. This replaces the old argv manager.
 *
 * Authored by Jacob Humston
 */
import { FlagParser } from 'flags.ts';

const parser = new FlagParser([
    { name: 'port', type: 'number', required: false, description: 'The port the server should listen to.' },
    { name: 'dev', type: 'boolean', required: false, description: 'Enables some developer features if true.' },
    { name: 'url', type: 'url', required: false, description: 'The URL of the server.' },
    {
        name: 'skipBuild',
        type: 'boolean',
        required: false,
        description: 'If true, the build process is skipped on boot.'
    },
    {
        name: 'hotBuild',
        type: 'boolean',
        required: false,
        description: 'If true, the web server will rebuild static files when it detects changes in src/client.'
    },
    { name: 'minifyBuild', type: 'boolean', required: false, description: 'If true, static files will be minified.' },
    {
        name: 'prettyBuild',
        type: 'boolean',
        required: false,
        description: 'If true, static files will be prettified. (Not recommended.)'
    }
] as const);

const { port, dev, url, hotBuild, minifyBuild, skipBuild, prettyBuild } = parser.parse();
export { port, dev, url, hotBuild, minifyBuild, skipBuild, prettyBuild };
export const help = parser.help.bind(parser);
