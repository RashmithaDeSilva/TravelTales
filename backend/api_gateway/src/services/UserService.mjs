import UserDAO from '../DAOs/UserDAO.mjs';
import UserModel from '../models/UserModel.mjs';
import { generateHash, verify } from '../utils/security/Hash.mjs';
import DatabaseErrors from '../utils/errors/DatabaseErrors.mjs';
import dotenv from 'dotenv';

dotenv.config();

class UserService {
    constructor() {
        this.userDAO = new UserDAO();
    }

    // Create user
    async createUser(data) {
        let userId;
        try {
            // Generate hash
            const hashPassword = await generateHash(data.password);
            
            // Create user model
            const user = UserModel.getRequestUserModel(
                data.user_name,
                data.first_name,
                data.surname,
                data.email,
                data.contact_number,
                hashPassword
            );

            // Save user in database
            userId = await this.userDAO.create(user);
            return userId;

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
}

export default UserService;