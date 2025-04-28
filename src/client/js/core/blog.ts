import { addChild, addClass, createElement, getElementById, getWebIconHTML, waitForPageLoad } from '../libs/util';

export default async function () {
    await waitForPageLoad();

    const blogPostsList = getElementById('blogPostsList') as HTMLDivElement;
    if (!blogPostsList) return;

    let sort = 'created';
    const url = new URL(window.location.href);
    const params = url.searchParams;

    if (params.has('sort')) {
        sort = params.get('sort') as string;
    }

    const list = await fetch('/api/blog-posts?sort=' + sort).catch(() => null);

    if (!list) {
        blogPostsList.innerHTML = '<p>Failed to fetch data.</p>';
        return;
    }

    const data = await list.json();
    if (data.error) {
        blogPostsList.innerHTML = '<p>Failed to fetch data.</p>';
        return;
    }

    function update() {
        let posts = data.posts;
        const search = (getElementById('blogSearch') as HTMLInputElement).value;
        if (search && search.length > 0) {
            posts = posts.filter((post: any) => {
                return (
                    post.title.toLowerCase().includes(search.toLowerCase()) ||
                    post.summary.toLowerCase().includes(search.toLowerCase()) ||
                    post.author.user.displayName.toLowerCase().includes(search.toLowerCase())
                );
            });
        }

        blogPostsList.innerHTML = '';
        for (const post of posts) {
            const postElement = createElement('div');
            addClass(postElement, 'blogPostListElement');

            const title = createElement('h2', { innerText: post.title });

            const author = createElement('span', {
                innerHTML: `${getWebIconHTML('person')} <b>By:</b> <a href="https://roblox.com/users/${post.author.user.id}/profile/">${post.author.user.displayName}</a>`
            });

            const created = createElement('span', {
                innerHTML: `${getWebIconHTML('calendar_add_on')} <b>Posted:</b> ${new Date(post.created).toLocaleString()}`
            });

            const summary = createElement('p', { innerText: post.summary });

            const viewButton = createElement('a', { href: post.path, innerText: 'View Post' });
            addClass(viewButton, 'blogPostViewButton');

            addChild(postElement, [title, author, createElement('br'), created, summary, viewButton]);

            addChild(blogPostsList, postElement);

            if (search && search.length > 0) {
                const searchRegex = new RegExp(search, 'gi');
                title.innerHTML = title.innerHTML.replaceAll(
                    searchRegex,
                    (match) => `<span class="highlight">${match}</span>`
                );
                summary.innerHTML = summary.innerHTML.replaceAll(
                    searchRegex,
                    (match) => `<span class="highlight">${match}</span>`
                );
                author.innerHTML = `${getWebIconHTML('person')} <b>By:</b> <a href="https://roblox.com/users/${post.author.user.id}/profile/">${post.author.user.displayName.replaceAll(
                    searchRegex,
                    (match: any) => `<span class="highlight">${match}</span>`
                )}</a>`;
            }
        }

        if (posts.length === 0) {
            blogPostsList.innerHTML = '<p>No results found for your search query.</p>';
        }
    }

    update();

    const blogSort = getElementById('blogSort');
    if (blogSort) {
        blogSort.addEventListener('change', (event: any) => {
            window.location.href = `/app/blog?sort=${event.target.value}`;
        });
        for (const option of blogSort.getElementsByTagName('option')) {
            if (option.value === sort) {
                option.selected = true;
            }
        }
    }

    const blogSearch = getElementById('blogSearch') as HTMLInputElement;
    const blogSearchButton = getElementById('blogSearchButton') as HTMLButtonElement;
    const blogClearSearchButton = getElementById('blogClearSearchButton') as HTMLButtonElement;

    blogSearch.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            update();
        }
    });
    blogSearchButton.addEventListener('click', update);
    blogClearSearchButton.addEventListener('click', () => {
        blogSearch.value = '';
        update();
    });
}
