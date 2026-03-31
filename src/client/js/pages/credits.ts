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
    youtube: 'youtube.jpeg',
    bluesky: 'bluesky.jpeg',
    steam: 'steam.jpeg',
    tiktok: 'tiktok.webp',
    reddit: 'reddit.jpeg',
    spotify: 'spotify.jpeg',
    web: 'web.png'
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
        bio: 'Creator of <a href="https://towerstats.com" target="_blank">TowerStats.com<a>',
        type: 'staff',
        socials: [
            {
                brand: 'discord',
                display: 'thehalodeveloper',
                url: 'https://discord.com/users/1152788342392508447'
            },
            {
                brand: 'roblox',
                display: 'TheHaloDeveloper',
                url: 'https://www.roblox.com/users/257770975/profile'
            },
            {
                brand: 'github',
                display: 'TheHaloDeveloper',
                url: 'https://github.com/TheHaloDeveloper'
            }
        ]
    },
    {
        name: 'SirSamiboi',
        username: 'TheRealSamiBoi',
        role: 'Skill Points Creator',
        bio: 'SirSamiboi created the original concept behind Skill Points. It can be found on <a href="https://github.com/SirSamiboi/etoh-pp" target="_blank">GitHub</a>.',
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
        bio: '"Half developer, half gamer, fully distracted."',
        type: 'staff',
        socials: [
            {
                brand: 'discord',
                display: 'tehpig_yt',
                url: 'https://discord.com/users/298432708269441034'
            },
            {
                brand: 'roblox',
                display: 'TehPig_YT',
                url: 'https://www.roblox.com/users/322468106/profile'
            },
            {
                brand: 'bluesky',
                display: 'techpig.tehcraft.xyz',
                url: 'https://bsky.app/profile/did:plc:potoakqb3oazb6k7zdlcgia5'
            },
            {
                brand: 'github',
                display: 'TehPig',
                url: 'https://github.com/TehPig'
            },
            {
                brand: 'spotify',
                display: 'TehPig_YT',
                url: 'https://open.spotify.com/user/5467mml73tyswxrxxeu3foweo'
            },
            {
                brand: 'steam',
                display: 'TehPig',
                url: 'https://steamcommunity.com/id/tehpigyt/'
            },
            {
                brand: 'tiktok',
                display: 'tehpig_yt',
                url: 'https://www.tiktok.com/@tehpig_yt'
            },
            {
                brand: 'twitch',
                display: 'techpiglive',
                url: 'https://www.twitch.tv/techpiglive'
            },
            {
                brand: 'twitch',
                display: 'techpigyt',
                url: 'https://www.twitch.tv/techpigyt'
            },
            {
                brand: 'x',
                display: 'TechPigYT',
                url: 'https://x.com/TechPigYT'
            },
            {
                brand: 'youtube',
                display: 'TechPigYT',
                url: 'https://www.youtube.com/channel/UC5ir67ugxcQH2_taceOE3Fg'
            },
            {
                brand: 'youtube',
                display: 'TechPigExtra',
                url: 'https://www.youtube.com/channel/UCZSeLRViO3nVeZUon2eOscw'
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
        bio.innerHTML = credit.bio ?? '';
        if (!credit.bio) bio.style.display = 'none';

        details.append(role, name, username, bio);

        const socials = document.createElement('div');
        socials.classList.add('socials');

        credit.socials = credit.socials.toSorted((a, b) => b.display.localeCompare(a.display));

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
            location.target = '_blank';
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
