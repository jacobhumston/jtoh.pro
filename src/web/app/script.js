function updateExampleOutput() {
    let username = document.getElementById('exampleInputUsername').value;
    if (!username || username.length === 0) username = 'LoveliestJacob';
    document.getElementById('exampleImageOutput').src = `/${username}`;
}

async function copyExampleOutputURL(button) {
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
    let ogText = button.innerText;
    if (button.innerText === 'Copied!') return;
    button.innerText = 'Copied!';
    button.classList.add('successButton');
    setTimeout(() => {
        button.innerText = ogText;
        button.classList.remove('successButton');
    }, 2000);
}

async function copyURL(url, button) {
    await navigator.clipboard.writeText(url).catch(() => alert('Failed to copy to clipboard!'));
    let ogText = button.innerText;
    if (button.innerText === 'Copied!') return;
    button.innerText = 'Copied!';
    button.classList.add('successButton');
    setTimeout(() => {
        button.innerText = ogText;
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
