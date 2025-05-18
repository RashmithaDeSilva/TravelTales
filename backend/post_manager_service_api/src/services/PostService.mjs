import PostModel from '../models/PostModel.mjs';
import { log } from '../utils/ConsoleLog.mjs';
import { LogTypes } from '../utils/enums/LogTypes.mjs';
import PostDAO from '../DAOs/PostDAO.mjs';
import dotenv from 'dotenv';
import WorkerChannelPromise from '../utils/WorkerChannel.mjs';


dotenv.config();


class PostService {
    constructor() {
        this.postDAO = new PostDAO();
    }

    // Create post
    // async create(post) {
    //     try {
    //         this.postDAO.create(post);

    //         // Send notification to notification service

    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // Create post worker
    async createWorker(data, userId, jwt) {
        const post = new PostModel(userId, data.title, data.content, data.country, data.date_of_visit);
        const workerChannel = await WorkerChannelPromise;
        await new Promise((resolve, reject) => {
            workerChannel.add({ jwt, post }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });
    }
}


export default PostService;
