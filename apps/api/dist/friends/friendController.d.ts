import { Request, Response } from 'express';
import { User } from '../auth';
interface FriendRequest extends Request {
    user?: User;
}
export interface Friend {
    id: string;
    user_id: string;
    friend_id: string;
    status: 'pending' | 'accepted' | 'blocked';
    created_at: string;
    friend_name?: string;
    friend_email?: string;
}
export declare class FriendController {
    /**
     * Send friend request
     */
    static sendFriendRequest(req: FriendRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Accept friend request
     */
    static acceptFriendRequest(req: FriendRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Decline friend request
     */
    static declineFriendRequest(req: FriendRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get user's friends
     */
    static getFriends(req: FriendRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Remove friend
     */
    static removeFriend(req: FriendRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get friend's sessions (for overlay compatibility - requires Pro subscription)
     */
    static getFriendSessions(req: FriendRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Search for users to add as friends
     */
    static searchUsers(req: FriendRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export {};
//# sourceMappingURL=friendController.d.ts.map