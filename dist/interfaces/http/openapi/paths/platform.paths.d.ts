export declare const platformPaths: {
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
//# sourceMappingURL=platform.paths.d.ts.map