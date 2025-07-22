export type gameNames = 'etoh' | 'cscd' | 'otoh';
export type capitalizedGameNames = 'EToH' | 'CSCD' | 'OToH';
export type fullNames = 'Eternal Towers of Hell' | "Caleb's Soul Crushing Domain" | 'OToH';

export const gameNamesArray: gameNames[] = ['etoh', 'cscd', 'otoh'];
export const capitalizedGameNamesArray: capitalizedGameNames[] = ['EToH', 'CSCD', 'OToH'];
export const fullNamesArray: fullNames[] = ['Eternal Towers of Hell', "Caleb's Soul Crushing Domain", 'OToH'];

export const gameChartColors: { [key in gameNames]: string } = {
    etoh: '#ff4336',
    cscd: '#6679d1ff',
    otoh: '#9a76faff'
};
