export interface TowerData {
    completed_areas: string[];
    completed_towers: number;
    completed_types: {
        citadel?: number;
        steeple?: number;
        tower?: number;
    };
    difficulties: {
        [key: string]: string;
    };
    difficulty_colors: {
        [key: string]: string;
    };
    difficulty_progress: {
        [key: string]: [number, number];
    };
    donated_amount: number;
    hardest_abbreviation: string | null;
    hardest_raw_difficulty: number;
    hardest_tower: string | null;
    has_sc_completion: boolean;
    id: number;
    skill_points: number;
    sub_difficulties: {
        '0.01': 'Bottom';
        '0.11': 'Bottom-Low';
        '0.22': 'Low';
        '0.33': 'Low-Mid';
        '0.45': 'Mid';
        '0.56': 'Mid-High';
        '0.67': 'High';
        '0.78': 'High-Peak';
        '0.89': 'Peak';
    };
    total_towers: number;
    username: string;
    error: string | undefined;
}

export type LoggedInUser = {
    id: number;
    username: string;
    name: string;
    thumbnail: string;
};
