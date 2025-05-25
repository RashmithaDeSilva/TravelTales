import { Router } from 'express';
import dotenv from 'dotenv';
import isAuthenticated from '../middlewares/UserAuthMiddleware.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';


dotenv.config();
const router = Router();
const notificationSerciveApi = `http://${ process.env.NOTIFICATION_SERVICE_API_HOST || '172.20.5.54' }:${ process.env.NOTIFICATION_SERVICE_API_PORT || 4004 }/api/${ process.env.NOTIFICATION_SERVICE_API_VERSION || 'v1' }/auth/notification`;
const NOTIFICATION_API_KEY = process.env.NOTIFICATION_API_KEY;

/**
 * @swagger
 * /api/v1/auth/notification/:
 *   get:
 *     summary: Get notifications for the authenticated user
 *     description: Returns a list of notifications for the logged-in user. Requires JWT and API key.
 *     tags:
 *       - Notification
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notifications."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 12
 *                       title:
 *                         type: string
 *                         example: "System Update"
 *                       content:
 *                         type: string
 *                         example: "We have updated the system. Please check."
 *                       info:
 *                         type: string
 *                         example: "internal"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-22T14:25:00Z"
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       401:
 *         description: Unauthorized (missing or invalid token/api key)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: "null"
 *                   example: null
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.get('/', isAuthenticated, async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;
    try {
        response = await fetch(notificationSerciveApi, {
            method: 'GET',
            headers: {
                'Authorization': `${ NOTIFICATION_API_KEY } ${req.user.jwt}`,
            },
        });

        responseStatus = response.status;
        responseBody = await response.json();
        return res.status(responseStatus).send(responseBody);

    } catch (error) {
        return await ErrorResponse(error, res, '/notification/', {
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
    }
});


export default router;
