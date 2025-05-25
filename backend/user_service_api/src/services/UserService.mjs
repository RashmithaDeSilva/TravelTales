import UserDAO from '../DAOs/UserDAO.mjs';
import UserModel from '../models/UserModel.mjs';
import { generateHash, verify } from '../utils/security/Hash.mjs';
import dotenv from 'dotenv';
import HashErrors from '../utils/errors/HashErrors.mjs';


dotenv.config();


class UserService {
    constructor() {
        this.userDAO = new UserDAO();
    }

    // Is id exists
    async isIdExists(userId) {
        try {
            const result = await this.userDAO.isIdExists(userId);
            return result;
            
        } catch (error) {
            throw error;
        }
    }

    // Update user
    async updateUser(data) {
        try {
            // Create user model
            const user = new UserModel(
                data.user_name,
                data.first_name,
                data.surname,
                data.email,
                data.contact_number,
                null,
                data.id
            );

            // Update user in database
            await this.userDAO.update(user);

        } catch (error) {
            throw error;
        }
    }

    // Change password
    async changePassword(data) {
        try {
            // Validate old password
            const passwordHash = await this.userDAO.getHashPasswordById(data.id);
            const passwordVerify = await verify(passwordHash, data.old_password);
            if (!passwordVerify) throw new Error(HashErrors.INVALID_OLD_PASSWORD);
            const hashPassword = await generateHash(data.password);
            await this.userDAO.changePassword(data.id, hashPassword);

        } catch (error) {
            throw error;
        }
    }

    // Get user by user id
    async getUserById(id) {
        try {
            const user = await this.userDAO.getUserById(id);
            return user;
            
        } catch (error) {
            throw error;
        }
    }

    // Get user using user name
    async getUserByUserName(userName) {
        try {
            const user = await this.userDAO.getUserByUserName(userName);
            return user;
            
        } catch (error) {
            throw error;
        }
    }

    // Get users using ids
    async getUserByUserIds(ids) {
        try {
            const result = await this.userDAO.getUserByUserIds(ids);
            return result;
            
        } catch (error) {
            throw error;
        }
    }
}

export default UserService;