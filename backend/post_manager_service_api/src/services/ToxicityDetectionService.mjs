import fetch from 'node-fetch';
import dotenv from 'dotenv';
import CommonErrors from '../utils/errors/CommonErrors.mjs';


dotenv.config();
const toxicityDetectionServiceApi = `http://${ process.env.TOXICITY_DETECTION_SERVICE_API_HOST }:${ process.env.TOXICITY_DETECTION_SERVICE_API_PORT }`;


class ToxicityDetectionService {
    constructor() {
    }

    async predict(jwt, description) {
        try {
            const response = await fetch(`${ toxicityDetectionServiceApi }/predict`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ jwt }`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: description,
                }),
            });
            const responseStatus = response.status;
            const responseBody = await response.json();
            if (responseStatus !== 200) {
                throw new Error(CommonErrors.INTERNAL_SERVER_ERROR);
            }
            return responseBody;

        } catch (error) {
            throw error;
        }
    }

    async result(jwt, jobId) {
        try {
            const response = await fetch(`${ toxicityDetectionServiceApi }/result/${ jobId }`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${ jwt }`,
                    'Content-Type': 'application/json',
                },
            });
            const responseStatus = response.status;
            const responseBody = await response.json();
            if (responseStatus !== 200) {
                throw new Error(CommonErrors.INTERNAL_SERVER_ERROR);
            }
            return responseBody;

        } catch (error) {
            throw error;
        }
    }

}

export default ToxicityDetectionService;