import express from 'express';
import dotenv from 'dotenv';
import { setupSwagger } from './src/utils/Swagger.mjs';
import router from './src/routers/Router.mjs';
import { LogTypes } from './src/utils/enums/LogTypes.mjs';
import { log } from './src/utils/ConsoleLog.mjs';
import ErrorResponse from './src/utils/responses/ErrorResponse.mjs';
import CommonErrors from './src/utils/errors/CommonErrors.mjs';


// Setup express app
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3004;
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
