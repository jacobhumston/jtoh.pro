import fs from 'node:fs';

const blankTemplate = fs.readFileSync('src/web/app/templates/blank.html', 'utf8');

export function renderTemplate(title: string, content: string) {
    return blankTemplate.replaceAll('{{TITLE}}', title).replace('{{CONTENT}}', content);
}
