import fs from 'node:fs';
import { Hono } from 'hono';
import { renderTemplate } from './blanktemplate';
import { renderMarkdown } from './markdown';
import { userIdToThumbnail, usernameToUser } from './roblox';
import { convertTo } from '@jacobhumston/tc.js';

function setupDir() {
    if (fs.existsSync('src/web/app/blog/')) fs.rmSync('src/web/app/blog/', { recursive: true, force: true });
    fs.mkdirSync('src/web/app/blog/');
}

const posts: any[] = [];

const tempDir = fs.mkdtempSync(`blog`);

async function setup() {
    posts.length = 0;

    const files = await fetch('https://api.github.com/repos/jacobhumston/data.jtoh.pro/contents/blog', {
        cache: 'no-store'
    }).catch(() => ({
        json: async () => []
    }));

    const filesJSON = await files.json();
    if (!Array.isArray(filesJSON)) {
        setTimeout(
            () => {
                setup();
            },
            convertTo({ minutes: 10 }, 'milliseconds')
        );
        return;
    }

    for (const file of filesJSON) {
        const content = await fetch(file.download_url, { cache: 'no-store' })
            .then((res) => res.text())
            .catch(() => '');
        const split = content.split('\n');

        if (!content.includes('<!--') || !content.includes('-->')) continue;

        const data: { [key: string]: string } = {};
        let dataString = '<!--\n';
        for (const line of split) {
            if (line === '<!--') continue;
            if (line === '-->') break;
            const [key, value] = line.split(': ');
            data[key] = value;
            dataString += `${key}: ${value}\n`;
        }
        dataString += '-->';

        const commits: any[] = await (
            await fetch(
                `https://api.github.com/repos/jacobhumston/data.jtoh.pro/commits?path=${file.path}&per_page=100`,
                { cache: 'no-store' }
            ).catch(() => ({ json: async () => [] }))
        ).json();

        const title = data.Title || 'Untitled';
        const author = data.Author || 'Not Specified';
        const summary = data.Summary || 'No summary provided.';
        const created = new Date(commits[commits.length - 1].commit.committer.date);
        const lastEdited = new Date(commits[0].commit.committer.date);
        const editCount = commits.length - 1;

        const user = (await usernameToUser(author).catch(() => ({ id: 0, displayName: 'Unknown' }))) ?? {
            id: 0,
            displayName: 'Unknown'
        };
        const thumbnail =
            (await userIdToThumbnail(user.id).catch(() => '/app/assets/default-roblox-profile.png')) ??
            '/app/assets/default-roblox-profile.png';

        const postData = {
            title,
            summary,
            author: {
                user: {
                    displayName: user.displayName,
                    id: user.id
                },
                thumbnail
            },
            path: `/app/blog/${file.name.replace('.md', '.html')}`,
            created,
            lastEdited,
            editCount,
            source: file.html_url
        };

        const html = renderMarkdown(content.replace(dataString, ''));
        const final = renderTemplate(
            title + ' - Blog Post',
            `<h1>Blog Post</h1>
            <p>
                Click 
                <a href="/app/blog">here</a> 
                to view all blog posts.
            </p>
            <p id="blogAuthor">
                <img alt="Blog Post Author Profile Picture" src="${thumbnail}" onerror="this.src='/app/assets/default-roblox-profile.png'">
                <span id="blogAuthorDetails">
                    This post was authored by 
                    <a href="https://www.roblox.com/users/${user.id}/profile" target="_blank">${user.displayName}</a>.
                </span>
                <br>
                <span id="blogDetails" data-json="${encodeURIComponent(JSON.stringify(postData))}"></span>
            </p>
            <div id="blogContainer">${html}</div>`,
            `<meta
                name="description"
                content="Easily share your Juke's Towers of Hell stats on Discord or other social medias with a single link. Includes support for other 'obby tower' related games on Roblox."
            />
            <meta property="og:title" content="jtoh.pro - Blog post by ${user.displayName}." />
            <meta
                property="og:description"
                content="${summary}"
            />
            <meta property="og:image" content="https://jtoh.pro/app/assets/media-card.png" />
            <meta property="twitter:card" content="summary_large_image" />
            `
        );

        fs.writeFileSync(`${tempDir}/${file.name.replace('.md', '.html')}`, final);

        posts.push(postData);
    }

    setupDir();
    for (const file of fs.readdirSync(tempDir)) {
        fs.copyFileSync(`${tempDir}/${file}`, `src/web/app/blog/${file}`);
    }
    fs.rmSync(tempDir, { recursive: true, force: true });

    setTimeout(
        () => {
            setup();
        },
        convertTo({ minutes: 10 }, 'milliseconds')
    );
}

export function blog(app: Hono) {
    setup();
    app.get('/ext/blog-posts', async (context) => {
        const sort = context.req.query('sort') || 'created';
        if (sort === 'created') {
            return context.json({
                posts: posts.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
            });
        } else if (sort === 'edited') {
            return context.json({
                posts: posts.sort((a, b) => new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime())
            });
        } else if (sort === 'title') {
            return context.json({
                posts: posts.sort((a, b) => a.title.localeCompare(b.title))
            });
        }
        return context.json({ error: 'Invalid sort method.' }, 400);
    });
}
