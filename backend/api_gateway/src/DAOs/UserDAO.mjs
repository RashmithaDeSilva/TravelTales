import { getDatabasePool } from '../config/SQLCon.mjs';
import DatabaseErrors from '../utils/errors/DatabaseErrors.mjs';
import dotenv from 'dotenv';

dotenv.config();
const pool = await getDatabasePool();

class UserDAO {
    constructor () {
    }

    // Check email is exist
    async checkEmailIsExist(email) {
        try {
            const [row] = await pool.query("SELECT email FROM users WHERE email = ?", [email]);
            return row.length > 0;

        } catch (error) {
            throw error;
        }
    }

    // Check id is exist
    async checkIdIsExist(id) {
        try {
            const [row] = await pool.query("SELECT id FROM users WHERE id = ?", [id]);
            return row.length > 0;

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

    // Create user
    async create(user) {
        try {
            // Check email is exist
            if (await this.checkEmailIsExist(user.email)) throw new Error(DatabaseErrors.EMAIL_ALREADY_EXISTS);
            
            const [result] = await pool.query(`
                INSERT INTO users (
                    first_name, 
                    surname, 
                    email, 
                    contact_number, 
                    password_hash
                ) values (?, ?, ?, ?, ?)
            `, [user.firstName, user.surname, user.email, user.contactNumber, user.passwordHash]);

            const userId = process.env.ENV === "PROD" ? 
            result.insertId : await this.getUserIdByEmail(user.email);
            return userId;

        } catch (error) {
            throw error;
        }
    }
}

export default UserDAO;