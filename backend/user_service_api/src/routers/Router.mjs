import { Router } from 'express';
import dotenv from 'dotenv';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import UserRouter from './UserRouter.mjs';


dotenv.config();
const API_VERSION = process.env.API_VERSION || 'v1';
const router = Router();
router.use('/auth/user', UserRouter);


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
 * /api/v1/{any}:
 *   all:
 *     summary: Invalid endpoint
 *     description: Handles all undefined routes and returns a 404 error.
 *     parameters:
 *       - in: path
 *         name: any
 *         required: true
 *         schema:
 *           type: string
 *         description: Any undefined route
 *     responses:
 *       404:
 *         description: Not Found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Not Found !"
 *                 redirect:
 *                   type: string
 *                   example: "Invalid endpoint, redirect to '/api/v1'"
 */
// router.all("*", (req, res) => {
//     return ErrorResponse(new Error(CommonErrors.NOT_FOUND), res);
// });


export default router;