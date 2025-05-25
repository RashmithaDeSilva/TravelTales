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
const router = Router();
const postService = new PostService();


/**
 * @swagger
 * /api/v1/auth/post/:
 *   get:
 *     summary: Get paginated posts
 *     description: Returns a list of posts with optional pagination.
 *     tags:
 *       - Post
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         description: The page number for pagination
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: size
 *         required: true
 *         description: The number of posts per page
 *         schema:
 *           type: integer
 *           example: 25
 *     responses:
 *       200:
 *         description: Successfully retrieved posts
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
 *                   example: "Posts."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: integer
 *                         example: 4
 *                       userName:
 *                         type: string
 *                         example: "john_doe"
 *                       title:
 *                         type: string
 *                         example: "Visiting the Grand Canyon"
 *                       content:
 *                         type: string
 *                         example: "It was an amazing experience with breathtaking views!"
 *                       country:
 *                         type: string
 *                         example: "United States"
 *                       dateOfVisit:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-14T18:30:00.000Z"
 *                       imageId:
 *                         type: string
 *                         example: "771aca90-09bd-4d30-b669-4d0ceac08b78"
 *                       publishDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-21T18:33:27.000Z"
 *                       id:
 *                         type: integer
 *                         example: 12
 *                       comments:
 *                         type: array
 *                         items:
 *                           type: object
 *                           example: {}
 *                       commentsCount:
 *                         type: integer
 *                         example: 0
 *                       likes:
 *                         type: integer
 *                         example: 0
 *                       disLikes:
 *                         type: integer
 *                         example: 0
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
 *                     page: "Page must be a positive integer"
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
 */
router.get('/', [
    checkSchema({
        ...PostValidationSchema.pageQueryValidation(),
        ...PostValidationSchema.sizeQueryValidation(),
    })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, '/post/', errors);
        }
        const data = matchedData(req);
        const { page, size } = data;

        const posts = await postService.getPosts(page, size);
        return res.status(200).send(StandardResponse(
            true,
            "Posts.",
            posts,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/post/', data);
    }
});

/**
 * @swagger
 * /api/v1/auth/post/find:
 *   get:
 *     summary: Retrieve posts with optional filters
 *     description: Retrieve paginated posts, optionally filtered by country or username.
 *     tags:
 *       - Post
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         description: The page number for pagination
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: size
 *         required: true
 *         description: The number of posts per page
 *         schema:
 *           type: integer
 *           example: 25
 *       - in: query
 *         name: post_id
 *         required: false
 *         description: Filter posts by the post id
 *         schema:
 *           type: integer
 *           example: 2
 *       - in: query
 *         name: country
 *         required: false
 *         description: Filter posts by country
 *         schema:
 *           type: string
 *           example: "Japan"
 *       - in: query
 *         name: user_name
 *         required: false
 *         description: Filter posts by the username of the author
 *         schema:
 *           type: string
 *           example: "john_doe"
 *     responses:
 *       200:
 *         description: Successfully retrieved posts
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
 *                   example: "Posts."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "post-uuid"
 *                       title:
 *                         type: string
 *                         example: "My trip to Tokyo"
 *                       content:
 *                         type: string
 *                         example: "It was amazing!"
 *                       country:
 *                         type: string
 *                         example: "Japan"
 *                       dateOfVisit:
 *                         type: string
 *                         format: date
 *                         example: "2025-04-10"
 *                       publishDate:
 *                         type: string
 *                         format: date
 *                         example: "2025-04-12"
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
 *                     page: "Page is required and must be a number"
 *       401:
 *         description: Unauthorized
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
 */
