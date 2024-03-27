document.title = `${document.title} - jtoh.pro (Juke's Towers of Hell Web Utility)`;
document.documentElement.dataset.theme = 'dark';

window.addEventListener('load', function () {
    const addAccountButton = document.getElementById('addAccountButton');
    addAccountButton.addEventListener('click', async function () {
        const username = prompt('What is the username of the account you wish to add?');
        if (username) {
            const response = await (await fetch(`/api/username-to-id/${username}`)).json();
            if (response.passed === true) {
                
            } else {
                alert("Invalid username provided.")
            }
        }
    });
});
