import PostModel from '../models/PostModel.mjs';
import PostDAO from '../DAOs/PostDAO.mjs';
import dotenv from 'dotenv';
import WorkerChannelPromise from '../utils/WorkerChannel.mjs';
import RestCountryService from './RestCountryService.mjs';
import { CountryTrype } from '../utils/enums/CountryTrype.mjs';
import { v4 as uuidv4 } from 'uuid';
import NotificationServices from './NotificationServices.mjs';
import NotificationModel from '../models/NotificationModel.mjs';


dotenv.config();
const restCountryService = new RestCountryService();
const notificationServices = new NotificationServices();


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
            workerChannel.add({ jwt, post });
            
        } catch (error) {
            throw error;
        }
    }
}


export default PostService;
