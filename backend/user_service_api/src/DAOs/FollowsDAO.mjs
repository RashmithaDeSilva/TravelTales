import { getDatabasePool } from '../config/SQLCon.mjs';
import DatabaseErrors from '../utils/errors/DatabaseErrors.mjs';
import FollowsError from '../utils/errors/FollowsError.mjs';
import dotenv from 'dotenv';

dotenv.config();
const pool = await getDatabasePool();

class FollowsDAO {
    constructor () {
    }

    // Get followers count
    async getFollowersCount(userId) {
        try {
            const [row] = await pool.query(`SELECT COUNT(*) AS count FROM follows WHERE followed_id = ?`, [userId]);
            return row[0].count;

        } catch (error) {
            throw error;
        }
    }

    // Get followed count
    async getFollowedCount(userId) {
        try {
            const [row] = await pool.query(`SELECT COUNT(*) AS count FROM follows WHERE follower_id = ?`, [userId]);
            return row[0].count;

        } catch (error) {
            throw error;
        }
    }

    // Get followers count
    async getFollowersCount(userId) {
        try {
            const [row] = await pool.query(`SELECT COUNT(*) AS count FROM follows WHERE followed_id = ?`, [userId]);
            return row[0].count;

        } catch (error) {
            throw error;
        }
    }

    // Get followed count
    async getFollowedCount(userId) {
        try {
            const [row] = await pool.query(`SELECT COUNT(*) AS count FROM follows WHERE follower_id = ?`, [userId]);
            return row[0].count;

        } catch (error) {
            throw error;
        }
    }

    // Is following
    async isFollowing(follower_id, followed_id) {
        const [result] = await pool.query(`
            SELECT EXISTS (
                SELECT 1
                FROM follows
                WHERE follower_id = ? AND followed_id = ?
            ) AS is_following;
        `, [follower_id, followed_id]);
        return result[0]?.is_following !== 0;
    }

    // Follow user
    async followUser(follower_id, followed_id) {
        try {
            const isFollowing = await this.isFollowing(follower_id, followed_id);
            if (!isFollowing) {
                const [result] = await pool.query(`
                    INSERT INTO follows (follower_id, followed_id)
                    SELECT ?, ?
                    WHERE NOT EXISTS (SELECT 1 FROM follows WHERE follower_id = ? AND followed_id = ?);
                `, [follower_id, followed_id, follower_id, followed_id]);
                return result.affectedRows === 1
            }
            throw new Error(FollowsError.YOU_ALREADY_FOLLOW_THIS_PERSON);
            
        } catch (error) {
            throw error;
        }
    }

    // Unfollow user
    async unfollowUser(follower_id, unfollow_id) {
        try {
            const isFollowing = await this.isFollowing(follower_id, unfollow_id);
            if (isFollowing) {
                const [result] = await pool.query(`
                    DELETE FROM follows
                    WHERE follower_id = ? AND followed_id = ?;
                `, [follower_id, unfollow_id]);
                return result.affectedRows === 1
            }
            throw new Error(FollowsError.YOU_ARE_NOT_FOLLOWING_THIS_PERSON);
            
        } catch (error) {
            throw error;
        }
    }
}

export default FollowsDAO;