import fs from 'node:fs';
import type { Command } from './types';

export async  function getCommands(): Command[] {
    const files = fs.readdirSync('./src/cli/cmd');
	const newFiles = []

try {  
  for (const file of files) {
	const v = await import(`./cmd/${file}`);
     newFiles.push(v.default)
}
} catch (e) {
 console.log(e)
}
console.log(files)
return newFiles
}
