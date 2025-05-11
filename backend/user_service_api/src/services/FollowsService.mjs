import FollowsDAO from '../DAOs/FollowsDAO.mjs';
import UserService from './UserService.mjs';
import dotenv from 'dotenv';


dotenv.config();


class FollowsService {
    constructor() {
        this.followsDAO = new FollowsDAO();
        this.UserService = new UserService();
    }

    // Get followers & followed
    async getFollowersAndFollowed(userId) {
        try {
            const followersCount = await this.followsDAO.getFollowersCount(userId);
            const followedCount = await this.followsDAO.getFollowedCount(userId);

            return {
                "followers": followersCount,
                "followed": followedCount,
            }

        } catch (error) {
            throw error;
        }
    }

    // Follow user
    async followUser(follower_id, followed_id) {
        try {
            const isIdExists = await this.UserService.isIdExists(followed_id);
            if (isIdExists) {
                await this.followsDAO.followUser(follower_id, followed_id);
            }

        } catch (error) {
            throw error;
        }
    }

    // Unfollow user
    async unfollowUser(follower_id, unfollow_id) {
        try {
            const isIdExists = await this.UserService.isIdExists(unfollow_id);
            if (isIdExists) {
                await this.followsDAO.unfollowUser(follower_id, unfollow_id);
            }

        } catch (error) {
            throw error;
        }
    }
}


export default FollowsService;