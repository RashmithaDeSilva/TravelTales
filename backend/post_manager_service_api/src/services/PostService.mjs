import PostModel from '../models/PostModel.mjs';
import PostDAO from '../DAOs/PostDAO.mjs';
import dotenv from 'dotenv';
import WorkerChannelPromise from '../utils/workerChannels/PostWorkerChannel.mjs';
import RestCountryService from './RestCountryService.mjs';
import { CountryTrype } from '../utils/enums/CountryType.mjs';
import { v4 as uuidv4 } from 'uuid';
import NotificationServices from './NotificationServices.mjs';
import NotificationModel from '../models/NotificationModel.mjs';
import UserService from './UserService.mjs';
import UserErrors from '../utils/errors/UserErrors.mjs';
import { PostJobType } from '../utils/enums/PostJobType.mjs';


dotenv.config();
const PAGE = process.env.PAGE;
const SIZE = process.env.SIZE;
const restCountryService = new RestCountryService();
const notificationServices = new NotificationServices();
const userService = new UserService();


class PostService {
    constructor() {
        this.postDAO = new PostDAO();
    }

    // Create post
    async create(jwt, post) {
        try {
            await this.postDAO.create(post);

            // Send notification to notification service
            await notificationServices.create(jwt, new NotificationModel(
                "Successfully publish your post",
                post.title,
                {},
            ));

        } catch (error) {
            throw error;
        }
    }

    // Create post worker
    async createWorker(data, userId, jwt) {
        try {
            // Genarat image id
            let imageId;
            for(let i=0; i<5; i++) {
                imageId = uuidv4();
                let isExist = await this.postDAO.imageIdIsExist(imageId);
                if (!isExist) {
                    break;
                }
            }

            const post = new PostModel(userId, data.title, data.content, data.country, data.date_of_visit, imageId);

            // Verify country
            if (data.country !== CountryTrype.FIND) {
                await restCountryService.verify(jwt, data.country);
            }

            const workerChannel = await WorkerChannelPromise;
            workerChannel.add({ jwt, post, jobType: PostJobType.CREATE });
            
        } catch (error) {
            throw error;
        }
    }

    // Get posts filter
    async getPostsFilter(page = PAGE, size = SIZE, country = null, userName = null) {
        try {
            if (!country && !userName) {
                return [];
            }

            let user;
            if (userName) {
                user = await userService.findUserByName(userName?.toLowerCase());
                if(!user) {
                    throw new Error(UserErrors.INVALID_USER_NAME);
                }
            }
            
            const posts = await this.postDAO.getPostsFilter(page, size, country?.toLowerCase(), user?.id);
            return posts;

        } catch (error) {
            throw error;
        }
    }

    // Get posts by id
    async getPostById(postId) {
        try {
            const post = await this.postDAO.getPostById(postId);

            // Get user name and set
            const user = await userService.findUserByIds([post.userId]);
            post.userName = user[0].userName;
            
            return [post];

        } catch (error) {
            throw error;
        }
    }

    // Get posts
    async getPosts(page = 1, pageSize = 25) {
        try {
            const posts = await this.postDAO.getPosts(page, pageSize);

            // Step 1: Extract unique user IDs
            const uniqueUserIds = [...new Set(posts.map(post => post.userId))];

            // Step 2: Fetch user info
            const users = await userService.findUserByIds(uniqueUserIds);

            // Step 3: Build a map from user ID to userName
            const userMap = {};
            for (const user of users) {
                userMap[user.id] = user.userName;
            }

            // Step 4: Assign userName to each post
            for (const post of posts) {
                post.userName = userMap[post.userId] || null;
            }

            return posts;

        } catch (error) {
            throw error;
        }
    }

    // Update post
    async update(post) {
        try {
            // Update comment
            await this.postDAO.update(post);

        } catch (error) {
            throw error;
        }
    }

    // Update post worker
    async updateWorker(data, userId, jwt) {
        try {
            // Verify country
            if (data.country !== CountryTrype.FIND) {
                await restCountryService.verify(jwt, data.country);
            }

            const post = new PostModel(userId, data.title, data.content, 
                data.country, data.date_of_visit, null, null, data.id,);
            const workerChannel = await WorkerChannelPromise;
            workerChannel.add({ jwt, post, jobType: PostJobType.UPDATE });
            
        } catch (error) {
            throw error;
        }
    }

    // Delete post
    async delete(postId, userId) {
        try {
            // Delete comment
            await this.postDAO.delete(new PostModel(
                userId,
                null,
                null,
                null,
                null,
                null,
                null,
                postId,
            ));

        } catch (error) {
            throw error;
        }
    }

}


export default PostService;
