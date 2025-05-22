import StandardResponse from "./StandardResponse.mjs";
import ErrorLogService from "../../services/ErrorLogService.mjs";
import CommonErrors from "../errors/CommonErrors.mjs";
import PostErrors from '../errors/PostErrors.mjs';
import RestCountryError from '../errors/RestCountryError.mjs';
import { LogTypes } from "../enums/LogTypes.mjs";
import { log } from "../ConsoleLog.mjs";
import dotenv from 'dotenv';

dotenv.config();
const ENV = process.env.ENV || "PROD";
const API_VERSION = process.env.API_VERSION || 'v1';
const errorLogService = new ErrorLogService();

// Log error in database
async function logError(location, error, data) {
    try {
        await errorLogService.createLog(location, error, data);

    } catch (error) {
        log(LogTypes.ERROR, error);
    }
}

// Response errors
async function ErrorResponse(error, res, location = null, data = null) {
    try {
        switch (error.message) {
            case RestCountryError.INVALID_COUNTRY_NAME:
            case CommonErrors.VALIDATION_ERROR:
                return res.status(400).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    data
                ));

            case CommonErrors.AUTHENTICATION_FAILED:
                return res.status(401).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    { redirect: `/api/${ API_VERSION }/auth` }
                ));

            case CommonErrors.NOT_FOUND:
                return res.status(404).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    { redirect: `/api/${ API_VERSION }/auth/login` }
                ));

            case RestCountryError.COUNTRY_NOT_FOUND:
                return res.status(404).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    null,
                ));

            case PostErrors.POST_CONTAINS_TOXIC_CONTENT:
                return res.status(422).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    null,
                ));

            case PostErrors.POST_IS_NOT_CREATED_TRY_AGAIN:
                return res.status(500).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    ENV === "DEV" ? error.message : null // Only expose internal error messages in DEV
                ));
    
            default:
                // PostErrors.IMAGE_ID_IS_EXIST
                await logError(location, error, data);
                return res.status(500).send(StandardResponse(
                    false,
                    CommonErrors.INTERNAL_SERVER_ERROR,
                    null,
                    ENV === "DEV" ? error.message : null // Only expose internal error messages in DEV
                ));
        }
        
    } catch (error) {
        log(LogTypes.ERROR, error);
        return res.status(500).send(StandardResponse(
            false,
            CommonErrors.INTERNAL_SERVER_ERROR,
            null,
            ENV === "DEV" ? error.message : null // Only expose internal error messages in DEV
        ));
    }
}

export default ErrorResponse;