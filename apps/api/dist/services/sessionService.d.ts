export interface Session {
    id: string;
    user_id: string;
    title?: string;
    description?: string;
    chart_data: any;
    audio_config?: any;
    narration?: any;
    export_links?: any;
    is_public: boolean;
    tags?: string[];
    remix_of_session_id?: string;
    play_count: number;
    like_count: number;
    created_at: string;
    updated_at: string;
}
export interface CreateSessionData {
    title?: string;
    description?: string;
    chart_data: any;
    audio_config?: any;
    narration?: any;
    is_public?: boolean;
    tags?: string[];
    remix_of_session_id?: string;
}
export declare class SessionService {
    /**
     * Create a new session
     */
    static createSession(userId: string, data: CreateSessionData): Promise<Session>;
    /**
     * Get session by ID
     */
    static getSessionById(sessionId: string): Promise<Session | null>;
    /**
     * Get user's sessions
     */
    static getUserSessions(userId: string, limit?: number, offset?: number): Promise<Session[]>;
    /**
     * Get public sessions
     */
    static getPublicSessions(limit?: number, offset?: number, sortBy?: string): Promise<Session[]>;
    /**
     * Update session
     */
    static updateSession(sessionId: string, userId: string, updates: Partial<Session>): Promise<Session>;
    /**
     * Delete session
     */
    static deleteSession(sessionId: string, userId: string): Promise<void>;
    /**
     * Increment play count
     */
    static incrementPlayCount(sessionId: string): Promise<void>;
    /**
     * Like/unlike session
     */
    static toggleLike(sessionId: string, userId: string): Promise<{
        liked: boolean;
        likeCount: number;
    }>;
    /**
     * Add comment to session
     */
    static addComment(sessionId: string, userId: string, comment: string): Promise<void>;
    /**
     * Get session comments
     */
    static getSessionComments(sessionId: string, limit?: number, offset?: number): Promise<any[]>;
    /**
     * Search sessions
     */
    static searchSessions(query: string, limit?: number, offset?: number): Promise<Session[]>;
}
//# sourceMappingURL=sessionService.d.ts.map