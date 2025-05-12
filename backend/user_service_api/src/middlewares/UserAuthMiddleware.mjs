import CommonErrors from '../utils/errors/CommonErrors.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';


dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || '5iLt1QIXlARhJc2mSwXB5yETHH+ZsKslfB03XJpntC'; // use the same secret as the api gateway


const isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Extract "Bearer <token>"

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user info to request object
        req.user = decoded;

        return next(); // Proceed to route or next middleware
    } catch (err) {
        return await ErrorResponse(
            new Error(CommonErrors.AUTHENTICATION_FAILED),
            res,
            'local user auth middleware'
        );
    }
};

export default isAuthenticated;