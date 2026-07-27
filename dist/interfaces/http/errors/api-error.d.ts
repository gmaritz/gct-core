export declare class ApiError extends Error {
    readonly statusCode: number;
    readonly title: string;
    readonly detail: string;
    readonly type: string;
    constructor(statusCode: number, title: string, detail: string, type: string);
}
//# sourceMappingURL=api-error.d.ts.map