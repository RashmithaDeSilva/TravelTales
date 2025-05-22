import { getDatabasePool } from '../config/SQLCon.mjs';
import UserModel from '../models/PostModel.mjs';
import PostErrors from '../utils/errors/PostErrors.mjs';
import dotenv from 'dotenv';


dotenv.config();
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

}


export default PostDAO;
