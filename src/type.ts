export interface TowerDataEToH {
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

export interface LoggedInUserWho extends LoggedInUser {
    who: {
        ip: string;
        browser: string;
        device: {
            type: string;
            vendor: string;
            model: string;
            os: {
                name: string;
                version: string;
            };
        };
    };
}

export type TowerDataCSCD = {
    completed_areas: string[];
    completed_towers: {
        aj: number;
        legit: number;
    };
    completed_types: {
        aj: {
            tower?: number;
            steeple?: number;
            citadel?: number;
        };
        legit: {
            tower?: number;
            steeple?: number;
            citadel?: number;
        };
    };
    difficulties: {
        [key: string]: string;
    };
    difficulty_colors: {
        [key: string]: string;
    };
    difficulty_colors_outlines: {
        [key: string]: string | null;
    };
    difficulty_progress: {
        aj: {
            [key: string]: [number, number];
        };
        legit: {
            [key: string]: [number, number];
        };
    };
    donated_amount: number;
    hardest_abbreviation: {
        aj: string | null;
        legit: string | null;
    };
    hardest_raw_difficulty: {
        aj: number;
        legit: number;
    };
    hardest_tower: {
        aj: string | null;
        legit: string | null;
    };
    has_sc_completion: {
        aj: boolean;
        legit: boolean;
    };
    id: string;
    skill_points: {
        aj: number;
        legit: number;
    };
    sub_difficulties: {
        [key: string]: string;
    };
    total_towers: number;
    username: string;
    error: string | undefined;
};
