import { addChild, addClass, createElement, getElementById, getWebIconHTML, waitForPageLoad } from '../libs/util';

/**
 * Function to update blog details if needed.
 */
export async function updateBlogDetails() {
    await waitForPageLoad();
    const blogDetails = getElementById('blogDetails');
    if (blogDetails) {
        const data = JSON.parse(decodeURIComponent(blogDetails.dataset.json ?? ''));

        const createdSpan = createElement('span', {
            innerHTML: `${getWebIconHTML('calendar_add_on')} <b>Posted:</b> ${new Date(data.created).toLocaleString()}`
        });

        const editedSpan = createElement('span', {
            innerHTML: `${getWebIconHTML('edit')} <b>Last Edited:</b> ${new Date(data.lastEdited).toLocaleString()}${data.editCount > 1 ? ` <i>(${data.editCount} Edits)</i>` : ''}`
        });
        addChild(blogDetails, [createdSpan, createElement('br'), editedSpan]);

        const source = createElement('a', {
            target: '_blank',
            href: data.source,
            innerText: 'This post is open source.'
        });
        addClass(source, 'blogSource');

        const parent = blogDetails.parentElement as HTMLElement;
        addChild(parent, source);
    }
}
