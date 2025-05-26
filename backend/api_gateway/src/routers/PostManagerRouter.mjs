import { Router } from 'express';
import dotenv from 'dotenv';
import isAuthenticated from '../middlewares/UserAuthMiddleware.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';


dotenv.config();
const router = Router();
const postSerciveApi = `http://${ process.env.POST_SERVICE_API_HOST || '172.20.5.52' }:${ process.env.POST_SERVICE_API_PORT || 4002 }/api/${ process.env.POST_SERVICE_API_VERSION || 'v1' }/auth/post`;


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
router.get('/', async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;
    try {
        // Start with base params
        const params = new URLSearchParams();

        // Always required
        if (req.query.page) params.append('page', req.query.page);
        if (req.query.size) params.append('size', req.query.size);

        const apiUrl = `${postSerciveApi}/?${params.toString()}`;

        response = await fetch(apiUrl, {
            method: 'GET',
        });

        responseStatus = response.status;
        responseBody = await response.json();
        return res.status(responseStatus).send(responseBody);

    } catch (error) {
        return await ErrorResponse(error, res, '/post/', {
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
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
router.get('/find', async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;

    try {
        // Start with base params
        const params = new URLSearchParams();

        // Always required
        if (req.query.page) params.append('page', req.query.page);
        if (req.query.size) params.append('size', req.query.size);

        // Optional parameters
        if (req.query.post_id) params.append('post_id', req.query.post_id);
        if (req.query.country) params.append('country', req.query.country);
        if (req.query.user_name) params.append('user_name', req.query.user_name);

        const apiUrl = `${postSerciveApi}/find?${params.toString()}`;

        response = await fetch(apiUrl, {
            method: 'GET',
        });

        responseStatus = response.status;
        responseBody = await response.json();
        return res.status(responseStatus).send(responseBody);

    } catch (error) {
        return await ErrorResponse(error, res, '/post/', {
            responseStatus,
            responseBody,
        });
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
 *       - cookieAuth: []
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
 *               - _csrf
 *             properties:
 *               _csrf:
 *                 type: string
 *                 example: 5c325207-aa6f-42d9-80f7-284df562bcca
 *                 description: New csrf token
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
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.post('/create', isAuthenticated, async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;

    try {
        response = await fetch(`${ postSerciveApi }/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ req.user.jwt }`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });
        responseStatus = response.status;
        responseBody = await response.json();
        return res.status(responseStatus).send(responseBody);

    } catch (error) {
        return await ErrorResponse(error, res, '/post/create', {
            "requestData": req.body,
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/post/update:
 *   put:
 *     summary: Update a post
 *     description: Updates an existing post. Requires JWT authentication. The update will be processed asynchronously.
 *     tags:
 *       - Post
 *     security:
 *       - cookieAuth: []
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
 *               - _csrf
 *             properties:
 *               _csrf:
 *                 type: string
 *                 example: 5c325207-aa6f-42d9-80f7-284df562bcca
 *                 description: New csrf token
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
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.put('/update', isAuthenticated, async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;

    try {
        response = await fetch(`${ postSerciveApi }/update`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${ req.user.jwt }`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });
        responseStatus = response.status;
        responseBody = await response.json();
        return res.status(responseStatus).send(responseBody);

    } catch (error) {
        return await ErrorResponse(error, res, '/post/update', {
            "requestData": req.body,
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
    }
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
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - _csrf
 *             properties:
 *               _csrf:
 *                 type: string
 *                 example: 5c325207-aa6f-42d9-80f7-284df562bcca
 *                 description: New csrf token
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
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.delete('/delete', isAuthenticated, async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;

    try {
        response = await fetch(`${ postSerciveApi }/delete`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${ req.user.jwt }`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });
        responseStatus = response.status;
        responseBody = await response.json();
        return res.status(responseStatus).send(responseBody);

    } catch (error) {
        return await ErrorResponse(error, res, '/post/delete', {
            "requestData": req.body,
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/post/comment/:
 *   get:
 *     summary: Get comments for a post
 *     description: Returns paginated comments for a specific post.
 *     tags:
 *       - Comment
 *     parameters:
 *       - in: query
 *         name: post_id
 *         required: true
 *         description: The ID of the post to retrieve comments for
 *         schema:
 *           type: integer
 *           example: 12
 *       - in: query
 *         name: page
 *         required: true
 *         description: Page number for pagination (defaults to 1)
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: size
 *         required: true
 *         description: Number of comments per page (defaults to 10)
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved comments
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
 *                   example: "Comments."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 101
 *                       postId:
 *                         type: integer
 *                         example: 12
 *                       userId:
 *                         type: integer
 *                         example: 4
 *                       content:
 *                         type: string
 *                         example: "This post was very helpful, thanks!"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-21T12:34:56.000Z"
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
 *                     post_id: "Post ID is required and must be an integer"
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
router.get('/comment/', async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;
    try {
        // Start with base params
        const params = new URLSearchParams();

        // Always required
        if (req.query.post_id) params.append('post_id', req.query.post_id);
        if (req.query.page) params.append('page', req.query.page);
        if (req.query.size) params.append('size', req.query.size);

        const apiUrl = `${postSerciveApi}/comment/?${params.toString()}`;

        response = await fetch(apiUrl, {
            method: 'GET',
        });

        responseStatus = response.status;
        responseBody = await response.json();
        return res.status(responseStatus).send(responseBody);

    } catch (error) {
        return await ErrorResponse(error, res, '/post/comment/', {
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/post/comment/create:
 *   post:
 *     summary: Create a new comment
 *     description: Creates a comment for a specific post. Requires JWT authentication. The comment will be analyzed before being published.
 *     tags:
 *       - Comment
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - post_id
 *               - content
 *               - _csrf
 *             properties:
 *               _csrf:
 *                 type: string
 *                 example: 5c325207-aa6f-42d9-80f7-284df562bcca
 *                 description: New csrf token
 *               post_id:
 *                 type: integer
 *                 description: ID of the post the comment belongs to
 *                 example: 12
 *               content:
 *                 type: string
 *                 description: The content of the comment
 *                 example: "This post was really informative, thank you!"
 *     responses:
 *       202:
 *         description: Comment accepted for analysis
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
 *                   example: "Successfully Your comment will be published after analysis."
 *                 data:
 *                   type: object
 *                   properties:
 *                     comment_status:
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
 *                     post_id: "Post ID must be an integer"
 *                     content: "Content is required"
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
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.post('/comment/create', isAuthenticated, async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;

    try {
        response = await fetch(`${ postSerciveApi }/comment/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ req.user.jwt }`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });
        responseStatus = response.status;
        responseBody = await response.json();
        return res.status(responseStatus).send(responseBody);

    } catch (error) {
        return await ErrorResponse(error, res, '/post/comment/create', {
            "requestData": req.body,
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/post/comment/update:
 *   put:
 *     summary: Update a comment
 *     description: Updates an existing comment. Requires JWT authentication. The updated comment will be analyzed before being published.
 *     tags:
 *       - Comment
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - id
 *               - _csrf
 *             properties:
 *               _csrf:
 *                 type: string
 *                 example: 5c325207-aa6f-42d9-80f7-284df562bcca
 *                 description: New csrf token
 *               content:
 *                 type: string
 *                 description: The updated content of the comment
 *                 example: "Updated content of the comment for review."
 *               id:
 *                 type: integer
 *                 description: ID of the comment to update
 *                 example: 5
 *     responses:
 *       202:
 *         description: Comment update accepted for analysis
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
 *                   example: "Successfully Your comment will be update after analysis."
 *                 data:
 *                   type: object
 *                   properties:
 *                     comment_status:
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
 *                     post_id: "Post ID must be an integer"
 *                     content: "Content is required"
 *                     comment_id: "Comment ID must be provided"
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
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.put('/comment/update', isAuthenticated, async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;

    try {
        response = await fetch(`${ postSerciveApi }/comment/update`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${ req.user.jwt }`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });
        responseStatus = response.status;
        responseBody = await response.json();
        return res.status(responseStatus).send(responseBody);

    } catch (error) {
        return await ErrorResponse(error, res, '/post/comment/update', {
            "requestData": req.body,
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/post/comment/delete:
 *   delete:
 *     summary: Delete a comment
 *     description: Deletes a comment by ID. Requires JWT authentication.
 *     tags:
 *       - Comment
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - _csrf
 *             properties:
 *               _csrf:
 *                 type: string
 *                 example: 5c325207-aa6f-42d9-80f7-284df562bcca
 *                 description: New csrf token
 *               id:
 *                 type: integer
 *                 description: ID of the comment to delete
 *                 example: 5
 *     responses:
 *       200:
 *         description: Successfully deleted the comment
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
 *                   example: "Successfully delete your comment."
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
 *                     comment_id: "Comment ID is required"
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
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.delete('/comment/delete', isAuthenticated, async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;

    try {
        response = await fetch(`${ postSerciveApi }/comment/delete`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${ req.user.jwt }`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });
        responseStatus = response.status;
        responseBody = await response.json();
        return res.status(responseStatus).send(responseBody);

    } catch (error) {
        return await ErrorResponse(error, res, '/post/comment/delete', {
            "requestData": req.body,
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
    }
});


export default router;