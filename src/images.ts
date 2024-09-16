import { loadImage } from '@napi-rs/canvas';

export default {
    questionMarkMan: await loadImage('src/web/question-mark-man.png'),
    defaultRobloxProfile: await loadImage('src/web/default-roblox-profile.png')
};
