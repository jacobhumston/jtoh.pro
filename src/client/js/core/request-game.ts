import { isLoggedIn } from '../libs/auth';
import { getWebToken } from '../libs/security';
import { getElementByIdExpected, waitForPageLoad } from '../libs/util';

export default async function () {
    await waitForPageLoad();

    const input = getElementByIdExpected('gameUrlInput', 'input');
    const submitButton = getElementByIdExpected('submitRequest', 'button');

    if (!input || !submitButton) {
        return;
    }

    if (!(await isLoggedIn())) {
        alert('You must be logged in to request a game.');
        sessionStorage.setItem('LoginRedirect', window.location.href);
        window.location.href = '/login';
        return;
    }

    submitButton.addEventListener('click', async () => {
        const url = input.value;
        if (!url) {
            alert('Please enter a URL.');
            return;
        }

        input.disabled = true;
        submitButton.disabled = true;

        const response = await fetch(
            `/api/request-game?url=${encodeURIComponent(url)}&captcha=${await getWebToken()}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.ok) {
            alert('Game request submitted successfully!');
            const data = await response.json();
            window.location.href = data.url;
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error}`);
        }

        input.disabled = false;
        submitButton.disabled = false;
    });
}
