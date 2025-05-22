import { Router } from 'express';
import dotenv from 'dotenv';
import { validationResult, matchedData, checkSchema } from 'express-validator';
import PostValidationSchema from '../utils/validations/PostValidationSchema.mjs';
import isAuthenticated from '../middlewares/UserAuthMiddleware.mjs';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import PostService from '../services/PostService.mjs';


dotenv.config();
const API_VERSION = process.env.API_VERSION || 'v1';
const router = Router();
const postService = new PostService();


/**
 * @swagger
 * /api/v1/auth/post/create:
 *   post:
 *     summary: Create a post and trigger background analysis
 *     description: Accepts a new post and schedules it for background analysis (e.g., toxicity check). The post will be published if it passes the analysis.
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - country
 *               - date_of_visit
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Visiting the Grand Canyon"
 *               content:
 *                 type: string
 *                 example: "It was an amazing experience with breathtaking views!"
 *               country:
 *                 type: string
 *                 example: "United States"
 *               date_of_visit:
 *                 type: string
 *                 format: date
 *                 example: "2025-04-15"
 *     responses:
 *       202:
 *         description: Post accepted for analysis
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
 *                   example: "Your post will be successfully published after analysis."
 *                 data:
 *                   type: object
 *                   properties:
 *                     post_status:
 *                       type: string
 *                       example: "pending"
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: Validation error in post data
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
 *         description: Authentication required
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
 *                   example: "API key required"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: object
 *                   example:
 *                     redirect: "/api/v1/auth"
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
 */
router.post('/create', isAuthenticated, [
    checkSchema({
        ...PostValidationSchema.title(),
        ...PostValidationSchema.content(),
        ...PostValidationSchema.country(),
        ...PostValidationSchema.date_of_visit(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, '/post/create/', errors);
    }
    const data = matchedData(req);

    try {
        await postService.createWorker(data, req.user.id, req.headers['authorization'].split(' ')[1]);
        
    } catch (error) {
        return await ErrorResponse(error, res, '/post/create', data);
    }

    return res.status(202).send(StandardResponse(
        true,
        "SuccessfullyYour post will be successfully published after analysis.",
        {
            post_status: "pending",
        },
        null
    ));
});


export default router;
