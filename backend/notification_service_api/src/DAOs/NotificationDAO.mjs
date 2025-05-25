import { getDatabasePool } from '../config/SQLCon.mjs';
import NotificationModel from '../models/NotificationModel.mjs';
import dotenv from 'dotenv';
import ErrorLogService from '../services/ErrorLogService.mjs';


dotenv.config();
const pool = await getDatabasePool();
const errorLogService = new ErrorLogService();


class NotificationDAO {
    constructor () {
    }

    // Delete notification
    async delete(notification) {
        try {
            const [result] = await pool.query(`
                DELETE FROM notification_table
                WHERE user_id = ?
                    AND title = ?
                    AND content = ?;
            `, [notification.userId, notification.title, notification.content]);
            return result.affectedRows !== 0

        } catch (error) {
            throw error;
        }
    }

    // Create notification
    async create(notification) {
        try {
            // Delete same notification if exist
            await this.delete(notification);

            const [result] = await pool.query(`
                INSERT INTO notification_table (
                    user_id,
                    title, 
                    content, 
                    info, 
                    is_check
                ) values (?, ?, ?, ?, ?)
            `, [notification.userId, notification.title, notification.content, JSON.stringify(notification.info), false]);
            if (result.affectedRows !== 1) {
                await errorLogService.createLog('NotificationDAO', result, notification);
            }
            return result.affectedRows !== 0

        } catch (error) {
            throw error;
        }
    }

    // Get all notifications for a user
    async getNotifications(userId) {
        try {
            const [rows] = await pool.query(`SELECT * FROM notification_table WHERE user_id = ?;`, [userId]);
            console.log(rows);
            return rows;

        } catch (error) {
            throw error;
        }
    }


}


export default NotificationDAO;
