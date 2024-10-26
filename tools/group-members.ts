import fs from 'node:fs';

async function wrap(groupid: string) {
    const users: any = [];
    async function getMembers(groupid: string, cursor?: any) {
        let url = `https://groups.roblox.com/v1/groups/${groupid}/users?limit=100&sortOrder=Asc`;
        if (cursor) url = `${url}&cursor=${cursor}`;
        console.log(`[${groupid}] Fetching members...`);
        const response = await fetch(url).catch(() => null);
        if (!response) {
            console.log(`[${groupid}] Failed to load badges, trying again in 5 seconds...`);
            await new Promise((resolve) => setTimeout(resolve, 5000));
            return await getMembers(groupid, cursor);
        } else if (response.status !== 200) {
            console.log(`[${groupid}] Failed to load badges, trying again in 5 seconds...`);
            await new Promise((resolve) => setTimeout(resolve, 5000));
            return await getMembers(groupid, cursor);
        } else {
            const json = await response.json();
            const data = json.data;
            if (data.length === 0) {
                console.log(`[${groupid}] Skipping... (0 members returned)`);
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
                console.log(`[${groupid}] Loaded ${user.user.username}. (${users.length})`);
            }
            console.log(`[${groupid}] Successfully loaded ${data.length} members.`);
            if (json.nextPageCursor !== null) {
                return await getMembers(groupid, json.nextPageCursor);
            } else {
                return;
            }
        }
    }
    await getMembers(groupid);
    return users;
}

if (!fs.existsSync('etc/group-members')) fs.mkdirSync('etc/group-members', { recursive: true });

{
    const users = await wrap('4777338'); // jtoh
    const name = 'JToH';
    console.log(`[${name}] All ${users.length} members have been loaded.`);
    fs.writeFileSync(
        'etc/group-members/jtoh.json',
        JSON.stringify({ lastUpdated: new Date(), count: users.length, members: users })
    );
    console.log(`[${name}] Updated json`);
}

{
    const users = await wrap('15425334'); // cscd
    const name = 'CSCD';
    console.log(`[${name}] All ${users.length} members have been loaded.`);
    fs.writeFileSync(
        'etc/group-members/cscd.json',
        JSON.stringify({ lastUpdated: new Date(), count: users.length, members: users })
    );
    console.log(`[${name}] Updated json`);
}

{
    const users = await wrap('4199740'); // roblox video starts
    const name = 'Roblox Video Starts';
    console.log(`[${name}] All ${users.length} members have been loaded.`);
    fs.writeFileSync(
        'etc/group-members/rvs.json',
        JSON.stringify({ lastUpdated: new Date(), count: users.length, members: users })
    );
    console.log(`[${name}] Updated json`);
}

{
    const users = await wrap('3959677'); // BIG Games Pets
    const name = 'BIG Games Pets';
    console.log(`[${name}] All ${users.length} members have been loaded.`);
    fs.writeFileSync(
        'etc/group-members/bgp.json',
        JSON.stringify({ lastUpdated: new Date(), count: users.length, members: users })
    );
    console.log(`[${name}] Updated json`);
}
