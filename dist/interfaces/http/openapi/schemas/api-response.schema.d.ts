export declare const apiResponseSchema: {
    name: string;
    type: string;
    properties: {
        status: {
            type: string;
            description: string;
        };
        message: {
            type: string;
            description: string;
        };
    };
};
export declare const pagedResponseSchema: {
    name: string;
    type: string;
    properties: {
        items: {
            type: string;
            items: {
                type: string;
            };
        };
        page: {
            type: string;
            minimum: number;
        };
        size: {
            type: string;
            minimum: number;
        };
        total: {
            type: string;
            minimum: number;
        };
    };
};
//# sourceMappingURL=api-response.schema.d.ts.map