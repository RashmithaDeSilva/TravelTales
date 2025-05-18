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
 *     summary: Create a post and trigger background toxicity detection worker
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
 *               image_id:
 *                 type: string
 *                 description: Optional ID of uploaded image
 *                 example: "img_8349dgs83"
 *     responses:
 *       200:
 *         description: Post creation task has been accepted for processing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post is being processed"
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

    postService.createWorker(data, req.user.id, req.headers['authorization']);


    try {
        
    } catch (error) {
        
    }

    // user_id 
    // title 
    // content 
    // country 
    // date_of_visit 
    // image_id 
    
    return res.sendStatus(200);
});


export default router;
