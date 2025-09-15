import { window } from '../libs/global';
import { Terminal } from '@xterm/xterm';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { waitForPageLoad, getElementById, getWebsocketURL } from '../libs/util';
import { log } from '../libs/logger';

export default async function () {
    await waitForPageLoad();

    const websocket = new WebSocket(getWebsocketURL('terminal'));
    const terminalConnectedStatus = getElementById('terminalConnectedStatus') as HTMLDivElement;
    const terminalContainer = getElementById('terminal') as HTMLDivElement;

    const terminal = new Terminal();

    terminal.loadAddon(new WebLinksAddon());
    terminal.open(terminalContainer);
    terminal.onData((data) => websocket.send(data));

    websocket.addEventListener('message', (event) => {
        if (new URL(event.origin).hostname !== new URL(window.location.origin).hostname) {
            log('warn', `Blocked terminal message from origin ${event.origin}`);
            return;
        }
        terminal.write(event.data);
    });

    websocket.addEventListener('open', () => {
        terminalConnectedStatus.innerText = 'Terminal is currently connected!';
    });

    websocket.addEventListener('close', () => {
        terminalConnectedStatus.innerText = 'Terminal is currently disconnected! Refresh to reconnect.';
    });

    websocket.addEventListener('error', () => {
        terminalConnectedStatus.innerText = 'Terminal is currently disconnected! Refresh to reconnect.';
    });

    terminalConnectedStatus.innerText = 'Terminal is currently connecting...';

    function fit() {
        terminal.resize(Math.floor(terminalContainer.clientWidth / 9), Math.floor(terminalContainer.clientHeight / 20));
    }

    new ResizeObserver(() => fit).observe(terminalContainer);
    fit();
}
