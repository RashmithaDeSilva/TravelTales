import { Router } from 'express';
import dotenv from 'dotenv';
import isAuthenticated from '../middlewares/UserAuthMiddleware.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import ToxicityDetectionErrors from '../utils/errors/ToxicityDetectionErrors.mjs';


dotenv.config();
const router = Router();
const toxicityDetectionServiceApi = `http://${ process.env.TOXICITY_DETECTION_SERVICE_API_HOST }:${ process.env.TOXICITY_DETECTION_SERVICE_API_PORT }`;


/**
 * @swagger
 * /api/v1/auth/toxicitydetection/predict:
 *   post:
 *     summary: Submit a text for toxicity prediction
 *     description: >
 *       Accepts a text input and returns a job ID.
 *       The job is processed asynchronously and can be retrieved using `/api/v1/auth/toxicitydetection/predict`.
 *     tags:
 *       - "Toxicity Detection"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *                 example: You are the worst person ever
 *               _csrf:
 *                 type: string
 *                 example: 5c325207-aa6f-42d9-80f7-284df562bcca
 *                 description: New csrf token
 *     responses:
 *       200:
 *         description: Job successfully submitted
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
 *                   example: Prediction job submitted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     job_id:
 *                       type: string
 *                       example: b1fc03a9-9450-41ad-9217-2fa188c44d09
 *                     status:
 *                       type: string
 *                       example: waiting
 *                 errors:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Invalid or missing input
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
 *                   example: Description must be a non-empty string
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *                 errors:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *       415:
 *         description: Unsupported content type
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
 *                   example: Content-Type must be application/json
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *                 errors:
 *                   type: object
 *                   nullable: true
 *                   example: null
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.post('/predict', isAuthenticated, async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;

    try {
        response = await fetch(`${ toxicityDetectionServiceApi }/predict`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ req.user.jwt }`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });
        responseStatus = response.status;
        responseBody = await response.json();

        if (responseStatus === 200) {
            return res.status(responseStatus).send(StandardResponse(
                true,
                "Prediction job submitted successfully",
                responseBody,
                null
            ));
        }

        if (responseStatus === 415) {
            throw new Error(ToxicityDetectionErrors.CONTENT_TYPE_MUST_BE_APPLICATION_JSON);

        } else if (responseStatus === 400 && responseBody?.error === "Malformed JSON body") {
            throw new Error(ToxicityDetectionErrors.MALFORMED_JSON_BODY);

        } else if (responseStatus === 400 && responseBody?.error === "Invalid JSON structure") {
            throw new Error(ToxicityDetectionErrors.INVALID_JSON_STRUCTURE);

        } else if (responseStatus === 400 && responseBody?.error === "Description must be a non-empty string") {
            throw new Error(ToxicityDetectionErrors.DESCRIPTION_MUST_BE_A_NON_EMPTY_STRING);

        } else if (responseStatus === 401 && responseBody?.error === "Token is missing") {
            throw new Error(ToxicityDetectionErrors.TOKEN_IS_MISSING);

        } else if (responseStatus === 401 && responseBody?.error === "Token has expired") {
            throw new Error(ToxicityDetectionErrors.TOKEN_HAS_EXPIRED);
            
        } else if (responseStatus === 401 && responseBody?.error === "Invalid token") {
            throw new Error(ToxicityDetectionErrors.INVALID_TOKEN);
        }
        throw new Error(ToxicityDetectionErrors.UNEXPECTED_ERROR);

    } catch (error) {
        return await ErrorResponse(error, res, '/toxicitydetection/predict', {
            "requestData": req.body,
            "response": response,
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
    }
})

/**
 * @swagger
 * /api/v1/auth/toxicitydetection/result/{job_id}:
 *   get:
 *     summary: Get job status and result using job ID
 *     description: >
 *       Returns the current status of the prediction job.
 *       If completed, the predicted countries and their confidence levels will be included.
 *     tags:
 *       - "Toxicity Detection"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: job_id
 *         in: path
 *         required: true
 *         description: The job ID returned by the `/predict` endpoint.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job status (and result if completed)
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
 *                   example: Prediction result retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     job_id:
 *                       type: string
 *                       example: 6e761884-539c-412d-9f42-b49b73992a53
 *                     status:
 *                       type: string
 *                       enum: [waiting, predicting, done]
 *                       example: done
 *                     result:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *                         format: float
 *                       example:
 *                         identity_attack: 0.005781027488410473
 *                         insult: 0.8024723529815674
 *                         obscene: 0.12123437225818634
 *                         severe_toxicity: 0.006015077233314514
 *                         threat: 0.0017906995490193367
 *                         toxicity: 0.9596997499465942
 *                 errors:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *       404:
 *         description: Job not found or expired
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
 *                   example: Job ID not found
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *                 errors:
 *                   type: object
 *                   nullable: true
 *                   example: null
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
router.get('/result/:job_id', isAuthenticated, async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;

    try {
        response = await fetch(`${ toxicityDetectionServiceApi }/result/${ req.params.job_id }`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${ req.user.jwt }`,
                'Content-Type': 'application/json',
            },
        });
        responseStatus = response.status;
        responseBody = await response.json();

        if (responseStatus === 200) {
            return res.status(responseStatus).send(StandardResponse(
                true,
                "Prediction result retrieved successfully",
                responseBody,
                null
            ));
        }

        if (responseStatus === 404) {
            throw new Error(ToxicityDetectionErrors.JOB_ID_NOT_FOUND);
        } else if (responseStatus === 401 && responseBody?.error === "Token is missing") {
            throw new Error(ToxicityDetectionErrors.TOKEN_IS_MISSING);

        } else if (responseStatus === 401 && responseBody?.error === "Token has expired") {
            throw new Error(ToxicityDetectionErrors.TOKEN_HAS_EXPIRED);
            
        } else if (responseStatus === 401 && responseBody?.error === "Invalid token") {
            throw new Error(ToxicityDetectionErrors.INVALID_TOKEN);
        }
        throw new Error(ToxicityDetectionErrors.UNEXPECTED_ERROR);

    } catch (error) {
        return await ErrorResponse(error, res, '/toxicitydetection/result', {
            "requestData": req.params,
            "response": response,
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
    }
})


export default router;