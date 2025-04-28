import fs from 'node:fs';

const blankTemplate = fs.readFileSync('src/web/app/templates/blank.html', 'utf8');

export function renderTemplate(title: string, content: string, head?: string): string {
    let result = blankTemplate.replaceAll('{{TITLE}}', title).replace('{{CONTENT}}', content);
    if (head) result = result.replace('{{HEAD}}', head);
    else result = result.replace('{{HEAD}}', '');
    return result;
}
