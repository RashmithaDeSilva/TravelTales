import fetch from 'node-fetch';
import dotenv from 'dotenv';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
import UserErrors from '../utils/errors/UserErrors.mjs';


dotenv.config();
const userServiceApi = `${ process.env.USER_SERVICE_API }/api/v1/auth/user`;


class UserService {
    constructor() {
    }

    async findUserByName(userName) {
        try {
            const response = await fetch(`${ userServiceApi }/find`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_name: userName }),
            });
            
            const responseStatus = response.status;
            const responseBody = await response.json();

            if (responseStatus === 400) {
                throw new Error(UserErrors.INVALID_USER_NAME);
            }

            if (responseStatus !== 200) {
                throw new Error(CommonErrors.INTERNAL_SERVER_ERROR);
            }

            return responseBody.data[0];

        } catch (error) {
            throw error;
        }
    }

    async findUserByIds(ids) {
        try {
            const response = await fetch(`${ userServiceApi }/find`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: ids }),
            });

            const responseStatus = response.status;
            const responseBody = await response.json();

            if (responseStatus === 400) {
                throw new Error(UserErrors.INVALID_USER_NAME);
            }

            if (responseStatus !== 200) {
                throw new Error(CommonErrors.INTERNAL_SERVER_ERROR);
            }

            return responseBody.data;

        } catch (error) {
            throw error;
        }
    }

}

export default UserService;