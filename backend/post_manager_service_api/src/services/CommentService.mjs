import CommentModel from '../models/CommentModel.mjs';
import CommentDAO from '../DAOs/CommentDAO.mjs';
import dotenv from 'dotenv';
import NotificationServices from './NotificationServices.mjs';
import NotificationModel from '../models/NotificationModel.mjs';
import PostService from './PostService.mjs';
import CommentErrors from '../utils/errors/CommentErrors.mjs';
import WorkerChannelPromise from '../utils/workerChannels/CommentWorkerChannel.mjs';
import UserService from './UserService.mjs';
import { CommentJobType } from '../utils/enums/CommentJobType.mjs';


dotenv.config();
const PAGE = process.env.PAGE;
const SIZE = process.env.SIZE;
const notificationServices = new NotificationServices();
const postService = new PostService();
const userService = new UserService();


class CommentService {
    constructor() {
        this.commentDAO = new CommentDAO();
    }

    // Create comment
    async create(jwt, comment) {
        try {
            // Validat user and post
            const user = await userService.findUserByIds([comment.userId]);
            const post = await postService.getPostById(comment.postId);
            if (!post[0]?.id) {
                throw new Error(CommentErrors.INVALID_POST_ID);
            }
            // Create comment
            await this.commentDAO.create(comment);
            
            // Send notification to notification service
            await notificationServices.create(jwt, new NotificationModel(
                `${ user[0].userName } add new comment on your post`,
                post.title,
                {},
            ));

        } catch (error) {
            throw error;
        }
    }

    // Create comment worker
    async createWorker(data, userId, jwt) {
        try {
            const comment = new CommentModel(data.post_id, userId, data.content);
            const workerChannel = await WorkerChannelPromise;
            workerChannel.add({ jwt, comment, jobType: CommentJobType.CREATE });
            
        } catch (error) {
            throw error;
        }
    }

    // Update comment
    async update(comment) {
        try {
            // Update comment
            await this.commentDAO.update(comment);

        } catch (error) {
            throw error;
        }
    }

    // Update comment worker
    async updateWorker(data, userId, jwt) {
        try {
            const comment = new CommentModel(null, userId, data.content, null, data.id);
            const workerChannel = await WorkerChannelPromise;
            workerChannel.add({ jwt, comment, jobType: CommentJobType.UPDATE });
            
        } catch (error) {
            throw error;
        }
    }

    // Delete comment
    async delete(commentId, userId) {
        try {
            // Delete comment
            await this.commentDAO.delete(new CommentModel(
                null,
                userId,
                null,
                null,
                commentId,
            ));

        } catch (error) {
            throw error;
        }
    }

    // Get comments by post id
    async getCommentsByPostId(postId, page = PAGE, size = SIZE) {
        try {
            // Validat post
            const post = await postService.getPostById(postId);
            if (!post[0]?.id) {
                throw new Error(CommentErrors.INVALID_POST_ID);
            }

            // Get comments
            const comments = await this.commentDAO.getCommentsByPostId(postId, page, size);

            // Step 1: Extract unique user IDs
            const uniqueUserIds = [...new Set(comments.map(comment => comment.userId))];

            // Step 2: Fetch user info
            const users = await userService.findUserByIds(uniqueUserIds);

            // Step 3: Build a map from user ID to userName
            const userMap = {};
            for (const user of users) {
                userMap[user.id] = user.userName;
            }

            // Step 4: Assign userName to each post
            for (const comment of comments) {
                comment.userName = userMap[comment.userId] || null;
            }

            return comments;
            
        } catch (error) {
            throw error;
        }
    }

}


export default CommentService;
