import { loadImage } from '@napi-rs/canvas';

export default {
    questionMarkMan: await loadImage('src/web/app/assets/question-mark-man.png'),
    defaultRobloxProfile: await loadImage('src/web/app/assets/default-roblox-profile.png'),
    robloxVerifiedLogo: await loadImage('src/web/app/assets/roblox-verified.svg'),
    robloxVideoStarLogo: await loadImage('src/web/app/assets/video-star-icon.webp')
};
