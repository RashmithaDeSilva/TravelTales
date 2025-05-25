import { Router } from 'express';
import dotenv from 'dotenv';
import { validationResult, matchedData, checkSchema } from 'express-validator';
import NotificationValidationSchema from '../utils/validations/NotificationValidationSchema.mjs';
import isAuthenticated from '../middlewares/ApiKeyAuthMiddleware.mjs';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import NotificationService from '../services/NotificationService.mjs';


dotenv.config();
const API_VERSION = process.env.API_VERSION || 'v1';
const router = Router();
const notificationService = new NotificationService();


router.post('/create', isAuthenticated, [
    checkSchema({
        ...NotificationValidationSchema.titleValidation(),
        ...NotificationValidationSchema.contentValidation(),
        ...NotificationValidationSchema.infoValidation(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, '/notification/create', errors);
    }

    const data = matchedData(req);

    try {
        await notificationService.create(data, req.user.id);
    } catch (error) {
        return await ErrorResponse(error, res, '/notification/create', data);
    }

    return res.status(200).send(StandardResponse(
        true,
        "Notification create successfully.",
        null,
        null
    ));
});

router.post('/send', isAuthenticated, [
    checkSchema({
        ...NotificationValidationSchema.titleValidation(),
        ...NotificationValidationSchema.contentValidation(),
        ...NotificationValidationSchema.infoValidation(),
        ...NotificationValidationSchema.userIdValidation(),
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return await ErrorResponse(new Error(CommonErrors.VALIDATION_ERROR), res, '/notification/send', errors);
    }

    const data = matchedData(req);

    try {
        await notificationService.send(data);
    } catch (error) {
        return await ErrorResponse(error, res, '/notification/send', data);
    }

    return res.status(200).send(StandardResponse(
        true,
        "Notification create successfully.",
        null,
        null
    ));
});


export default router;
