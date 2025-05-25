import { Router } from 'express';
import dotenv from 'dotenv';
import { validationResult, matchedData, checkSchema } from 'express-validator';
import CommentsValidationSchema from '../utils/validations/CommentsValidationSchema.mjs';
import isAuthenticated from '../middlewares/UserAuthMiddleware.mjs';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import CommentService from '../services/CommentService.mjs';


dotenv.config();
const router = Router();
const commentService = new CommentService();

/**
 * @swagger
 * /api/v1/auth/comment/:
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
 *         required: false
 *         description: Page number for pagination (defaults to 1)
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: size
 *         required: false
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
router.get('/', [
    checkSchema({
        ...CommentsValidationSchema.pageQuery(),
        ...CommentsValidationSchema.sizeQuery(),
        ...CommentsValidationSchema.postIdQuery(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, '/comment/', errors);
    }
    const data = matchedData(req);
    const { page, size, post_id: postId } = data;

    try {
        const comments = await commentService.getCommentsByPostId(postId, page, size);
        return res.status(200).send(StandardResponse(
            true,
            "Comments.",
            comments,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/comment/', data);
    }
});

/**
 * @swagger
 * /api/v1/auth/comment/create:
 *   post:
 *     summary: Create a new comment
 *     description: Creates a comment for a specific post. Requires JWT authentication. The comment will be analyzed before being published.
 *     tags:
 *       - Comment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - post_id
 *               - content
 *             properties:
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
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.post('/create', isAuthenticated, [
    checkSchema({
        ...CommentsValidationSchema.postIdValidation(),
        ...CommentsValidationSchema.contentValidation(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, '/comment/create', errors);
    }
    const data = matchedData(req);

    try {
        await commentService.createWorker(data, req.user.id, req.headers['authorization'].split(' ')[1]);
        
    } catch (error) {
        return await ErrorResponse(error, res, '/comment/create', data);
    }

    return res.status(202).send(StandardResponse(
        true,
        "Successfully Your comment will be published after analysis.",
        {
            comment_status: "pending",
        },
        null
    ));
});

/**
 * @swagger
 * /api/v1/auth/comment/update:
 *   put:
 *     summary: Update a comment
 *     description: Updates an existing comment. Requires JWT authentication. The updated comment will be analyzed before being published.
 *     tags:
 *       - Comment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - id
 *             properties:
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
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.put('/update', isAuthenticated, [
    checkSchema({
        ...CommentsValidationSchema.contentValidation(),
        ...CommentsValidationSchema.commentIdValidation(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, '/comment/update', errors);
    }
    const data = matchedData(req);

    try {
        await commentService.updateWorker(data, req.user.id, req.headers['authorization'].split(' ')[1]);
        
    } catch (error) {
        return await ErrorResponse(error, res, '/comment/update', data);
    }

    return res.status(202).send(StandardResponse(
        true,
        "Successfully Your comment will be update after analysis.",
        {
            comment_status: "pending",
        },
        null
    ));
});

/**
 * @swagger
 * /api/v1/auth/comment/delete:
 *   delete:
 *     summary: Delete a comment
 *     description: Deletes a comment by ID. Requires JWT authentication.
 *     tags:
 *       - Comment
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
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.delete('/delete', isAuthenticated, [
    checkSchema({
        ...CommentsValidationSchema.commentIdValidation(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, '/comment/delete', errors);
    }
    const data = matchedData(req);

    try {
        await commentService.delete(data.id, req.user.id);
        
    } catch (error) {
        return await ErrorResponse(error, res, '/comment/delete', data);
    }

    return res.status(200).send(StandardResponse(
        true,
        "Successfully delete your comment.",
        null,
        null
    ));
});


export default router;
