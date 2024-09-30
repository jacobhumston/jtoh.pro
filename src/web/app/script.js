function updateExampleOutput() {
    let username = document.getElementById('exampleInputUsername').value;
    if (!username || username.length === 0) username = 'LoveliestJacob';
    document.getElementById('exampleImageOutput').src = '';
    document.getElementById('exampleImageOutput').src = `/${username}`;
}

async function copyExampleOutputURL(button) {
    if (button.innerHTML === `${getGoogleIconHTML('check')} Copied!`) return;
    let username = document.getElementById('exampleInputUsername').value;
    if (!username || username.length === 0) username = 'LoveliestJacob';
    document.getElementById('exampleImageOutput').src = `/${username}`;
    const url = document.getElementById('exampleImageOutput').src;
    let uuid = '';
    try {
        uuid = window.crypto.randomUUID();
    } catch (e) {
        console.error(e);
        uuid = '';
    } finally {
        if (uuid !== '') {
            uuid = `?nocache=${uuid.split('-')[0]}`;
        }
    }
    await navigator.clipboard.writeText(`${url}${uuid}`).catch(() => alert('Failed to copy to clipboard!'));
    let ogText = button.innerHTML;
    button.innerHTML = `${getGoogleIconHTML('check')} Copied!`;
    button.classList.add('successButton');
    setTimeout(() => {
        button.innerHTML = ogText;
        button.classList.remove('successButton');
    }, 2000);
}

async function copyExampleOutputImage(button) {
    if (
        button.innerHTML === `${getGoogleIconHTML('check')} Copied!` ||
        button.innerHTML === `${getGoogleIconHTML('pending')} Loading...`
    )
        return;
    let username = document.getElementById('exampleInputUsername').value;
    if (!username || username.length === 0) username = 'LoveliestJacob';
    document.getElementById('exampleImageOutput').src = `/${username}`;
    const url = document.getElementById('exampleImageOutput').src;
    let ogText = button.innerHTML;
    button.innerHTML = `${getGoogleIconHTML('pending')} Loading...`;
    const image = await fetch(url)
        .then((response) => response.blob())
        .catch(() => null);
    await navigator.clipboard
        .write([new ClipboardItem({ 'image/png': image })])
        .catch(() => alert('Failed to copy to clipboard!'));
    button.innerHTML = `${getGoogleIconHTML('check')} Copied!`;
    button.classList.add('successButton');
    setTimeout(() => {
        button.innerHTML = ogText;
        button.classList.remove('successButton');
    }, 2000);
}

async function downloadExampleOutputImage(button) {
    if (
        button.innerHTML === `${getGoogleIconHTML('check')} Downloaded!` ||
        button.innerHTML === `${getGoogleIconHTML('downloading')} Downloading...`
    )
        return;
    let username = document.getElementById('exampleInputUsername').value;
    if (!username || username.length === 0) username = 'LoveliestJacob';
    document.getElementById('exampleImageOutput').src = `/${username}`;
    const url = document.getElementById('exampleImageOutput').src;
    let ogText = button.innerHTML;
    button.innerHTML = `${getGoogleIconHTML('downloading')} Downloading...`;
    const image = await fetch(url)
        .then((response) => response.blob())
        .catch(() => null);
    URL.createObjectURL(image);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${username.toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    button.innerHTML = `${getGoogleIconHTML('check')} Downloaded!`;
    button.classList.add('successButton');
    setTimeout(() => {
        button.innerHTML = ogText;
        button.classList.remove('successButton');
    }, 2000);
}

async function copyURL(url, button) {
    if (button.innerHTML === `${getGoogleIconHTML('check')} Copied!`) return;
    await navigator.clipboard.writeText(url).catch(() => alert('Failed to copy to clipboard!'));
    let ogText = button.innerHTML;
    button.innerHTML = `${getGoogleIconHTML('check')} Copied!`;
    button.classList.add('successButton');
    setTimeout(() => {
        button.innerHTML = ogText;
        button.classList.remove('successButton');
    }, 2000);
}

window.addEventListener('DOMContentLoaded', () => {
    const week = document.getElementById('requestStatsWeek');
    const month = document.getElementById('requestStatsMonth');
    const year = document.getElementById('requestStatsYear');
    const total = document.getElementById('requestStatsTotal');
    if (!week || !month || !year || !total) return;
    const formatter = new Intl.NumberFormat();
    fetch('/ext/request-count')
        .then((response) => response.json())
        .then((data) => {
            week.innerText = formatter.format(data.week);
            month.innerText = formatter.format(data.month);
            year.innerText = formatter.format(data.year);
            total.innerText = formatter.format(data.total);
        })
        .catch(() => {
            week.innerText = 'Failed to fetch data';
            month.innerText = 'Failed to fetch data';
            year.innerText = 'Failed to fetch data';
            total.innerText = 'Failed to fetch data';
        });
    document.getElementById('exampleInputUsername').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            updateExampleOutput();
        }
    });
});

