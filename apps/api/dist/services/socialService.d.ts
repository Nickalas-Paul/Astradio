import { User } from '../auth';
export interface FriendRequest {
    user_id: string;
    friend_id: string;
    status: 'pending' | 'accepted' | 'blocked';
    created_at: string;
}
export interface SocialStats {
    followers: number;
    following: number;
    totalSessions: number;
    totalLikes: number;
    totalPlays: number;
}
export declare class SocialService {
    /**
     * Send friend request
     */
    static sendFriendRequest(userId: string, friendId: string): Promise<void>;
    /**
     * Accept friend request
     */
    static acceptFriendRequest(userId: string, friendId: string): Promise<void>;
    /**
     * Reject friend request
     */
    static rejectFriendRequest(userId: string, friendId: string): Promise<void>;
    /**
     * Unfriend user
     */
    static unfriendUser(userId: string, friendId: string): Promise<void>;
    /**
     * Block user
     */
    static blockUser(userId: string, friendId: string): Promise<void>;
    /**
     * Get user's friends
     */
    static getUserFriends(userId: string): Promise<User[]>;
    /**
     * Get user's followers
     */
    static getUserFollowers(userId: string): Promise<User[]>;
    /**
     * Get pending friend requests
     */
    static getPendingFriendRequests(userId: string): Promise<User[]>;
    /**
     * Get user's social stats
     */
    static getUserSocialStats(userId: string): Promise<SocialStats>;
    /**
     * Get friends' recent activity
     */
    static getFriendsActivity(userId: string, limit?: number): Promise<any[]>;
    /**
     * Search users
     */
    static searchUsers(query: string, limit?: number): Promise<User[]>;
    /**
     * Get user profile with stats
     */
    static getUserProfile(userId: string): Promise<{
        user: User;
        stats: SocialStats;
        recentSessions: any[];
    }>;
}
//# sourceMappingURL=socialService.d.ts.map