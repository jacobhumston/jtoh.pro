export type gameNames = 'etoh' | 'cscd' | 'tea';
export type capitalizedGameNames = 'EToH' | 'CSCD' | 'TEA';
export type fullNames = 'Eternal Towers of Hell' | "Caleb's Soul Crushing Domain" | 'The Eternal Abyss';

export const gameNamesArray: gameNames[] = ['etoh', 'cscd', 'tea'];
export const capitalizedGameNamesArray: capitalizedGameNames[] = ['EToH', 'CSCD', 'TEA'];
export const fullNamesArray: fullNames[] = [
    'Eternal Towers of Hell',
    "Caleb's Soul Crushing Domain",
    'The Eternal Abyss'
];

export const gameChartColors: { [key in gameNames]: string } = {
    etoh: '#ff4336',
    cscd: '#6679d1ff',
    tea: '#6a5a7f'
};
