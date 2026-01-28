/**
 * This script manages the browser terminal,
 * used for fun!
 *
 * Authored by Jacob Humston
 */
import { Command } from 'commander';
import YAML from 'json-to-pretty-yaml';
import { UAParser } from 'ua-parser-js';

import { client } from '@client/modules/api';

const program = new Command();

program.exitOverride(() => null);

program.configureOutput({
    writeOut: (str) => print(str),
    writeErr: (str) => print(str),
    getOutHelpWidth: () => 80,
    getErrHelpWidth: () => 80,
    getOutHasColors() {
        return false;
    }
});

program
    .command('help')
    .description('Help command! Shows some useful info.')
    .action(() => {
        print(program.helpInformation());
    });

program
    .command('clear')
    .description('Clear the terminal.')
    .action(() => {
        for (const element of terminal.querySelectorAll('*')) {
            if (element instanceof HTMLPreElement) {
                element.remove();
            }
        }
    });

program
    .command('refresh')
    .description('Refresh the page.')
    .action(() => {
        document.location.reload();
    });

program
    .command('ping')
    .description('Check the ping of the server.')
    .action(async () => {
        const response = await client.GET('/api/ping');
        if (response.error) {
            print(`error: ${response.error.error}`);
        } else if (response.data) {
            print(`Cloudflare: ${response.data.cloudflare}\nGoogle: ${response.data.google}`);
        }
    });

program
    .command('user-agent')
    .description("Get information about your browser's user agent.")
    .action(async () => {
        const data = UAParser(navigator.userAgent);
        print(YAML.stringify(data));
    });

const terminal = document.getElementById('terminal') as HTMLDivElement;
const input = document.getElementById('input') as HTMLInputElement;
const info = document.getElementById('info') as HTMLDivElement;
if (!terminal) throw new Error('Terminal is missing.');

/**
 * Print something to the terminal.
 * @param str The string to print.
 */
function print(str: string) {
    const element = document.createElement('pre');
    element.innerText = str;
    if (element.innerText.toLowerCase().includes('error')) element.style.color = 'var(--red)';
    if (element.innerText.toLowerCase().includes('success')) element.style.color = 'var(--green)';
    terminal?.insertBefore(element, input);
    element.scrollIntoView();
}

print('Welcome to the jtoh.pro terminal. 🕵️');
print('Need help? Type "help" for help!');

const ogPlaceholder = input.placeholder;

input.addEventListener('keyup', async (event) => {
    if (event.key === 'Enter') {
        const v = input.value.split(' ');
        input.value = '';
        input.disabled = true;
        input.placeholder = 'Command is executing... please wait.';
        await program.parseAsync(v, { from: 'user' }).catch(() => null);
        input.disabled = false;
        input.placeholder = ogPlaceholder;
        input.focus();
    }
});

input.focus();

const version = await client.GET('/api/version');
if (version.data) info.innerText = `jtoh.pro v${version.data.version}`;
