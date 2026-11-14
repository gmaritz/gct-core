export interface DevelopmentIngressConfig {
    readonly peerAddress: "127.0.0.1";
    readonly credential: string;
}
export declare function loadDevelopmentIngressConfig(env: NodeJS.ProcessEnv, environment: string): DevelopmentIngressConfig | undefined;
//# sourceMappingURL=development-ingress.config.d.ts.map