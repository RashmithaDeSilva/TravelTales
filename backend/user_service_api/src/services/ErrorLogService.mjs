import ErrorLogModel from '../models/ErrorLogModel.mjs';
import { log } from '../utils/ConsoleLog.mjs';
import { LogTypes } from '../utils/enums/LogTypes.mjs';

class ErrorLogService {
    constructor() {
    }

    // Create log
    async createLog(location, error, requestData = null) {
        try {
            // const errorLog = new ErrorLogModel(location, error.message, 
            //     error.stack, requestData);
            // await this.errorLogDAO.create(errorLog);
            return true;

        } catch (error) {
            log(LogTypes.ERROR, `Failed to log error: ${ error }`);
        }
    }

    // Get error log count
    async getErrorLogCount() {
        try {
            // const errorLogCount = await this.errorLogDAO.getErrorLogCount();
            // return errorLogCount;
            return true;
            
        } catch (error) {
            throw error;
        }
    }
}

export default ErrorLogService;