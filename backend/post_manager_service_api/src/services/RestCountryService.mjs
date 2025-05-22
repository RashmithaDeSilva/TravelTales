import fetch from 'node-fetch';
import dotenv from 'dotenv';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
import RestCountryError from '../utils/errors/RestCountryError.mjs';


dotenv.config();
const restCountryServiceApi = `http://${ process.env.REST_COUNTRY_SERVICE_API_HOST }:${ process.env.REST_COUNTRY_SERVICE_API_PORT }`;


class RestCountryService {
    constructor() {
    }

    // Verify country
    async verify(jwt, countryName) {
        try {
            const response = await fetch(`${restCountryServiceApi}/api/v1/auth/restcountry/verify/${ encodeURIComponent(countryName) }`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${ jwt }`,
                    'Content-Type': 'application/json',
                },
            });

            const responseStatus = response.status;
            const responseBody = await response.json();

            if (responseStatus === 404 && responseBody.message === RestCountryError.COUNTRY_NOT_FOUND) {
                throw new Error(RestCountryError.INVALID_COUNTRY_NAME);
            }

            if (responseStatus !== 200) {
                throw new Error(CommonErrors.INTERNAL_SERVER_ERROR);
            }

            return responseBody;

        } catch (error) {
            throw error;
        }
    }


}

export default RestCountryService;