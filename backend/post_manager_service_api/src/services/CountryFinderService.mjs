import fetch from 'node-fetch';
import dotenv from 'dotenv';
import CommonErrors from '../utils/errors/CommonErrors.mjs';


dotenv.config();
const countryFinderServiceApi = `http://${ process.env.COUNTRY_FINDER_SERVICE_API_HOST }:${ process.env.COUNTRY_FINDER_SERVICE_API_PORT }`;


class CountryFinderService {
    constructor() {
    }

    async predict(jwt, description) {
        try {
            const response = await fetch(`${ countryFinderServiceApi }/predict`, {
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
                throw new Error(CommonErrors.UNEXPECTED_ERROR);
            }
            return responseBody;

        } catch (error) {
            throw error;
        }
    }

    async result(jwt, jobId) {
        try {
            const response = await fetch(`${ countryFinderServiceApi }/result/${ jobId }`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${ jwt }`,
                    'Content-Type': 'application/json',
                },
            });
            const responseStatus = response.status;
            const responseBody = await response.json();
            if (responseStatus !== 200) {
                throw new Error(CommonErrors.UNEXPECTED_ERROR);
            }
            return responseBody;

        } catch (error) {
            throw error;
        }
    }

}

export default CountryFinderService;