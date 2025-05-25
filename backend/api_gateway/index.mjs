import express from 'express';
import dotenv from 'dotenv';
import { setupSwagger } from './src/utils/Swagger.mjs';
import session from 'express-session';
import router from './src/routers/Router.mjs';
import passport from 'passport';
import './src/strategies/local-strategy.mjs';
import redisSessionStore from './src/stores/SessionStore.mjs';
import { LogTypes } from './src/utils/enums/LogTypes.mjs';
import { log } from './src/utils/ConsoleLog.mjs';
import cookieParser from 'cookie-parser';
import tinyCsrf from 'tiny-csrf';
import ErrorResponse from './src/utils/responses/ErrorResponse.mjs';
import CsrfTokenErrors from './src/utils/errors/CsrfTokenErrors.mjs';
import CommonErrors from './src/utils/errors/CommonErrors.mjs';


// Setup express app
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
const API_VERSION = process.env.API_VERSION || 'v1';
const ENV = process.env.ENV || 'DEV';


// Swagger setup
if (ENV === "DEV") {
    setupSwagger(app);
}

// Middleware
app.use(express.json());

// Handle bad JSON
app.use(async (err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return await ErrorResponse(new Error(CommonErrors.INVALID_JSON_FORMAT), res);
    }
    next(err); // forward to other error handlers
});

// Cookie setup
app.use(cookieParser(process.env.COOKIE_SECRET || 'argon2id19553bnfppLSoqliLt1QIXlA'));

// Session setup
app.use(session({
    store: redisSessionStore,
    secret: process.env.SESSION_SECRET || 'wVI7efbx+CV43xplx4!H$a&lUAX2H6jJ)Gb&0NJy$%)V%TNAPaUF=5yHeZ6Sz!I@',
    saveUninitialized: false, // recommended: only save session when data exists
    resave: true, // required: force lightweight session keep alive (touch)
    httpOnly: true,
    secure: true,
    cookie: {
        maxAge: Number(process.env.COOKIE_EX_TIME || 86400) * 1000,
        httpOnly: true, // Cookie is not accessible via JavaScript
        // secure: ENV === 'PROD', // Only send cookie over HTTPS in production
    },
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// CSRF Middleware Setup
app.use(tinyCsrf(
    process.env.CSRF_SECRET || 'IXlARhJc2mSwXB5yETHH+ZsKslfB03XJ', // CSRF secret
    ['POST', 'PUT', 'PATCH', 'DELETE'], // HTTP methods to protect
    // URL paths to exclude from CSRF protection
    [
        `/api/${ API_VERSION }/auth/login`,
        `/api/${ API_VERSION }/auth/register`
    ], 
    [] // origins like service worker, etc.
));

// Error handling for CSRF
app.use(async (err, req, res, next) => {
    if (err.message === `Did not get a valid CSRF token for '${req.method} ${req.originalUrl}': ${req.body?._csrf} v. ${req.signedCookies.csrfToken}`) {
      return await ErrorResponse(new Error(CsrfTokenErrors.INVALID_CSRF_TOKEN), res);
    }
    next(err);
});
  
// Routers setup
app.use(`/api/${ API_VERSION }/`, router);

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
app.use(async (req, res, next) => {
  return await ErrorResponse(new Error(CommonErrors.NOT_FOUND), res);
});

app.listen(PORT, ()=>{
    log(LogTypes.INFO, `Server is running on http://localhost:${ PORT }`);
    if (ENV === "DEV") {
        log(LogTypes.INFO, `Swagger doc available on http://localhost:${ PORT }/api/${ API_VERSION }/api-docs`);
    }
});
