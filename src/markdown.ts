import markdownit from 'markdown-it';

export const md = markdownit({ breaks: true, linkify: true, typographer: true });
export const renderMarkdown = (markdown: string) => md.render(markdown);
