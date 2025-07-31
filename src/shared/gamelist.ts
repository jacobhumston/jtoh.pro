export type gameNames = 'etoh' | 'cscd';
export type capitalizedGameNames = 'EToH' | 'CSCD';
export type fullNames = 'Eternal Towers of Hell' | "Caleb's Soul Crushing Domain";

export const gameNamesArray: gameNames[] = ['etoh', 'cscd'];
export const capitalizedGameNamesArray: capitalizedGameNames[] = ['EToH', 'CSCD'];
export const fullNamesArray: fullNames[] = ['Eternal Towers of Hell', "Caleb's Soul Crushing Domain"];

export const gameChartColors: { [key in gameNames]: string } = {
    etoh: '#ff4336',
    cscd: '#6679d1ff'
};
