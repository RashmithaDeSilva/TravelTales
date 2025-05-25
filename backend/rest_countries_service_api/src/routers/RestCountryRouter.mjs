import { Router } from 'express';
import dotenv from 'dotenv';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import isAuthenticated from '../middlewares/UserAuthMiddleware.mjs';
import CacheStoreService from '../services/CacheStoreService.mjs';
import ErrorLogService from '../services/ErrorLogService.mjs';
import CacheStoreErrors from '../utils/errors/CacheStoreErrors.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import RestCountryErrors from '../utils/errors/RestCountryErrors.mjs';
import CountryValidationSchema from '../utils/validations/CountryValidationSchema.mjs';


dotenv.config();
const router = Router();
const cacheStoreService = new CacheStoreService();
const errorLogService = new ErrorLogService();
const DATA_RETRIEVE_API = process.env.DATA_RETRIEVE_API || 'https://restcountries.com/v3.1/all';

/**
 * @swagger
 * /api/v1/auth/restcountry:
 *   get:
 *     summary: "Retrieve all countries"
 *     description: "Fetches a list of countries from cache or an external API if the cache fails."
 *     tags:
 *       - "RestCountry"
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
router.get('/', isAuthenticated, async (req, res) => {
    try {
        let restCountries;
        
        try {
            // Try to get countries from cache
            restCountries = await cacheStoreService.getAllCountries();

        } catch (cacheError) {
            // Save error on error log
            await errorLogService.createLog('/restcountry/', cacheError);

            // If cache fetch fails, fetch from external API
            const response = await fetch( DATA_RETRIEVE_API );
            if (!response.ok) {
                throw new Error(`${ CacheStoreErrors.FAILED_TO_FETCH_DATA  } (response status: ${ response.statusText })`);
            }
            restCountries = await response.json();
        }

        return res.status(200).send(StandardResponse(
            true,
            "Rest countries all",
            restCountries,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/');
    }
});

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
    try {
        let restCountries;
        
        try {
            // Try to get countries from cache
            restCountries = await cacheStoreService.getAllCountryList();

        } catch (cacheError) {
            throw new Error(CacheStoreErrors.FAILED_TO_FETCH_DATA);
        }

        return res.status(200).send(StandardResponse(
            true,
            "Rest countries list",
            restCountries,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/countrylist');
    }
})

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
    try {
        const countryName = req.params.name;
        let restCountries;
        
        try {
            // Try to get countries from cache
            restCountries = await cacheStoreService.getCountryByName(countryName);

            // If no data found in cache, return error
            if (!restCountries || restCountries.length === 0) {
                throw new Error(RestCountryErrors.COUNTRY_NOT_FOUND);
            }

        } catch (cacheError) {
            // Log cache error
            await errorLogService.createLog('/restcountry/name', cacheError);

            // If cache fetch fails, fetch from external API
            const response = await fetch(`${ DATA_RETRIEVE_API }/name/${ encodeURIComponent(countryName) }`);
            if (!response.ok) {
                throw new Error(`${ CacheStoreErrors.FAILED_TO_FETCH_DATA } (response status: ${ response.statusText })`);
            }
            restCountries = await response.json();
        }

        return res.status(200).send(StandardResponse(
            true,
            `Rest country with name: ${ countryName }`,
            restCountries,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/name');
    }
});

/**
 * @swagger
 * /api/v1/auth/restcountry/currency/{name}:
 *   get:
 *     summary: "Retrieve countries by currency"
 *     description: "Fetches a list of countries that use the specified currency from the cache or an external API if the cache fails."
 *     tags:
 *       - "RestCountry"
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: "The currency code (e.g., USD, EUR) to find associated countries."
 *         schema:
 *           type: string
 *           example: "USD"
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
router.get('/currency/:name', isAuthenticated, async (req, res) => {
    try {
        const currencyName = req.params.name;
        let restCountries;
        
        try {
            // Try to get countries from cache
            restCountries = await cacheStoreService.getCountryByCurrency(currencyName);

            // If no data found in cache, return error
            if (!restCountries || restCountries.length === 0) {
                throw new Error(RestCountryErrors.COUNTRY_NOT_FOUND);
            }

        } catch (cacheError) {
            // Log cache error
            await errorLogService.createLog('/restcountry/currency', cacheError);

            // If cache fetch fails, fetch from external API
            const response = await fetch(`${ DATA_RETRIEVE_API }/currency/${ encodeURIComponent(currencyName) }`);
            if (!response.ok) {
                throw new Error(`${ CacheStoreErrors.FAILED_TO_FETCH_DATA } (response status: ${ response.statusText })`);
            }
            restCountries = await response.json();
        }

        return res.status(200).send(StandardResponse(
            true,
            `Rest country with currency: ${ currencyName }`,
            restCountries,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/currency');
    }
});

/**
 * @swagger
 * /api/v1/auth/restcountry/capital/{name}:
 *   get:
 *     summary: "Retrieve countries by capital city"
 *     description: "Fetches a list of countries that have the specified capital from the cache or an external API if the cache fails."
 *     tags:
 *       - "RestCountry"
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: "The capital city name to find associated countries."
 *         schema:
 *           type: string
 *           example: "Paris"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved the list of countries by capital."
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
 *                   example: "Rest country with capital: Paris"
 *                 data:
 *                   type: object
 *                   properties:
 *                     countrys_count:
 *                       type: integer
 *                       example: 3
 *                     countrys:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "France"
 *                           code:
 *                             type: string
 *                             example: "FR"
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
router.get('/capital/:name', isAuthenticated, async (req, res) => {
    try {
        const capitalName = req.params.name;
        let restCountries;
        
        try {
            // Try to get countries from cache
            restCountries = await cacheStoreService.getCountryByCapital(capitalName);

            // If no data found in cache, return error
            if (!restCountries || restCountries.length === 0) {
                throw new Error(RestCountryErrors.COUNTRY_NOT_FOUND);
            }

        } catch (cacheError) {
            // Log cache error
            await errorLogService.createLog('/restcountry/capital', cacheError);

            // If cache fetch fails, fetch from external API
            const response = await fetch(`${ DATA_RETRIEVE_API }/capital/${ encodeURIComponent(capitalName) }`);
            if (!response.ok) {
                throw new Error(`${ CacheStoreErrors.FAILED_TO_FETCH_DATA } (response status: ${ response.statusText })`);
            }
            restCountries = await response.json();
        }

        return res.status(200).send(StandardResponse(
            true,
            `Rest country with capital: ${ capitalName }`,
            restCountries,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/capital');
    }
});

/**
 * @swagger
 * /api/v1/auth/restcountry/flag/{name}:
 *   get:
 *     summary: "Retrieve country flag by country name"
 *     description: "Fetches the flag of a country by its name, using the cache or an external API if the cache fails."
 *     tags:
 *       - "RestCountry"
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: "The country name to retrieve the flag for."
 *         schema:
 *           type: string
 *           example: "United States"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved the country's flag."
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
 *                   example: "Rest country with flag: United States"
 *                 data:
 *                   type: object
 *                   properties:
 *                     country:
 *                       type: string
 *                       example: "United States"
 *                     code:
 *                       type: string
 *                       example: "US"
 *                     flag:
 *                       type: string
 *                       example: "https://flagcdn.com/w320/us.png"
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
router.get('/flag/:name', isAuthenticated, async (req, res) => {
    try {
        const countryName = req.params.name;
        let restCountries;
        
        try {
            // Try to get countries from cache
            restCountries = await cacheStoreService.getFlagByCountryName(countryName);

            // If no data found in cache, return error
            if (!restCountries || restCountries.length === 0) {
                throw new Error(RestCountryErrors.COUNTRY_NOT_FOUND);
            }

        } catch (cacheError) {
            // Log cache error
            await errorLogService.createLog('/restcountry/flag', cacheError);

            // If cache fetch fails, fetch from external API
            const response = await fetch(`${ DATA_RETRIEVE_API }/flag/${ encodeURIComponent(countryName) }`);
            if (!response.ok) {
                throw new Error(`${ CacheStoreErrors.FAILED_TO_FETCH_DATA } (response status: ${ response.statusText })`);
            }
            restCountries = await response.json();
        }

        return res.status(200).send(StandardResponse(
            true,
            `Rest country with flag: ${ countryName }`,
            restCountries,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/flag');
    }
});

/**
 * @swagger
 * /api/v1/auth/restcountry/verify/{country}:
 *   get:
 *     summary: "Verify if a country name is valid"
 *     description: "Validates a given country name against the RestCountries data source using a route parameter."
 *     tags:
 *       - "RestCountry"
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         description: "The name of the country to verify."
 *         schema:
 *           type: string
 *           example: "Sri Lanka"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Successfully verified the country name."
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
 *                   example: "Rest country with verify: Sri Lanka"
 *                 data:
 *                   type: object
 *                   properties:
 *                     verification:
 *                       type: boolean
 *                       example: true
 *                 errors:
 *                   type: "null"
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: "Validation error in request parameters."
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
 *                   nullable: true
 *                   example: null
 *                 errors:
 *                   type: object
 *                   example:
 *                     country: "Country is required"
 *       401:
 *         description: "Authentication required."
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
 *                   nullable: true
 *                   example: null
 *                 errors:
 *                   type: object
 *                   example:
 *                     redirect: "/api/v1/auth"
 *       404:
 *         description: "Country not found in the RestCountries database."
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
 *                   nullable: true
 *                   example: null
 *                 errors:
 *                   type: "null"
 *                   nullable: true
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
 *                   nullable: true
 *                   example: null
 *                 errors:
 *                   type: "null"
 *                   nullable: true
 *                   example: null
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.get('/verify/:country', isAuthenticated, async (req, res) => {
    try {
        const countryName = req.params.country;

        if (!countryName) {
            throw new Error(RestCountryErrors.COUNTRY_NOT_FOUND);
        }

        const result = await cacheStoreService.verifyCountry(countryName);

        // If no data found in cache, return error
        if (!result || result.length === 0) {
            throw new Error(RestCountryErrors.COUNTRY_NOT_FOUND);
        }

        return res.status(200).send(StandardResponse(
            true,
            `Rest country with verify: ${countryName}`,
            {
                verification: result,
            },
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/verify');
    }
});


export default router;