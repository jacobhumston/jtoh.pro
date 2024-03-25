// Import modules.
import fs from 'node:fs';

// Get realms.
const realms = JSON.parse(fs.readFileSync('data/realms.json').toString('utf-8'));

// Check if the towers folder already exists, if not, create it.
if (!fs.existsSync('data/towers/')) fs.mkdirSync('data/towers/');

// Create all the tower files that are missing.
for (const realm of realms) {
    if (!fs.existsSync(`data/towers/${realm.acronym}.json`)) {
        console.log(`Creating missing file 'data/towers/${realm.acronym}.json'`);
        fs.writeFileSync(`data/towers/${realm.acronym}.json`, '{}');
    }
    if (realm.subrealms) {
        for (const subrealm of realm.subrealms) {
            if (!fs.existsSync(`data/towers/${subrealm.acronym}.json`)) {
                console.log(`Creating missing file 'data/towers/${subrealm.acronym}.json'`);
                fs.writeFileSync(`data/towers/${subrealm.acronym}.json`, '{}');
            }
        }
    }
}

// Log as completed.
console.log('All files have been checked and created as needed!');
