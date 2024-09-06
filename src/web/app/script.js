function updateExampleOutput() {
    const username = document.getElementById('exampleInputUsername').value;
    if (!username || username.length === 0) return;
    document.getElementById('exampleImageOutput').src = `/${username}`;
}

async function copyExampleOutputURL() {
    const username = document.getElementById('exampleInputUsername').value;
    if (!username || username.length === 0) return;
    document.getElementById('exampleImageOutput').src = `/${username}`;
    const url = document.getElementById('exampleImageOutput').src;
    await navigator.clipboard.writeText(url).catch(() => alert('Failed to copy to clipboard!'));
    alert('Copied to clipboard!');
}

async function copyURL(url) {
    await navigator.clipboard.writeText(url).catch(() => alert('Failed to copy to clipboard!'));
    alert('Copied to clipboard!');
}
