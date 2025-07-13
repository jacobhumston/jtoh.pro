import { getLoggedInUser } from '../libs/auth';
import { addChild, createElement, getElementByIdExpected, waitForPageLoad } from '../libs/util';

export default async function () {
    await waitForPageLoad();

    const container = getElementByIdExpected('accountSettingsContainer', 'div');
    if (!container) return;

    container.innerHTML = '';

    const loggedInUser = await getLoggedInUser();
    if (!loggedInUser.user) {
        const element = createElement('p');
        element.innerText = 'You must be logged in to access custom site settings.';
        return addChild(container, element);
    }
}
