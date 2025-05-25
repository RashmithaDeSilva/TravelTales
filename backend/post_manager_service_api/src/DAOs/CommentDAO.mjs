import { getDatabasePool } from '../config/SQLCon.mjs';
import CommentModel from '../models/CommentModel.mjs';
import dotenv from 'dotenv';
import CommentErrors from '../utils/errors/CommentErrors.mjs';


dotenv.config();
const PAGE = process.env.PAGE;
const SIZE = process.env.SIZE;
const pool = await getDatabasePool();


class CommentDAO {
    constructor () {
    }

    // Create comment
    async create(comment) {
        try {
            const [result] = await pool.query(`
                INSERT INTO comments (
                    user_id, 
                    post_id, 
                    content
                ) values (?, ?, ?)
            `, [comment.userId, comment.postId, comment.content]);
            return result.affectedRows !== 0

        } catch (error) {
            throw error;
        }
    }

    // Check if comment exists
    async isExist(commentId) {
        try {
            const [result] = await pool.query(`
                SELECT EXISTS(
                    SELECT 1 FROM comments WHERE id = ?
                ) AS comments_exists;
            `, [commentId]);
            if (result[0].comments_exists !== 1) {
                throw new Error(CommentErrors.INVALID_COMMENT_ID);
            }
            return true;

        } catch (error) {
            throw error;
        }
    }

    // Update comment
    async update(comment) {
        try {
            const isExist = await this.isExist(comment.id);
            if (isExist) {
                const [result] = await pool.query(`
                    UPDATE comments
                    SET content = ? 
                    WHERE id = ? AND user_id = ?
                `, [comment.content, comment.id, comment.userId, comment.postId]);
                return result.affectedRows !== 0;
            }
            return false;

        } catch (error) {
            throw error;
        }
    }

    // Delete comment
    async delete(comment) {
        try {
            const isExist = await this.isExist(comment.id);
            if (isExist) {
                const [result] = await pool.query(`
                    DELETE FROM comments
                    WHERE id = ? AND user_id = ?
                `, [comment.id, comment.userId]);
                
                return result.affectedRows !== 0;
            }
            return false;

        } catch (error) {
            throw error;
        }
    }

    // Get comments by post id
    async getCommentsByPostId(postId, page = PAGE, size = SIZE) {
        try {
            const offset = (page - 1) * size;

            const [rows] = await pool.query(
                `SELECT * FROM comments
                WHERE post_id = ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?`,
                [postId, size, offset]
            );

            const comments = rows.map(row => new CommentModel(
                row.post_id,
                row.user_id,
                row.content,
                row.created_at,
                row.id
            ));

            return comments;
        } catch (error) {
            throw error;
        }
    }

}


export default CommentDAO;