router.get('/find', [
    checkSchema({
        ...PostValidationSchema.pageQueryValidation(),
        ...PostValidationSchema.sizeQueryValidation(),
        ...PostValidationSchema.countryQueryValidation(),
        ...PostValidationSchema.userNameQueryValidation(),
        ...PostValidationSchema.idQueryValidation(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, '/post/find', errors);
    }
    const data = matchedData(req);
    const { page, size, country, user_name: userName, post_id: postId } = data;

    try {
        const posts = (!postId) 
        ? await postService.getPostsFilter(page, size, country, userName) :
        await postService.getPostById(postId);
        return res.status(200).send(StandardResponse(
            true,
            "Posts.",
            posts,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/post/find', data);
    }
});

/**
 * @swagger
 * /api/v1/auth/post/create:
 *   post:
 *     summary: Create a post and trigger background analysis
 *     description: Accepts a new post and schedules it for background analysis (e.g., toxicity check). The post will be published if it passes the analysis.
 *     tags:
 *       - Post
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
        ...PostValidationSchema.titleValidation(),
        ...PostValidationSchema.contentValidation(),
        ...PostValidationSchema.countryValidation(),
        ...PostValidationSchema.date_of_visitValidation(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, '/post/create', errors);
    }
    const data = matchedData(req);

    try {
        await postService.createWorker(data, req.user.id, req.headers['authorization'].split(' ')[1]);
        
    } catch (error) {
        return await ErrorResponse(error, res, '/post/create', data);
    }

    return res.status(202).send(StandardResponse(
        true,
        "Successfully Your post will be published after analysis.",
        {
            post_status: "pending",
        },
        null
    ));
});

/**
 * @swagger
 * /api/v1/auth/post/update:
 *   post:
 *     summary: Update a post
 *     description: Updates an existing post. Requires JWT authentication. The update will be processed asynchronously.
 *     tags:
 *       - Post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - title
 *               - content
 *               - country
 *               - date_of_visit
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID of the post to update
 *                 example: 12
 *               title:
 *                 type: string
 *                 description: Title of the post
 *                 example: "Trip to Tokyo"
 *               content:
 *                 type: string
 *                 description: Main content of the post
 *                 example: "It was an amazing trip to Tokyo!"
 *               country:
 *                 type: string
 *                 description: Country visited
 *                 example: "Japan"
 *               date_of_visit:
 *                 type: string
 *                 format: date
 *                 description: Date of the visit
 *                 example: "2025-04-14"
 *     responses:
 *       202:
 *         description: Post update accepted and pending analysis
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
 *                   example: "Successfully Your post will be update after analysis."
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
 *                     title: "Title is required"
 *       401:
 *         description: Unauthorized (missing or invalid JWT token)
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
 */
router.post('/update', isAuthenticated, [
    checkSchema({
        ...PostValidationSchema.idValidation(),
        ...PostValidationSchema.titleValidation(),
        ...PostValidationSchema.contentValidation(),
        ...PostValidationSchema.countryValidation(),
        ...PostValidationSchema.date_of_visitValidation(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, '/post/update', errors);
    }
    const data = matchedData(req);

    try {
        await postService.updateWorker(data, req.user.id, req.headers['authorization'].split(' ')[1]);
        
    } catch (error) {
        return await ErrorResponse(error, res, '/post/create', data);
    }

    return res.status(202).send(StandardResponse(
        true,
        "Successfully Your post will be update after analysis.",
        {
            post_status: "pending",
        },
        null
    ));
});

/**
 * @swagger
 * /api/v1/auth/post/delete:
 *   delete:
 *     summary: Delete a post
 *     description: Deletes a post by ID. Requires JWT authentication.
 *     tags:
 *       - Post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID of the post to delete
 *                 example: 12
 *     responses:
 *       200:
 *         description: Successfully deleted the post
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
 *                   example: "Successfully delete your post."
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: Validation error (e.g., missing or invalid ID)
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
 *                     id: "Post ID is required"
 *       401:
 *         description: Unauthorized (JWT token missing or invalid)
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
 */
router.delete('/delete', isAuthenticated, [
    checkSchema({
        ...PostValidationSchema.idValidation(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, '/post/delete', errors);
    }
    const data = matchedData(req);

    try {
        await postService.delete(data.id, req.user.id);
        
    } catch (error) {
        return await ErrorResponse(error, res, '/post/delete', data);
    }

    return res.status(200).send(StandardResponse(
        true,
        "Successfully delete your post.",
        null,
        null
    ));
});


export default router;
