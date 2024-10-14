type CompletedTypes = {
    citadel?: number;
    steeple?: number;
    tower?: number;
};

type Difficulties = {
    [key: string]: string;
};

type DifficultyColors = {
    [key: string]: string;
};

type DifficultyProgress = {
    [key: string]: [number, number];
};

export interface TowerData {
    completed_areas: string[];
    completed_towers: number;
    completed_types: CompletedTypes;
    difficulties: Difficulties;
    difficulty_colors: DifficultyColors;
    difficulty_progress: DifficultyProgress;
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
}

export type LoggedInUser = {
    id: number;
    username: string;
    name: string;
    thumbnail: string;
};
