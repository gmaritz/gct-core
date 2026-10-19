import { AnonymousSessionRepository, AnonymousSessionOwner, IssuedAnonymousSession } from "./anonymous-session";
export declare class AnonymousSessionService {
    private readonly repository;
    private readonly lifetimeSeconds;
    private readonly now;
    constructor(repository: AnonymousSessionRepository, lifetimeSeconds: number, now?: () => Date);
    create(): Promise<IssuedAnonymousSession>;
    resolve(sessionId: string): Promise<(AnonymousSessionOwner & {
        readonly csrfToken: string;
    }) | null>;
    invalidate(ownerId: string): Promise<void>;
}
//# sourceMappingURL=anonymous-session-service.d.ts.map