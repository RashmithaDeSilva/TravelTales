import UserDAO from '../DAOs/UserDAO.mjs';
import UserModel from '../models/UserModel.mjs';
import { generateHash, verify } from '../utils/security/Hash.mjs';
import DatabaseErrors from '../utils/errors/DatabaseErrors.mjs';
import dotenv from 'dotenv';
import HashErrors from '../utils/errors/HashErrors.mjs';


dotenv.config();


class UserService {
    constructor() {
        this.userDAO = new UserDAO();
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

    // Authenticat user
    async authenticateUser(email, password) {
        try {
            const user = await this.userDAO.getUserByEmail(email);
            const passwordVerify = await verify(user.passwordHash, password);
            if (!passwordVerify) throw new Error(DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD);
            return user;
            
        } catch (error) {
            throw error;
        }
    }

    // Get user by user id
    async getUserById(id) {
        try {
            const user = await this.userDAO.getUserById(id);
            if (!user) throw new Error(DatabaseErrors.USER_NOT_FOUND);
            return user;
            
        } catch (error) {
            throw error;
        }
    }

    // Is id exists
    async isIdExists(userId) {
        try {
            return await this.userDAO.isIdExists(userId);
            
        } catch (error) {
            throw error;
        }
    }
}

export default UserService;