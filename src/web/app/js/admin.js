(async () => {
    /** @type {import('@xterm/xterm').Terminal} */
    const terminal = new Terminal();
    const _document = document;
    const _window = window;

    _window.addEventListener('load', () => {
        terminal.open(_document.getElementById('terminal'));
    });
})();
