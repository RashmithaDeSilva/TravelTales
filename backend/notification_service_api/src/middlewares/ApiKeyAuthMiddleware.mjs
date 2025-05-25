import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import dotenv from 'dotenv';
import CommonErrors from '../utils/errors/CommonErrors.mjs';


dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || '5iLt1QIXlARhJc2mSwXB5yETHH+ZsKslfB03XJpntC'; // use the same secret as the api gateway
const USER_SERVICE_API = process.env.USER_SERVICE_API || 'http://172.20.5.21:4001'; // /api/v1/auth/user/status
const NOTIFICATION_API_KEY = process.env.NOTIFICATION_API_KEY;
const allowedIps = ['127.0.0.1', '::1', '172.20.5.30', '172.20.5.40'];


const isAuthenticated = async (req, res, next) => {
    try {
        // Normalize IP address
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.ip;

        // Check if the IP is allowed
        if (!allowedIps.includes(ip)) {
            throw new Error(CommonErrors.UNAUTHORIZED_IP_ADDRESS);
        }

        // Extract API key from headers
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            throw new Error(CommonErrors.AUTHENTICATION_FAILED);
        }

        const apiKey = authHeader.split(' ')[0]; // Extract "<api key> <token>"
        const token = authHeader.split(' ')[1]; // Extract "<api key> <token>"

        // Check is key is valid
        if (!apiKey || NOTIFICATION_API_KEY !== apiKey) {
            throw new Error(CommonErrors.AUTHENTICATION_FAILED);
        }

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
        return next(); // Continue to the next middleware or route handler

    } catch (error) {
        return await ErrorResponse(error, res, 'api key auth middleware');
    }
};


export default isAuthenticated;