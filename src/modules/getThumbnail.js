/**
 * Get the icon of badges.
 * @param {Array<number>} badgeIds
 * @returns {Promise<Array<{ id: number, url: string | null }>>}
 */
export async function getBadgeIcons(badgeIds) {
    const response = await fetch(
        `https://thumbnails.roblox.com/v1/badges/icons?badgeIds=${badgeIds.join(',')}&size=150x150&format=Png&isCircular=false`
    );
    if (response.status !== 200) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return await getBadgeIcons(badgeIds);
    } else {
        const thumbnails = badgeIds.map((id) => ({ id: id, url: null }));
        /** @type {Array<{ targetId: number, imageUrl: string }>} */
        const data = (await response.json()).data;
        for (const thumbnail of data) {
            const foundBadge = thumbnails.find((badge) => badge.id === thumbnail.targetId);
            foundBadge.url = thumbnail.imageUrl;
        }
        return thumbnails;
    }
}
