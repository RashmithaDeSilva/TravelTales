import { getDatabasePool } from '../config/SQLCon.mjs';
import PostModel from '../models/PostModel.mjs';
import PostErrors from '../utils/errors/PostErrors.mjs';
import dotenv from 'dotenv';


dotenv.config();
const PAGE = process.env.PAGE;
const SIZE = process.env.SIZE;
const pool = await getDatabasePool();


class PostDAO {
    constructor () {
    }

    // Create post
    async create(post) {
        try {
            const [result] = await pool.query(`
                INSERT INTO posts (
                    user_id,
                    title, 
                    content, 
                    country, 
                    date_of_visit, 
                    image_id
                ) values (?, ?, ?, ?, ?, ?)
            `, [post.userId, post.title, post.content, post.country, post.dateOfVisit, post.imageId]);
            if (result.affectedRows !== 1) {
                throw new Error(PostErrors.POST_IS_NOT_CREATED_TRY_AGAIN);
            }
            return result.affectedRows !== 0

        } catch (error) {
            throw error;
        }
    }

    // Check image id is exist
    async imageIdIsExist(imageId) {
        try {
            const [result] = await pool.query(`
                SELECT EXISTS(
                    SELECT 1 FROM posts WHERE image_id = ?
                ) AS image_id_exists;
            `, [imageId]);
            if (result[0].image_id_exists !== 0) {
                throw new Error(PostErrors.IMAGE_ID_IS_EXIST);
            }
            return false;
            
        } catch (error) {
            throw error;
        }
    }

    // Get posts with optional filtering and pagination
    async getPostsFilter(page = PAGE, size = SIZE, country = null, userId = null) {
        try {
            let query = `SELECT * FROM posts`;
            const conditions = [];
            const params = [];

            // Apply filters if present
            if (country) {
                conditions.push(`country LIKE ?`);
                params.push(`${country}%`); // starts with
            }

            if (userId) {
                conditions.push(`user_id = ?`);
                params.push(userId);
            }

            // Add WHERE clause if needed
            if (conditions.length > 0) {
                query += ` WHERE ` + conditions.join(' AND ');
            }

            // Add ORDER and pagination
            query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
            params.push(parseInt(size), (parseInt(page) - 1) * parseInt(size));

            const [rows] = await pool.query(query, params);

            // Convert each row into a PostModel instance
            return rows.map(row => 
                new PostModel(null, row.title, row.content, row.country, row.date_of_visit, row.image_id, row.created_at, row.id)
            );

        } catch (error) {
            throw error;
        }
    }

    async getPostById(postId) {
        try {
            const [results] = await pool.query(
                `
                SELECT 
                    p.id,
                    p.user_id,
                    p.title,
                    p.content,
                    p.country,
                    p.date_of_visit,
                    p.image_id,
                    p.created_at,
                    COUNT(DISTINCT c.id) AS comment_count,
                    SUM(CASE WHEN pr.reaction_type = 'LIKE' THEN 1 ELSE 0 END) AS like_count,
                    SUM(CASE WHEN pr.reaction_type = 'DISLIKE' THEN 1 ELSE 0 END) AS dislike_count
                FROM posts p
                LEFT JOIN comments c ON p.id = c.post_id
                LEFT JOIN post_reactions pr ON p.id = pr.post_id
                WHERE p.id = ?
                GROUP BY p.id
                `,
                [postId]
            );

            if (results.length === 0) throw new Error(PostErrors.INVALID_POST_ID);
            const row = results[0];

            const post = new PostModel(
                row.user_id,
                row.title,
                row.content,
                row.country,
                row.date_of_visit,
                row.image_id,
                row.created_at,
                row.id,
                [],
                row.comment_count || 0,
                Number(row.like_count) || 0,
                Number(row.dislike_count) || 0
            );

            return post;

        } catch (error) {
            throw error;
        }
    }

    // Get posts
    async getPosts(page = PAGE, pageSize = SIZE) {
        try {
            const [rows] = await pool.query(
                `
                SELECT 
                    p.id,
                    p.user_id,
                    p.title,
                    p.content,
                    p.country,
                    p.date_of_visit,
                    p.image_id,
                    p.created_at,
                    COUNT(DISTINCT c.id) AS comment_count,
                    SUM(CASE WHEN pr.reaction_type = 'LIKE' THEN 1 ELSE 0 END) AS like_count,
                    SUM(CASE WHEN pr.reaction_type = 'DISLIKE' THEN 1 ELSE 0 END) AS dislike_count
                FROM posts p
                LEFT JOIN comments c ON p.id = c.post_id
                LEFT JOIN post_reactions pr ON p.id = pr.post_id
                GROUP BY p.id
                ORDER BY p.title ASC
                LIMIT ? OFFSET ?
                `,
                [pageSize, (page - 1) * pageSize]
            );

            const posts = rows.map(row => new PostModel(
                row.user_id,
                row.title,
                row.content,
                row.country,
                row.date_of_visit,
                row.image_id,
                row.created_at,
                row.id,
                [],
                row.comment_count,
                Number(row.like_count) || 0,
                Number(row.dislike_count) || 0
            ));

            return posts;

        } catch (error) {
            throw error;
        }
    }

    // Check if comment exists
    async isExist(postId) {
        try {
            const [result] = await pool.query(`
                SELECT EXISTS(
                    SELECT 1 FROM posts WHERE id = ?
                ) AS post_exists;
            `, [postId]);
            if (result[0].post_exists !== 1) {
                throw new Error(PostErrors.INVALID_POST_ID);
            }
            return true;

        } catch (error) {
            throw error;
        }
    }

    // Update comment
    async update(post) {
        try {
            const isExist = await this.isExist(post.id);
            if (isExist) {
                const [result] = await pool.query(`
                    UPDATE posts
                    SET title = ?,
                    content = ?,
                    country = ?,
                    date_of_visit = ?
                    WHERE id = ? AND user_id = ?
                `, [post.title, post.content, post.country, post.dateOfVisit, post.id, post.userId]);
                return result.affectedRows !== 0;
            }
            return false;

        } catch (error) {
            throw error;
        }
    }

    // Delete comment
    async delete(post) {
        try {
            const isExist = await this.isExist(post.id);
            if (isExist) {
                const [result] = await pool.query(`
                    DELETE FROM posts
                    WHERE id = ? AND user_id = ?
                `, [post.id, post.userId]);
                
                return result.affectedRows !== 0;
            }
            return false;

        } catch (error) {
            throw error;
        }
    }

}


export default PostDAO;
