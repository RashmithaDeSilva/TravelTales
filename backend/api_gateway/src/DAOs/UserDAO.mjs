import { getDatabasePool } from '../config/SQLCon.mjs';
import UserModel from '../models/UserModel.mjs';
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

    // Get user using email
    async getUserByEmail(email) {
        try {
            // Check email is exist
            if (!await this.checkEmailIsExist(email)) throw new Error(DatabaseErrors.INVALID_EMAIL_ADDRESS);
            
            const [row] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
            return new UserModel(
                row[0].first_name, 
                row[0].surname,
                row[0].email,
                row[0].contact_number,
                row[0].password_hash,
                row[0].id,
                row[0].verify,
            );

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

    // Get user using id
    async getUserById(id) {
        try {
            const [row] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
            return row.length === 0 ? null : new UserModel(
                row[0].first_name, 
                row[0].surname,
                row[0].email,
                row[0].contact_number,
                row[0].password_hash,
                row[0].id,
                row[0].verify,
            );

        } catch (error) {
            throw error;
        }
    }

}

export default UserDAO;