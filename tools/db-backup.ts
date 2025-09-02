import { $ } from 'bun';
import { readdirSync, existsSync, mkdirSync } from 'fs';
import filenamify from 'filenamify';

const perf = performance;
const timestamp = filenamify(new Date().toISOString());

const start = perf.now();

if (!existsSync(`./.backups/${timestamp}/`)) mkdirSync(`./.backups/${timestamp}/`, { recursive: true });

console.log('sqlite3:', await $`sqlite3 --version`.text());

for (const file of readdirSync('./db', { withFileTypes: true })) {
    if (file.isFile() && file.name.endsWith('.sqlite')) {
        const start = perf.now();
        await $`sqlite3 ./db/${file.name} .dump > ./.backups/${timestamp}/${file.name.replace('.sqlite', '.sql')}`;
        console.log(`Backed up ${file.name} in ${((perf.now() - start) / 1000).toPrecision(2)}s`);
    }
}

console.log(`Total time elapsed: ${((perf.now() - start) / 1000).toPrecision(2)}s`);
