import { Router } from 'express';
import dotenv from 'dotenv';
import isAuthenticated from '../middlewares/UserAuthMiddleware.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import StandardResponse from '../utils/responses/StandardResponse.mjs';


dotenv.config();
const router = Router();
const userServiceApi = `http://${ process.env.USER_SERVICE_API_HOST }:${ process.env.USER_SERVICE_API_PORT }/api/${ process.env.USER_SERVICE_API_VERSION }/auth/user`;


/**
 * @swagger
 * /api/v1/auth/user/info:
 *   get:
 *     summary: "Get user status"
 *     description: "This endpoint retrieves the status of the currently authenticated user."
 *     tags:
 *       - "User"
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved user status"
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
 *                   example: "User status."
 *                 data:
 *                   type: object
 *                   properties:
 *                     userName:
 *                       type: string
 *                       example: "john_doe"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     surname:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     contactNumber:
 *                       type: string
 *                       example: "+94761234567"
 *                     passwordHash:
 *                       type: integer
 *                       example: 0
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     verify:
 *                       type: boolean
 *                       example: false
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       401:
 *         description: "Unauthorized. User must be authenticated."
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
 *                   example: "Authentication failed"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 error:
 *                   type: object
 *                   example: {"redirect":"/api/v1/auth"}
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.get('/info', isAuthenticated, async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;
    try {
        response = await fetch(`${ userServiceApi }/info`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${ req.user.jwt }`,
                'Cookie': req.headers.cookie || '',
            },
        });
        responseStatus = response.status;
        responseBody = await response.json();
        return res.status(responseStatus).send(responseBody);

    } catch (error) {
        return await ErrorResponse(error, res, '/user/info', {
            "response": response,
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/user/update:
 *   put:
 *     summary: "Update user information"
 *     description: "This endpoint allows the authenticated user to update their personal information, such as first name, surname, email, and contact number."
 *     tags:
 *       - "User"
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: "User data to be updated."
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *                 example: "john_doe"
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               surname:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               contact_number:
 *                 type: string
 *                 example: "+94761234567"
 *               _csrf:
 *                 type: string
 *                 example: 5c325207-aa6f-42d9-80f7-284df562bcca
 *                 description: New csrf token
 *     responses:
 *       200:
 *         description: "Successfully updated user information"
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
 *                   example: "User updated successfully."
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       401:
 *         description: "Unauthorized - User not authenticated."
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
 *                   example: "Authentication failed"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: object
 *                   example: {"redirect":"/api/v1/auth"}
 *       400:
 *         description: "Validation error or email already exists"
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
 *                   example: "Validation error."
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 *       500:
 *         description: "Internal server error"
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
 *                   type: string
 *                   example: "Internal Server Error"
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
        response = await fetch(`${userServiceApi}/update`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${ req.user.jwt }`,
                'Content-Type': 'application/json',
                'Cookie': req.headers.cookie || '',
            },
            body: JSON.stringify(req.body),
        });
        responseStatus = response.status;
        responseBody = await response.json();
        return res.status(responseStatus).send(responseBody);

    } catch (error) {
        return await ErrorResponse(error, res, '/user/update', {
            "requestData": req.body,
            "response": response,
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/user/changepassword:
 *   patch:
 *     summary: "Change user password"
 *     description: "Allows an authenticated user to change their password by providing the old password and a new password."
 *     tags:
 *       - "User"
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: "User password change request."
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               old_password:
 *                 type: string
 *                 format: password
 *                 example: "oldPassword123"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "NewStrongPassword123!"
 *               confirm_password:
 *                 type: string
 *                 format: password
 *                 example: "NewStrongPassword123!"
 *               _csrf:
 *                 type: string
 *                 example: 5c325207-aa6f-42d9-80f7-284df562bcca
 *                 description: New csrf token
 *     responses:
 *       200:
 *         description: "Password changed successfully."
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
 *                   example: "Password change successfully."
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       401:
 *         description: "Unauthorized - User not authenticated."
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
 *                   example: "Authentication failed"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: object
 *                   example: {"redirect":"/api/v1/auth"}
 *       400:
 *         description: "Validation error (e.g., incorrect old password, mismatched new passwords, or hash verification failure)"
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
 *                   example: "Validation error."
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 *       404:
 *         description: "User not found"
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
 *                   example: "User not found."
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 * 
 *       500:
 *         description: "Internal server error"
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
 *                   example: "Internal server error."
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 * 
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.patch('/changepassword', isAuthenticated, async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;

    try {
        response = await fetch(`${userServiceApi}/changepassword`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${ req.user.jwt }`,
                'Content-Type': 'application/json',
                'Cookie': req.headers.cookie || '',
            },
            body: JSON.stringify(req.body),
        });
        responseStatus = response.status;
        responseBody = await response.json();
        return res.status(responseStatus).send(responseBody);

    } catch (error) {
        return await ErrorResponse(error, res, '/user/changepassword', {
            "requestData": req.body,
            "response": response,
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/user/status:
 *   get:
 *     summary: Get user authentication status
 *     description: Checks if the user is authenticated and returns a confirmation status.
 *     tags:
 *       - User
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User is authenticated
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
 *                   example: User status.
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       401:
 *         description: Unauthorized - User is not authenticated
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
 *                   example: Authentication failed
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: object
 *                   example: { "redirect": "/api/v1/auth" }
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
 *                   example: Internal server error.
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.get('/status', isAuthenticated, async (req, res) => {
    return res.status(200).send(StandardResponse(
        true,
        "User status.",
        null,
        null
    ));
});

/**
 * @swagger
 * /api/v1/auth/user/followers&followed:
 *   get:
 *     summary: Get user's followers and followed count
 *     description: Retrieves the count of users who follow the authenticated user and those the user is following.
 *     tags:
 *       - User
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved followers and followed counts
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
 *                   example: Users followers & followed
 *                 data:
 *                   type: object
 *                   properties:
 *                     followers:
 *                       type: integer
 *                       example: 15
 *                     followed:
 *                       type: integer
 *                       example: 10
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       401:
 *         description: Unauthorized - User is not authenticated
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
 *                   example: Authentication failed
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: object
 *                   example: { "redirect": "/api/v1/auth" }
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
 *                   example: Internal server error.
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.get('/followers&followed', isAuthenticated, async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;
    try {
        response = await fetch(`${ userServiceApi }/followers&followed`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${ req.user.jwt }`,
                'Cookie': req.headers.cookie || '',
            },
        });
        responseStatus = response.status;
        responseBody = await response.json();
        return res.status(responseStatus).send(responseBody);

    } catch (error) {
        return await ErrorResponse(error, res, '/user/followers&followed', {
            "response": response,
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/user/follow:
 *   post:
 *     summary: Follow a user
 *     description: Authenticated user follows another user by their follower_id.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - follower_id
 *             properties:
 *               follower_id:
 *                 type: integer
 *                 example: 123
 *                 description: The ID of the user to follow.
 *               _csrf:
 *                 type: string
 *                 example: 5c325207-aa6f-42d9-80f7-284df562bcca
 *                 description: New csrf token
 *     responses:
 *       200:
 *         description: Successfully followed user.
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
 *                   example: Successfully follow user
 *                 data:
 *                   type: object
 *                   example: null
 *                 error:
 *                   type: object
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
 *                   example: Validation error
 *                 data:
 *                   type: object
 *                   example: null
 *                 errors:
 *                   type: object
 *                   properties:
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: field
 *                           msg:
 *                             type: object
 *                             properties:
 *                               error:
 *                                 type: string
 *                                 example: Follower ID cannot be empty!
 *                           path:
 *                             type: string
 *                             example: follower_id
 *                           location:
 *                             type: string
 *                             example: body
 *       401:
 *         description: Unauthorized - User is not authenticated
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
 *                   example: Authentication failed
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: object
 *                   example: { "redirect": "/api/v1/auth" }
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
 *                   example: Internal server error.
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.post('/follow', isAuthenticated, async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;
    try {
        response = await fetch(`${ userServiceApi }/follow`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ req.user.jwt }`,
                'Content-Type': 'application/json',
                'Cookie': req.headers.cookie || '',
            },
            body: JSON.stringify(req.body),
        });
        responseStatus = response.status;
        responseBody = await response.json();
        return res.status(responseStatus).send(responseBody);

    } catch (error) {
        return await ErrorResponse(error, res, '/user/follow', {
            "requestData": req.body,
            "response": response,
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
    }
})

/**
 * @swagger
 * /api/v1/auth/user/unfollow:
 *   delete:
 *     summary: Unfollow a user
 *     description: Authenticated user unfollows another user by their follower_id.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - unfollow_id
 *             properties:
 *               unfollow_id:
 *                 type: integer
 *                 example: 123
 *                 description: The ID of the user to unfollow.
 *               _csrf:
 *                 type: string
 *                 example: 5c325207-aa6f-42d9-80f7-284df562bcca
 *                 description: New csrf token
 *     responses:
 *       200:
 *         description: Successfully unfollow user.
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
 *                   example: Successfully unfollowed user
 *                 data:
 *                   type: object
 *                   example: null
 *                 error:
 *                   type: object
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
 *                   example: Validation error
 *                 data:
 *                   type: object
 *                   example: null
 *                 errors:
 *                   type: object
 *                   properties:
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: field
 *                           msg:
 *                             type: object
 *                             properties:
 *                               error:
 *                                 type: string
 *                                 example: Follower ID cannot be empty!
 *                           path:
 *                             type: string
 *                             example: follower_id
 *                           location:
 *                             type: string
 *                             example: body
 *       401:
 *         description: Unauthorized - User is not authenticated
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
 *                   example: Authentication failed
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: object
 *                   example: { "redirect": "/api/v1/auth" }
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
 *                   example: Internal server error.
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.delete('/unfollow', isAuthenticated, async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;
    try {
        response = await fetch(`${ userServiceApi }/unfollow`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${ req.user.jwt }`,
                'Content-Type': 'application/json',
                'Cookie': req.headers.cookie || '',
            },
            body: JSON.stringify(req.body),
        });
        responseStatus = response.status;
        responseBody = await response.json();
        return res.status(responseStatus).send(responseBody);

    } catch (error) {
        return await ErrorResponse(error, res, '/user/unfollow', {
            "requestData": req.body,
            "response": response,
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
    }
})


export default router;