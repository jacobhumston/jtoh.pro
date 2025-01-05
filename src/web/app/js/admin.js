(async () => {
    const _window = window;
    _window.addEventListener('load', () => {
        /** @type {import('@xterm/xterm').Terminal} */
        const terminal = new Terminal();
        const _document = document;
        const url = new URL(_window.location.href);
        const websocket = new WebSocket(`${url.protocol === 'https:' ? 'wss' : 'ws'}://${url.host}/ext/admin/terminal`);
        const terminalConnectedStatus = _document.getElementById('terminalConnectedStatus');

        terminal.open(_document.getElementById('terminal'));
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
    });
})();
