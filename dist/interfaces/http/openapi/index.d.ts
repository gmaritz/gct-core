export declare function createOpenApiDocument(): {
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
        contact: {
            name: string;
            email: string;
        };
        license: {
            name: string;
            url: string;
        };
    };
    servers: {
        url: string;
        description: string;
    }[];
    tags: {
        name: string;
        description: string;
    }[];
    paths: {
        "/": {
            get: {
                tags: string[];
                summary: string;
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        "/health": {
            get: {
                tags: string[];
                summary: string;
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        "/live": {
            get: {
                tags: string[];
                summary: string;
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        "/ready": {
            get: {
                tags: string[];
                summary: string;
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    "503": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        "/version": {
            get: {
                tags: string[];
                summary: string;
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        "/api/v1": {
            get: {
                tags: string[];
                summary: string;
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
    components: {
        schemas: {
            ApiResponse: {
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
            PagedResponse: {
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
            ProblemDetails: {
                name: string;
                type: string;
                properties: {
                    type: {
                        type: string;
                        description: string;
                    };
                    title: {
                        type: string;
                        description: string;
                    };
                    status: {
                        type: string;
                        description: string;
                    };
                    detail: {
                        type: string;
                        description: string;
                    };
                    instance: {
                        type: string;
                        description: string;
                    };
                    timestamp: {
                        type: string;
                        format: string;
                        description: string;
                    };
                };
                required: string[];
            };
        };
    };
};
//# sourceMappingURL=index.d.ts.map