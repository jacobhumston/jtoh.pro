import { loadImage } from '@napi-rs/canvas';

export default {
    questionMarkMan: await loadImage('src/web/app/assets/question-mark-man.png'),
    defaultRobloxProfile: await loadImage('src/web/app/assets/default-roblox-profile.png')
};