// Switched to server setup.
/*
window.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const templates = {
        headerLinks: `<div id="websitesBar">
                <a href="/app/">JToH</a>
                <a href="/app/fangame/cscd/">CSCD</a>
                <a href="/app/fangame/jtohxl/">JToH XL</a>
                <a href="/app/fangame/eta/">ETA</a>
                <a href="/app/fangame/atos/">AToS</a>
            </div>
            <div id="menuBar">
                <a href="/app/">Home</a>
                <a href="/app/update-log">Update Log</a>
                <a href="/app/faq">FAQ</a>
                <a href="https://discord.com/oauth2/authorize?client_id=1285148080189997107" target="_blank">
                    Discord Bot
                </a>
            </div>`
    };
    for (const element of root.getElementsByTagName('template')) {
        if (element.dataset && templates[element.dataset.name]) {
            element.outerHTML = templates[element.dataset.name];
        }
    }
});
*/

function getGoogleIconHTML(name) {
    return `<span class="material-symbols-rounded">${name}</span>`;
}

window.addEventListener('DOMContentLoaded', () => {
    const head = document.head;
    const title = head.dataset.page;
    if (title) {
        document.title = `jtoh.pro - ${title}`;
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const username = params.get('user');
    if (username && document.getElementById('exampleInputUsername')) {
        document.getElementById('exampleInputUsername').value = encodeURIComponent(username.slice(0, 20));
        updateExampleOutput();
    }
});

window.addEventListener('load', () => {
    const root = document.documentElement;
    root.classList.add('isLoaded');
});

window.addEventListener('DOMContentLoaded', () => {
    const leaderboards = [{ div: 'jtohCardLeaderboard', id: 'jtoh' }];
    for (const leaderboard of leaderboards) {
        const div = document.getElementById(leaderboard.div);
        if (!div) continue;
        fetch(`/ext/leaderboards/${leaderboard.id}`)
            .then((response) => response.json())
            .then((response) => {
                if (response.error) {
                    div.innerHTML = `<p>Something went wrong.</p>`;
                    console.log(response.error);
                    return;
                }
                for (const data of response.result) {
                    const user = data.user;
                    const count = data.count;
                    const row = document.createElement('div');
                    row.classList.add('leaderboardRow');
                    const icon = document.createElement('img');
                    icon.src = user.thumbnail;
                    icon.alt = 'User Icon';
                    icon.classList.add('leaderboardIcon');
                    row.appendChild(icon);
                    const name = document.createElement('span');
                    name.innerText = user.name;
                    name.classList.add('leaderboardName');
                    row.appendChild(name);
                    const countElement = document.createElement('span');
                    countElement.innerText = count;
                    countElement.classList.add('leaderboardCount');
                    row.appendChild(countElement);
                    div.appendChild(row);
                }
            })
            .catch((error) => {
                console.error(error);
                div.innerHTML = '<p>Failed to fetch data.</p>';
            });
    }
});
