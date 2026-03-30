/**
 * Simple script to manage the credits page.
 *
 * Authored by Jacob Humston
 */
const brandLogos = {
    discord: 'discord.png',
    facebook: 'facebook.jpeg',
    github: 'github.png',
    instagram: 'instagram.jpeg',
    roblox: 'roblox.jpeg',
    twitch: 'twitch.jpeg',
    x: 'x.jpeg',
    youtube: 'youtube.jpeg'
};

type brands = keyof typeof brandLogos;

const credits: Array<{
    name: string;
    username: string;
    role: string;
    bio: string | null;
    type: 'staff' | 'contributor';
    socials: Array<{ brand: brands; display: string; url: string | null }>;
}> = [
    {
        name: 'LovelyJacob',
        username: 'LoveliestJacob',
        role: 'Owner',
        bio: 'I enjoy typing away on computers.',
        type: 'staff',
        socials: [
            {
                brand: 'discord',
                display: 'lovelyjacob',
                url: 'https://discord.com/users/539194357706653696'
            },
            {
                brand: 'roblox',
                display: 'LoveliestJacob',
                url: 'https://www.roblox.com/users/2614622891/profile'
            },
            {
                brand: 'youtube',
                display: 'LovelyJacob',
                url: 'https://www.youtube.com/@LovelyJacob'
            },
            {
                brand: 'github',
                display: 'jacobhumston',
                url: 'https://github.com/jacobhumston'
            }
        ]
    },
    {
        name: 'Halo',
        username: 'TheHaloDeveloper',
        role: 'Administrator',
        bio: 'Creator of TowerStats.com',
        type: 'staff',
        socials: [
            {
                brand: 'roblox',
                display: 'TheHaloDeveloper',
                url: 'https://www.roblox.com/users/257770975/profile'
            }
        ]
    },
    {
        name: 'SirSamiboi',
        username: 'TheRealSamiBoi',
        role: 'Skill Points Creator',
        bio: null,
        type: 'contributor',
        socials: [
            {
                brand: 'roblox',
                display: 'TheRealSamiBoi',
                url: 'https://www.roblox.com/users/381696232/profile'
            }
        ]
    },
    {
        name: 'Pen',
        username: 'idefinitelyhateemos',
        role: 'Website Moderator',
        bio: 'im so awesome',
        type: 'staff',
        socials: [
            {
                brand: 'discord',
                display: 'ireallyhateemos',
                url: 'https://discord.com/users/530715483180105764'
            },
            {
                brand: 'roblox',
                display: 'idefinitelyhateemos',
                url: 'https://www.roblox.com/users/460721855/profile'
            }
        ]
    },
    {
        name: 'TehPig',
        username: 'TehPig_YT',
        role: 'Website Moderator',
        bio: null,
        type: 'staff',
        socials: [
            {
                brand: 'roblox',
                display: 'TehPig_YT',
                url: 'https://www.roblox.com/users/322468106/profile'
            }
        ]
    },
    {
        name: 'Skittle',
        username: 'SkittleVerse',
        role: 'Website Moderator',
        bio: null,
        type: 'staff',
        socials: [
            {
                brand: 'roblox',
                display: 'SkittleVerse',
                url: 'https://www.roblox.com/users/2471855998/profile'
            }
        ]
    },
    {
        name: 'ItzMeZenith',
        username: 'XChocolateMLGX',
        role: 'Discord Moderator',
        bio: null,
        type: 'staff',
        socials: [
            {
                brand: 'roblox',
                display: 'XChocolateMLGX',
                url: 'https://www.roblox.com/users/224561275/profile'
            }
        ]
    }
];

window.addEventListener('DOMContentLoaded', async function () {
    const container = document.getElementById('credits');
    if (!container) return console.error('Credits container is missing!');

    const staffContainer = document.getElementById('staff') as HTMLElement;
    const contributorsContainer = document.getElementById('contributors') as HTMLElement;

    for (const credit of credits) {
        const memberContainer = document.createElement('div');
        memberContainer.classList.add('member');

        const avatar = document.createElement('img');
        avatar.classList.add('avatar');
        avatar.src = `/assets/credits/${credit.username}.webp`;
        avatar.alt = `${credit.name} (@${credit.username})`;

        const details = document.createElement('div');
        details.classList.add('details');

        const role = document.createElement('p');
        role.classList.add('role');
        role.innerText = credit.role;

        const name = document.createElement('p');
        name.classList.add('name');
        name.innerText = credit.name;

        const username = document.createElement('p');
        username.classList.add('username');
        username.innerText = `@${credit.username}`;

        const bio = document.createElement('p');
        bio.classList.add('bio');
        bio.innerText = credit.bio ?? '';
        if (!credit.bio) bio.style.display = 'none';

        details.append(role, name, username, bio);

        const socials = document.createElement('div');
        socials.classList.add('socials');

        for (const social of credit.socials) {
            const contact = document.createElement('div');
            contact.classList.add('social');

            const brand = document.createElement('img');
            brand.classList.add('logo');
            brand.src = `/assets/brands/${brandLogos[social.brand]}`;
            brand.alt = `${social.brand} Logo`;

            const location = document.createElement('a');
            location.classList.add('display');
            location.innerText = social.display;
            if (social.url) location.href = social.url;

            contact.append(brand, location);
            socials.insertAdjacentElement('beforeend', contact);
        }

        memberContainer.append(avatar, details, socials);

        if (credit.type === 'staff') {
            staffContainer.insertAdjacentElement('beforeend', memberContainer);
        } else {
            contributorsContainer.insertAdjacentElement('beforeend', memberContainer);
        }
    }
});
