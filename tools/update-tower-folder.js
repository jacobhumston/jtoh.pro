// Import modules.
import fs from 'node:fs';

// Get realms.
const realms = JSON.parse(fs.readFileSync('data/realms.json').toString('utf-8'));

// Check if the towers folder already exists, if not, create it.
if (!fs.existsSync('data/towers/')) fs.mkdirSync('data/towers/');
if (!fs.existsSync('data/towers/realms/')) fs.mkdirSync('data/towers/realms/');
if (!fs.existsSync('data/towers/subrealms/')) fs.mkdirSync('data/towers/subrealms/');

// Create all the tower files that are missing.
for (const realm of realms) {
    if (!fs.existsSync(`data/towers/realms/${realm.acronym}.json`)) {
        console.log(`Creating missing file 'data/towers/${realm.acronym}.json'`);
        fs.writeFileSync(
            `data/towers/realms/${realm.acronym}.json`,
            JSON.stringify({ name: realm.name, acronym: realm.acronym, towers: [] }, null, 4)
        );
    }
    if (realm.subrealms) {
        for (const subrealm of realm.subrealms) {
            if (!fs.existsSync(`data/towers/subrealms/${subrealm.acronym}.json`)) {
                console.log(`Creating missing file 'data/towers/${subrealm.acronym}.json'`);
                fs.writeFileSync(
                    `data/towers/subrealms/${subrealm.acronym}.json`,
                    JSON.stringify({ name: subrealm.name, acronym: subrealm.acronym, towers: [] }, null, 4)
                );
            }
        }
    }
}

// Log as completed.
console.log('All files have been checked and created as needed!');
