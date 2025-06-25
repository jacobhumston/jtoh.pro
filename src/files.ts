import fs from 'node:fs';
// Note to self: This is required by the CLI, so a double logger will be made...
// (DON'T IMPORT THE MAIN LOGGER!)

export function createLeadboardBlacklistFile() {
    const name = 'db/leaderboards-blacklist.json';
    if (!fs.existsSync(name)) {
        fs.writeFileSync(name, '[]');
    }
    return name;
}

export function createModListFile() {
    const name = 'db/mod-list.json';
    if (!fs.existsSync(name)) {
        fs.writeFileSync(name, '[]');
    }
    return name;
}

export function createModLogFile() {
    const name = 'db/mod-log.json';
    if (!fs.existsSync(name)) {
        fs.writeFileSync(name, '[]');
    }
    return name;
}

export function createUploadCardBackgroundsReviewQueueFile() {
    const name = 'db/uploads-cards-backgrounds-review-queue.json';
    if (!fs.existsSync(name)) {
        fs.writeFileSync(name, '[]');
    }
    return name;
}

export function createGameRequestsFile() {
    const name = 'db/game-requests.json';
    if (!fs.existsSync(name)) {
        fs.writeFileSync(name, '[]');
    }
    return name;
}

export function cleanUpTemp() {
    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
    const failed: string[] = [];
    for (const file of fs.readdirSync('./temp')) {
        try {
            fs.rmSync(`./temp/${file}`, { force: true, recursive: true });
        } catch {
            failed.push(file);
        }
    }
    console.log(`Cleaned up temp files. (${failed.length} failed)`);
    //if (failed.length > 0) logger.warn(`Failed to delete temp files. (${failed.length}): ${failed.join(', ')}`);
}
