import fs from 'node:fs';

export function createLeadboardBlacklistFile() {
    const name = 'db/leaderboards-blacklist.json';
    if (!fs.existsSync(name)) {
        fs.writeFileSync(name, '[]');
    }
    return name;
}
