import CommonErrors from '../utils/errors/CommonErrors.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';


dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || '5iLt1QIXlARhJc2mSwXB5yETHH+ZsKslfB03XJpntC'; // use the same secret as the api gateway
const USER_SERVICE_API = process.env.USER_SERVICE_API || 'http://172.20.5.21:3002'; ///api/v1/auth/user/status

const isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Extract "Bearer <token>"

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Verity user
        const response = await fetch(`${ USER_SERVICE_API}/api/v1/auth/user/status`, {
            method: 'GET',
            headers: {
                'Authorization': `${ authHeader }`,
            },
        });
        if (!response.ok) {
            throw new Error(CommonErrors.AUTHENTICATION_FAILED);
        }

        // Attach user info to request object
        req.user = decoded;

        return next(); // Proceed to route or next middleware

    } catch (error) {
        console.log(error);
        return await ErrorResponse(
            new Error(CommonErrors.AUTHENTICATION_FAILED),
            res,
            'local user auth middleware',
            {
                Error: {
                    error_message: error.message,
                    error_stack: error.stack,
                }
            }
        );
    }
};

export default isAuthenticated;