import { getDatabasePool } from '../config/SQLCon.mjs';
import UserModel from '../models/UserModel.mjs';
import DatabaseErrors from '../utils/errors/DatabaseErrors.mjs';
import UserErrors from '../utils/errors/UserError.mjs';
import dotenv from 'dotenv';

dotenv.config();
const USER_NAME_SEARCH_LIMIT = process.env.USER_NAME_SEARCH_LIMIT || 5;
const pool = await getDatabasePool();

class UserDAO {
    constructor () {
    }

    // Is id exists
    async isIdExists(userId) {
        try {
            const [result] = await pool.query(`
                SELECT EXISTS(
                    SELECT 1 FROM users WHERE id = ?
                ) AS user_exists;
            `, [userId]);
            if (result[0].user_exists !== 1) {
                throw new Error(UserErrors.INVALID_USER_ID);
            }
            return true;
            
        } catch (error) {
            throw error;
        }
    }
    
    // Get user ID using email
    async getUserIdByEmail(email) {
        try {
            const [row] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
            if (row.length > 0) {
                return row[0].id;
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    // Get password hash
    async getHashPasswordById(id) {
        try {
            // Check id is exist
            if (!await this.isIdExists(id)) throw new Error(DatabaseErrors.USER_NOT_FOUND);

            const [row] = await pool.query(`SELECT password_hash FROM users WHERE id = ?`, [id]);
            return row[0].password_hash;

        } catch (error) {
            throw error;
        }
    }

    // Get user using id
    async getUserById(id) {
        try {
            const [row] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
            if (row.length === 0) {
                throw new Error(DatabaseErrors.USER_NOT_FOUND);
            }
            return UserModel.getResponseUserModel(
                row[0].user_name,
                row[0].first_name, 
                row[0].surname,
                row[0].email,
                row[0].contact_number,
                row[0].id,
            );

        } catch (error) {
            throw error;
        }
    }

    // Get user using user name
    async getUserByUserName(userName) {
        try {
            const [rows] = await pool.query(`SELECT * FROM users WHERE user_name LIKE ? LIMIT ${ USER_NAME_SEARCH_LIMIT }`, 
                [`${ userName }%`]);
            if (rows.length === 0) {
                throw new Error(DatabaseErrors.INVALID_USER_NAME);
            }
            
            return rows.map(user =>
                UserModel.getResponseUserModelPublic(
                    user.user_name,
                    user.email,
                    user.id
                )
            );

        } catch (error) {
            throw error;
        }
    }

    // Get users using ids
    async getUserByUserIds(ids) {
        try {
            if (!ids || !ids.length) {
                return { users: [], invalideIds: [] };
            }

            // Use placeholders for each id in the query to prevent SQL injection
            const placeholders = ids.map(() => '?').join(',');
            const [rows] = await pool.query(`SELECT id, user_name, email FROM users WHERE id IN (${ placeholders })`, ids);

            // Map returned users to your UserModel
            const users = rows.map(user =>
                UserModel.getResponseUserModelPublic(
                    user.user_name,
                    user.email,
                    user.id
                )
            );

            // Collect found user IDs
            const foundIds = rows.map(u => u.id);

            // Find IDs that are not found
            const invalideIds = ids.filter(id => !foundIds.includes(id));

            return {
                users,
                invalideIds
            };

        } catch (error) {
            throw error;
        }
    }


    // Update user
    async update(user) {
        try {
            // Check email is exist
            const id = await this.getUserIdByEmail(user.email);
            if (id !== null && id !== user.id) throw new Error(DatabaseErrors.EMAIL_ALREADY_EXISTS);
            
            await pool.query(`
                UPDATE users 
                SET user_name = ?, first_name = ?, surname = ?, email = ?, contact_number = ?
                WHERE id = ?
            `, [user.userName, user.firstName, user.surname, user.email, user.contactNumber, user.id]);

        } catch (error) {
            throw error;
        }
    }

    // Change password
    async changePassword(id, hashPassword) {
        try {
            await pool.query(`
                UPDATE users 
                SET password_hash = ?
                WHERE id = ?
            `, [hashPassword, id]);

        } catch (error) {
            throw error;
        }
    }
}

export default UserDAO;