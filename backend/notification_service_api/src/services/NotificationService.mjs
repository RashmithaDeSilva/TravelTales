import NotificationDAO from '../DAOs/NotificationDAO.mjs';
import NotificationModel from '../models/NotificationModel.mjs';
import dotenv from 'dotenv';


dotenv.config();


class NotificationService {
    constructor() {
        this.notificationDAO = new NotificationDAO();
    }

    // Create notification
    async create(data, userId) {
        try {
            // Create notification model
            const notification = new NotificationModel(
                userId,
                data.title,
                data.content,
                data.info,
            );

            // Create user in database
            await this.notificationDAO.create(notification);

        } catch (error) {
            throw error;
        }
    }

    // Create notification
    async send(data) {
        try {
            // Create notification model
            const notification = new NotificationModel(
                data.user_id,
                data.title,
                data.content,
                data.info,
            );

            // Create user in database
            await this.notificationDAO.create(notification);

        } catch (error) {
            throw error;
        }
    }

    // Get user by user id
    async getNotificationByUserId(id) {
        try {
            const notifications = await this.notificationDAO.getNotifications(id);
            return notifications;
            
        } catch (error) {
            throw error;
        }
    }
}

export default NotificationService;