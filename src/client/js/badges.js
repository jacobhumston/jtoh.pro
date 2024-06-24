window.addEventListener('load', async function () {
    const statusText = document.getElementById('statusText');
    const usernameInput = document.getElementById('usernameInput');
    const addAccountSubmitButton = document.getElementById('accountSubmitButton');
    const contentDivider = document.getElementById('contentDivider');

    let debounce = false;
    addAccountSubmitButton.addEventListener('click', async function () {
        debounce = true;
        const username = usernameInput.value;
        if (!username || username === '') {
            debounce = false;
            statusText.innerText = 'No username was provided.';
            return;
        }
        document.location.href = `/badges?user=${username}`;
        debounce = false;
    });

    const foundError = new URL(document.location.href).searchParams.get('error');
    if (foundError) {
        statusText.innerText = foundError;
    }

    const foundUsername = new URL(document.location.href).searchParams.get('user');
    if (foundUsername) {
        usernameInput.remove();
        addAccountSubmitButton.remove();
        statusText.innerText = 'Loading badges... This may take a moment.';
        let errored = false;
        const baseUrl = new URL(document.location.href).origin;
        const response = await fetch(`${baseUrl}/api/username-redirect/badges/${foundUsername}`, {
            base: baseUrl
        }).catch(function (error) {
            console.log(error);
            errored = true;
            document.location.href = `/badges?error=Failed to make the request.`;
        });
        if (errored) return;
        if (response.status !== 200) {
            const error = (await response.json()).error;
            document.location.href = `/badges?error=Something went wrong... ${error}`;
        } else {
            const data = await response.json();
            const badgeData = data.result.reverse();
            const userData = data.user;
            const badges = {};
            for (const badge of badgeData) {
                badges[badge.details.source] = badges[badge.details.source] ?? [];
                badges[badge.details.source].push(badge);
            }

            for (const source of Object.keys(badges)) {
                badges[source] = badges[source].reverse();
            }

            const header = document.createElement('h1');
            const headerUser = document.createElement('span');
            headerUser.innerText = `${userData.displayName} (@${userData.name})`;
            header.innerText = `Viewing the badges of `;
            headerUser.id = 'viewingHeaderUser';
            header.insertAdjacentElement('beforeend', headerUser);
            header.id = 'viewingHeader';
            contentDivider.insertAdjacentElement('beforeend', header);

            const goBackLink = document.createElement('a');
            goBackLink.innerText = 'Go Back';
            goBackLink.href = '/badges';
            goBackLink.id = 'goBackLink';
            contentDivider.insertAdjacentElement('beforeend', goBackLink);

            const shareResults = document.createElement('button');
            shareResults.innerText = 'Share Results';
            shareResults.type = 'button';
            shareResults.id = 'shareResults';
            contentDivider.insertAdjacentElement('beforeend', shareResults);

            const sectionDivider = document.createElement('div');
            sectionDivider.id = 'sectionDivider';
            sectionDivider.innerHTML = 'Select Game: ';
            contentDivider.insertAdjacentElement('beforeend', sectionDivider);

            const otherDetails = document.createElement('div');
            otherDetails.id = 'otherDetails';
            contentDivider.insertAdjacentElement('beforeend', otherDetails);

            const search = this.document.createElement('input');
            search.id = 'searchInput';
            search.placeholder = 'Type here to search.';
            contentDivider.insertAdjacentElement('beforeend', search);

            const badgeListDivider = document.createElement('div');
            badgeListDivider.id = 'badgeListDivider';
            contentDivider.insertAdjacentElement('beforeend', badgeListDivider);

            function displaySection(source) {
                badgeListDivider.innerHTML = '';
                let foundBadges = badges[source];

                if (search.value !== '') {
                    foundBadges = foundBadges.filter(function (badge) {
                        const name = badge.details.name.toLowerCase();
                        const description = (badge.details.description ?? '').toLowerCase();
                        if (
                            name.includes(search.value.toLowerCase()) ||
                            description.includes(search.value.toLowerCase())
                        ) {
                            return true;
                        }
                        return false;
                    });
                }

                for (const badge of foundBadges) {
                    const div = document.createElement('div');
                    div.classList.add('badgeContainer');
                    badgeListDivider.insertAdjacentElement('beforeend', div);

                    const icon = document.createElement('img');
                    icon.src = badge.details.imageUrl;
                    icon.alt = 'Badge Icon';
                    icon.classList.add('badgeDetailsIcon');
                    div.insertAdjacentElement('beforeend', icon);

                    const details = document.createElement('div');
                    details.classList.add('badgeDetails');
                    div.insertAdjacentElement('beforeend', details);

                    const name = document.createElement('h2');
                    name.innerText = badge.details.name;
                    name.classList.add('badgeDetailsName');
                    details.insertAdjacentElement('beforeend', name);

                    const description = document.createElement('p');
                    description.innerText = (badge.details.description ?? 'This badge has no description.') + ` (${Intl.NumberFormat().format(badge.details.awardedCount)} Owners)`;
                    description.classList.add('badgeDetailsDescription');
                    details.insertAdjacentElement('beforeend', description);

                    if (badge.owned === true) {
                        div.classList.add('badgeDetailsOwned');
                        const awarded = document.createElement('p');
                        awarded.classList.add('badgeDetailsAwarded');
                        awarded.innerText = `✅ Awarded on ${new Date(badge.awarded).toLocaleTimeString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}.`;
                        details.insertAdjacentElement('beforeend', awarded);
                    } else {
                        div.classList.add('badgeDetailsNotOwned');
                    }
                }
            }

            let sourceButtons = [];
            let currentSource = '';

            for (const source of Object.keys(badges)) {
                const sourceButton = document.createElement('button');
                sourceButton.innerText = source;
                sourceButton.classList.add('sourceButton');
                sectionDivider.insertAdjacentElement('beforeend', sourceButton);
                sourceButton.addEventListener('click', () => {
                    for (const button of sourceButtons) {
                        button.classList.remove('sourceButtonActive');
                    }
                    sourceButton.classList.add('sourceButtonActive');
                    {
                        const owned = badges[source].filter((badge) => badge.owned === true).length;
                        const notOwned = badges[source].filter((badge) => badge.owned === false).length;
                        otherDetails.innerHTML = `<b>Owned</b>: ${owned} | <b>Not Owned</b>: ${notOwned} (%${Math.round((owned / (owned + notOwned)) * 100)} Owned)`;
                    }
                    currentSource = source;
                    displaySection(source);
                });
                sourceButtons.push(sourceButton);
                if (Object.keys(badges)[0] === source) sourceButton.click();
            }

            let lastValue = '';

            setInterval(() => {
                if (lastValue !== search.value) {
                    displaySection(currentSource);
                }
                lastValue = search.value;
            }, 500);

            statusText.remove();
        }
    }
});
