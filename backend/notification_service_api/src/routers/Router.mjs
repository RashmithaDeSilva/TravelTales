import { Router } from 'express';
import dotenv from 'dotenv';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import NotificationRouter from './NotificationRouter.mjs';


dotenv.config();
const API_VERSION = process.env.API_VERSION || 'v1';
const router = Router();
router.use('/auth/ntification', NotificationRouter);


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


export default router;