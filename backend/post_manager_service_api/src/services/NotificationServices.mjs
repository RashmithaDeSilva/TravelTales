import fetch from 'node-fetch';
import dotenv from 'dotenv';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
import ErrorLogService from './ErrorLogService.mjs';


dotenv.config();
const errorLogService = new ErrorLogService();
const notificationServiceApi = `http://${ process.env.NITIFICATION_SERVICE_API_HOST }:${ process.env.NITIFICATION_SERVICE_API_PORT }/api/v1/auth/ntification`;
const notificationApiKey = process.env.NOTIFICATION_API_KEY;


class NotificationServices {
    constructor() {
    }

    async create(jwt, notification) {
        let responseStatus;
        let responseBody;
        try {
            const response = await fetch(`${ notificationServiceApi }/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `${ notificationApiKey } ${ jwt }`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: notification.title,
                    content: notification.content,
                    info: notification.info,
                }),
            });
            responseStatus = response.status;
            responseBody = await response.json();
            if (responseStatus !== 200) {
                throw new Error(CommonErrors.INTERNAL_SERVER_ERROR);
            }

        } catch (error) {
            errorLogService.createLog('NotificationServices.create', error, {
                "jwt": jwt,
                "notification": notification,
                "responseStatus": responseStatus,
                "responseBody": responseBody,
            });
        }
    }

    async send(jwt, notification) {
        let responseStatus;
        let responseBody;
        try {
            const response = await fetch(`${ notificationServiceApi }/send`, {
                method: 'POST',
                headers: {
                    'Authorization': `${ notificationApiKey } ${ jwt }`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: notification.title,
                    content: notification.content,
                    info: notification.info,
                    user_id: notification.userId,
                }),
            });
            responseStatus = response.status;
            responseBody = await response.json();
            if (responseStatus !== 200) {
                throw new Error(CommonErrors.INTERNAL_SERVER_ERROR);
            }

        } catch (error) {
            errorLogService.createLog('NotificationServices.create', error, {
                "jwt": jwt,
                "notification": notification,
                "responseStatus": responseStatus,
                "responseBody": responseBody,
            });
        }
    }

}

export default NotificationServices;