import fs from 'node:fs';

const users: any = [];
const groupId = '4777338';

async function getMembers(cursor?: any) {
    let url = `https://groups.roblox.com/v1/groups/${groupId}/users?limit=100&sortOrder=Asc`;
    if (cursor) url = `${url}&cursor=${cursor}`;
    console.log('Fetching members...');
    const response = await fetch(url);
    if (response.status !== 200) {
        console.log(`Failed to load badges, trying again in 5 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return await getMembers(cursor);
    } else {
        const json = await response.json();
        const data = json.data;
        if (data.length === 0) {
            console.log('Skipping... (0 members returned)');
            return;
        }
        for (const user of data) {
            users.push({
                username: user.user.username,
                displayName: user.user.displayName,
                id: user.user.userId,
                hasVerifiedBadge: user.user.hasVerifiedBadge,
                role: user.role.name
            });
            console.log(`Loaded ${user.user.username}.`);
        }
        console.log(`Successfully loaded ${data.length} members.`);
        if (json.nextPageCursor !== null) {
            return await getMembers(json.nextPageCursor);
        } else {
            return;
        }
    }
}

await getMembers();

console.log(`All ${users.length} members have been loaded.`);

if (!fs.existsSync('etc/group-members')) fs.mkdirSync('etc/group-members', { recursive: true });

fs.writeFileSync(
    'etc/group-members/jtoh.json',
    JSON.stringify({ lastUpdated: new Date(), count: users.length, members: users }, null, 4)
);

console.log('Updated data/group-members.json');
