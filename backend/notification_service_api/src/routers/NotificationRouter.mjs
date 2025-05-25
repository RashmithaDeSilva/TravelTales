import { Router } from 'express';
import dotenv from 'dotenv';
import { validationResult, matchedData, checkSchema } from 'express-validator';
import NotificationValidationSchema from '../utils/validations/NotificationValidationSchema.mjs';
import isAuthenticated from '../middlewares/ApiKeyAuthMiddleware.mjs';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import NotificationService from '../services/NotificationService.mjs';


dotenv.config();
const API_VERSION = process.env.API_VERSION || 'v1';
const router = Router();
const notificationService = new NotificationService();


/**
 * @swagger
 * /api/v1/auth/notification/create:
 *   post:
 *     summary: Create a notification
 *     description: Creates a new notification. Requires JWT and API key authentication.
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - info
 *             properties:
 *               title:
 *                 type: string
 *                 example: "New Feature Released"
 *               content:
 *                 type: string
 *                 example: "We've released a new feature. Check it out!"
 *               info:
 *                 type: string
 *                 example: "feature-release"
 *     responses:
 *       200:
 *         description: Notification created successfully
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
 *                   example: "Notification create successfully."
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: Validation error (missing or invalid fields)
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
 *                   example: "Validation error"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: object
 *                   example:
 *                     title: "Title is required"
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
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     apiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: x-api-key
 */
router.post('/create', isAuthenticated, [
    checkSchema({
        ...NotificationValidationSchema.titleValidation(),
        ...NotificationValidationSchema.contentValidation(),
        ...NotificationValidationSchema.infoValidation(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, '/notification/create', errors);
    }

    const data = matchedData(req);

    try {
        await notificationService.create(data, req.user.id);
    } catch (error) {
        return await ErrorResponse(error, res, '/notification/create', data);
    }

    return res.status(200).send(StandardResponse(
        true,
        "Notification create successfully.",
        null,
        null
    ));
});

/**
 * @swagger
 * /api/v1/auth/notification/send:
 *   post:
 *     summary: Send a notification to a user
 *     description: Sends a notification to a specific user. Requires JWT and API key authentication.
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *         apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - info
 *               - user_id
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Welcome"
 *               content:
 *                 type: string
 *                 example: "Welcome to the platform!"
 *               info:
 *                 type: string
 *                 example: "Additional data"
 *               user_id:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Notification sent successfully
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
 *                   example: "Notification create successfully."
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: Validation error
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
 *                   example: "Validation error"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: object
 *                   example:
 *                     user_id: "User ID must be provided"
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
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     apiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: x-api-key
 */
router.post('/send', isAuthenticated, [
    checkSchema({
        ...NotificationValidationSchema.titleValidation(),
        ...NotificationValidationSchema.contentValidation(),
        ...NotificationValidationSchema.infoValidation(),
        ...NotificationValidationSchema.userIdValidation(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, '/notification/send', errors);
    }

    const data = matchedData(req);

    try {
        await notificationService.send(data);
    } catch (error) {
        return await ErrorResponse(error, res, '/notification/send', data);
    }

    return res.status(200).send(StandardResponse(
        true,
        "Notification create successfully.",
        null,
        null
    ));
});

/**
 * @swagger
 * /api/v1/auth/notification/:
 *   get:
 *     summary: Get notifications for the authenticated user
 *     description: Returns a list of notifications for the logged-in user. Requires JWT and API key.
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *         apiKeyAuth: []
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
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     apiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: x-api-key
 */
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const notifications = await notificationService.getNotificationByUserId(req.user.id);
        return res.status(200).send(StandardResponse(
            true,
            "Notifications.",
            notifications,
            null
        ));
    } catch (error) {
        return await ErrorResponse(error, res, '/notification/');
    }
});


export default router;
