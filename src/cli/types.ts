export type Command = {
    name: string;
    description: string;
    args: {
        name: string;
        description: string;
        required: boolean;
        type: string;
    }[];
    execute: (args: string[], cookie: string | null) => Promise<void>;
};
