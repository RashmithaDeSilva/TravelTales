import { Router } from 'express';
import dotenv from 'dotenv';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import UserAuthRouter from './UserAuthRouter.mjs';
import UserRouter from './UserRouter.mjs';
import CountryFinderRouter from './CountryFinderRouter.mjs';
import ToxicityDetectionRouter from './ToxicityDetectionRouter.mjs';
import PostManagerRouter from './PostManagerRouter.mjs';
import NotificationRouter from './NotificationRouter.mjs';


dotenv.config();
const API_VERSION = process.env.API_VERSION || 'v1';
const router = Router();
router.use('/auth/', UserAuthRouter);
router.use('/auth/findecountry', CountryFinderRouter);
router.use('/auth/toxicitydetection', ToxicityDetectionRouter);
router.use('/auth/user', UserRouter);
router.use('/auth/post', PostManagerRouter);
router.use('/auth/notification', NotificationRouter);


/**
 * @swagger
 * /api/v1/status:
 *   get:
 *     summary: Get API description
 *     description: Returns a simple description of the API.
 *     tags:
 *       - "Util"
 *     responses:
 *       200:
 *         description: A brief API description.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Welcome to the API."
 */
router.get('/status', (req, res) => {
    let msg = `Welcome to the user API.`;

    if (process.env.ENV === "DEV") {
        msg = `Welcome to the API, Use '/api/${ API_VERSION }/api-docs' for Swagger documentation (Only working on Developer mode).`;
    }
    res.status(200).send(StandardResponse(true, msg, null, null));
});

/**
 * @swagger
 * /api/v1/auth/csrf-token:
 *   get:
 *     summary: Get CSRF token
 *     description: Returns a CSRF token to be used for authenticated requests.
 *     tags:
 *       - "Util"
 *     responses:
 *       200:
 *         description: Successfully retrieved CSRF token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 data:
 *                   type: object
 *                   properties:
 *                     CSRF_Token:
 *                       type: string
 *                       example: "y7wRzD9n-CqD1VnKRIJvXW1r"
 *                 error:
 *                   nullable: true
 *                   example: null
 */
router.get('/auth/csrf-token', (req, res) => {
    const csrfToken = req.csrfToken();
    return res.status(200).send(StandardResponse(
        true,
        null,
        {
            CSRF_Token: csrfToken,
        },
        null
    ));
});


export default router;