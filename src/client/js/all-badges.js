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
        document.location.href = `/all-badges?user=${username}`;
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
        const response = await fetch(`${baseUrl}/api/badge-check/username/${foundUsername}`, { base: baseUrl }).catch(
            function (error) {
                console.log(error);
                errored = true;
                document.location.href = `/all-badges?error=Failed to make the request.`;
            }
        );
        if (errored) return;
        if (response.status !== 200) {
            const error = (await response.json()).error;
            document.location.href = `/all-badges?error=Something went wrong... ${error}`;
        } else {
            const data = (await response.json()).reverse();
            const badges = {};
            for (const badge of data) {
                badges[badge.details.source] = badges[badge.details.source] ?? [];
                badges[badge.details.source].push(badge);
            }

            for (const source of Object.keys(badges)) {
                badges[source] = badges[source].reverse();
            }

            const header = document.createElement('h1');
            header.innerText = `Viewing the badges of ${foundUsername}`;
            header.id = 'viewingHeader';
            contentDivider.insertAdjacentElement('beforeend', header);

            const goBackLink = document.createElement('a');
            goBackLink.innerText = 'Go Back';
            goBackLink.href = '/all-badges';
            goBackLink.id = 'goBackLink';
            contentDivider.insertAdjacentElement('beforeend', goBackLink);

            const shareResults = document.createElement('button');
            shareResults.innerText = 'Share Results';
            shareResults.type = 'button';
            shareResults.id = 'shareResults';
            contentDivider.insertAdjacentElement('beforeend', shareResults);

            const sectionDivider = document.createElement('div');
            sectionDivider.id = 'sectionDivider';
            contentDivider.insertAdjacentElement('beforeend', sectionDivider);

            const badgeListDivider = document.createElement('div');
            badgeListDivider.id = 'badgeListDivider';
            contentDivider.insertAdjacentElement('beforeend', badgeListDivider);

            function displaySection(source) {
                badgeListDivider.innerHTML = '';
                const foundBadges = badges[source];
                for (const badge of foundBadges) {
                    const div = document.createElement('div');
                    div.classList.add("badgeDetails")
                    badgeListDivider.insertAdjacentElement('beforeend', div);
                    
                    const icon = document.createElement('img')
                    icon.src = badge.details.imageUrl
                    icon.alt = "Badge Icon"
                    icon.classList.add("badgeDetailsIcon")
                    div.insertAdjacentElement("beforeend", icon)

                    const name = document.createElement('h2')
                    name.innerText = badge.details.name
                    name.classList.add("badgeDetailsName")
                    div.insertAdjacentElement("beforeend", name)

                    const description = document.createElement('p')
                    description.innerText = badge.details.description
                    description.classList.add("badgeDetailsDescription")
                    div.insertAdjacentElement("beforeend", description)

                    if (badge.owned) {
                        
                    } 
                }
            }

            for (const source of Object.keys(badges)) {
                const sourceButton = document.createElement('button');
                sourceButton.innerText = source;
                sourceButton.classList.add('sourceButton');
                sectionDivider.insertAdjacentElement('beforeend', sourceButton);
                sourceButton.addEventListener('click', () => displaySection(source));
            }

            statusText.remove();
        }
    }
});
