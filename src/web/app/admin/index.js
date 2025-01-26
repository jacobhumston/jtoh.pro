(async () => {
    const _window = window;
    _window.addEventListener('load', () => {
        const _document = document;
        const _ResizeObserver = ResizeObserver;
        const url = new URL(_window.location.href);
        const websocket = new WebSocket(
            `${url.protocol === 'https:' ? 'wss' : 'ws'}://${url.host}/api/socket?type=terminal`
        );
        const terminalConnectedStatus = _document.getElementById('terminalConnectedStatus');
        const terminalContainer = _document.getElementById('terminal');
        /** @type {import('@xterm/xterm').Terminal} */
        const terminal = new Terminal();

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
            terminal.resize(
                Math.floor(terminalContainer.clientWidth / 9),
                Math.floor(terminalContainer.clientHeight / 20)
            );
        }

        new ResizeObserver(() => fit).observe(terminalContainer);
        fit();
    });
})();
