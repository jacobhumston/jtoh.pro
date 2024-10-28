async function load() {
    const result = await fetch('http://localhost/$random').catch(console.error);
    if (!result) {
        console.log(`[${new Date().toDateString()}]`, 'result', 'error');
        await new Promise((resolve) => setTimeout(resolve, 6000));
        load();
        return;
    }
    console.log(`[${new Date().toLocaleTimeString()}]`, 'result', result.statusText);
    await new Promise((resolve) => setTimeout(resolve, 6000));
    load();
}

load();
