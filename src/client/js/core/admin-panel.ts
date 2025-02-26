import type { Terminal } from '@xterm/xterm';
import type { WebLinksAddon } from '@xterm/addon-web-links';
import { waitForPageLoad, getElementById } from '../libs/util';

export default async function () {
    await waitForPageLoad();

    const url = new URL(window.location.href);
    const websocket = new WebSocket(
        `${url.protocol === 'https:' ? 'wss' : 'ws'}://${url.host}/api/socket?type=terminal`
    );
    const terminalConnectedStatus = getElementById('terminalConnectedStatus') as HTMLDivElement;
    const terminalContainer = getElementById('terminal') as HTMLDivElement;

    // @ts-expect-error
    const terminal = new Terminal();

    // @ts-expect-error
    terminal.loadAddon(new WebLinksAddon.WebLinksAddon());
    terminal.open(terminalContainer);
    terminal.onData((data) => websocket.send(data));

    websocket.addEventListener('message', (event) => terminal.write(event.data));

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
