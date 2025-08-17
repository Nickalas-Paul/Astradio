import { Request, Response } from 'express';
import { User } from '../auth';
interface SessionRequest extends Request {
    user?: User;
}
export interface Session {
    id: string;
    user_id: string;
    title: string;
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
export declare class SessionController {
    /**
     * Save a new session
     */
    static saveSession(req: SessionRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get user's sessions
     */
    static getUserSessions(req: SessionRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get a specific session by ID
     */
    static getSession(req: SessionRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Update session
     */
    static updateSession(req: SessionRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Delete session
     */
    static deleteSession(req: SessionRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get public sessions
     */
    static getPublicSessions(req: Request, res: Response): Promise<void>;
    /**
     * Like/unlike a session
     */
    static toggleLike(req: SessionRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export {};
//# sourceMappingURL=sessionController.d.ts.map