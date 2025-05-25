import { Router } from 'express';
import dotenv from 'dotenv';
import isAuthenticated from '../middlewares/UserAuthMiddleware.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';


dotenv.config();
const router = Router();
const restCountriesSerciveApi = `http://${ process.env.REST_COUNTRIES_SERVICE_API_HOST || '172.20.5.53' }:${ process.env.REST_COUNTRIES_SERVICE_API_PORT || 4003 }/api/${ process.env.REST_COUNTRIES_SERVICE_API_VERSION || 'v1' }/auth/restcountry`;


/**
 * @swagger
 * /api/v1/auth/restcountry/countrylist:
 *   get:
 *     summary: "Get all country names"
 *     description: "Returns a list of country names from the cached restcountries data."
 *     tags:
 *       - "RestCountry"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved the list of country names."
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
 *                   example: "Rest countries list"
 *                 data:
 *                   type: object
 *                   properties:
 *                     countrys_count:
 *                       type: integer
 *                       example: 5
 *                     countrys:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "Sri Lanka"
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: "Invalid API key or missing authorization header."
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
 *                   example: "Invalid API key"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       401:
 *         description: "API key is required in the request header."
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
 *                   example: { "redirect": "/api/v1/auth" }
 *       500:
 *         description: "Internal server error."
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
 *                   example: null
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.get('/countrylist', isAuthenticated, async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;
    try {
        response = await fetch(`${ restCountriesSerciveApi }/countrylist`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${req.user.jwt}`,
            },
        });

        responseStatus = response.status;
        responseBody = await response.json();
        return res.status(responseStatus).send(responseBody);

    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/countrylist', {
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/restcountry/name/{name}:
 *   get:
 *     summary: "Retrieve country by name"
 *     description: "Fetches a country by its name from the cache or an external API if the cache fails."
 *     tags:
 *       - "RestCountry"
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: "The name of the country to retrieve."
 *         schema:
 *           type: string
 *           example: "Sri Lanka"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved the list of countries."
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
 *                   example: "Rest countries all"
 *                 data:
 *                   type: object
 *                   properties:
 *                     countrys_count:
 *                       type: integer
 *                       example: 20
 *                     countrys:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "United States"
 *                           code:
 *                             type: string
 *                             example: "US"
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: "Invalid API key or missing authorization header."
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
 *                   example: "Invalid API key"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       401:
 *         description: "API key is required in the request header."
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
 *                   type: string
 *                   example: {"redirect":"/api/v1/auth"}
 *       404:
 *         description: "Country not found."
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
 *                   example: "Country not found"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       500:
 *         description: "Internal server error."
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
 *                   example: null
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.get('/name/:name', isAuthenticated, async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;
    try {
        response = await fetch(`${ restCountriesSerciveApi }/name/${ req.params.name }`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${req.user.jwt}`,
            },
        });

        responseStatus = response.status;
        responseBody = await response.json();
        return res.status(responseStatus).send(responseBody);

    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/name', {
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/restcountry/find:
 *   get:
 *     summary: Find countries by name
 *     description: Searches for countries by partial name match with pagination. Requires authentication.
 *     tags:
 *       - RestCountry
 *     parameters:
 *       - in: query
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *         description: Country name to search
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: size
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of countries
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
 *                   example: "Rest country with name: United"
 *                 data:
 *                   type: object
 *                   properties:
 *                     countrys_count:
 *                       type: integer
 *                       example: 20
 *                     countrys:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "United States"
 *                           code:
 *                             type: string
 *                             example: "US"
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: "Invalid API key or missing authorization header."
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
 *                   example: "Invalid API key"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       401:
 *         description: "API key is required in the request header."
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
 *                   type: string
 *                   example: {"redirect":"/api/v1/auth"}
 *       404:
 *         description: "Country not found."
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
 *                   example: "Country not found"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       500:
 *         description: "Internal server error."
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
 *                   example: null
 */
router.get('/find', isAuthenticated, async (req, res) => {
    let response;
    let responseStatus;
    let responseBody;
    try {
        // Start with base params
        const params = new URLSearchParams();

        // Always required
        if (req.query.page) params.append('country', req.query.country);
        if (req.query.page) params.append('page', req.query.page);
        if (req.query.size) params.append('size', req.query.size);

        response = await fetch(`${ restCountriesSerciveApi }/find?${ params.toString() }`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${req.user.jwt}`,
            },
        });

        responseStatus = response.status;
        responseBody = await response.json();
        return res.status(responseStatus).send(responseBody);

    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/countrylist', {
            "responseStatus": responseStatus,
            "responseBody": responseBody,
        });
    }
});

export default router;
