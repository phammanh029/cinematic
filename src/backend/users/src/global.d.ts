export interface Process {
    env: {
        PORT: number;
    };
    exit(code?: number): void;
    on(name: string, callback: () => void): void;
}
