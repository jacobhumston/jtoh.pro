window.addEventListener('load', function () {
    const statusText = document.getElementById('statusText');
    const usernameInput = document.getElementById('usernameInput');
    const addAccountSubmitButton = document.getElementById('addAccountSubmitButton');
    let debounce = false;
    addAccountSubmitButton.addEventListener('click', async function () {
        debounce = true;
        statusText.innerText = 'Loading...';
        const username = usernameInput.value;
        if (!username || username === '') {
            debounce = false;
            statusText.innerText = 'No username was provided.';
            return;
        }
        
        debounce = false;
    });
});
