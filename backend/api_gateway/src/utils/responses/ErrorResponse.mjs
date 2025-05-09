import StandardResponse from "./StandardResponse.mjs";
import DatabaseErrors from "../errors/DatabaseErrors.mjs"
import HashErrors from "../errors/HashErrors.mjs";
import ErrorLogService from "../../services/ErrorLogService.mjs";
import CommonErrors from "../errors/CommonErrors.mjs";
import CsrfTokenErrors from '../errors/CsrfTokenErrors.mjs';
import CountryFinderErrors from '../errors/CountryFinderErrors.mjs';
import ToxicityDetectionErrors from '../errors/ToxicityDetectionErrors.mjs';
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
            case CommonErrors.VALIDATION_ERROR:
                return res.status(400).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    data
                ));

            case DatabaseErrors.EMAIL_ALREADY_EXISTS:
            case DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD:
            case DatabaseErrors.INVALID_EMAIL_ADDRESS:
            case HashErrors.INVALID_OLD_PASSWORD:
            case CountryFinderErrors.MALFORMED_JSON_BODY:
            case CountryFinderErrors.INVALID_JSON_STRUCTURE:
            case CountryFinderErrors.DESCRIPTION_MUST_BE_A_NON_EMPTY_STRING:
            case ToxicityDetectionErrors.MALFORMED_JSON_BODY:
            case ToxicityDetectionErrors.INVALID_JSON_STRUCTURE:
            case ToxicityDetectionErrors.DESCRIPTION_MUST_BE_A_NON_EMPTY_STRING:
                return res.status(400).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    null 
                ));

            case CommonErrors.AUTHENTICATION_FAILED:
                return res.status(401).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    { redirect: `/api/${ API_VERSION }/auth` }
                ));

            case CsrfTokenErrors.INVALID_CSRF_TOKEN:
                return res.status(403).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    null
                ));

            case CommonErrors.NOT_FOUND:
            case DatabaseErrors.USER_NOT_FOUND:
                return res.status(404).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    { redirect: `/api/${ API_VERSION }/auth/login` }
                ));

            case CountryFinderErrors.JOB_ID_NOT_FOUND:
            case ToxicityDetectionErrors.JOB_ID_NOT_FOUND:
                return res.status(404).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    null
                ));

            case CountryFinderErrors.CONTENT_TYPE_MUST_BE_APPLICATION_JSON:
            case ToxicityDetectionErrors.CONTENT_TYPE_MUST_BE_APPLICATION_JSON:
                return res.status(415).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    null
                ));

            case HashErrors.HASHING_FAILED:
            case HashErrors.HASH_VERIFICATION_FAILED:
                await logError(location, error, data);
                return res.status(500).send(StandardResponse(
                    false,
                    CommonErrors.INTERNAL_SERVER_ERROR,
                    null,
                    ENV === "DEV" ? error.message : null // Only expose internal error messages in DEV
                ));
    
            default:
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