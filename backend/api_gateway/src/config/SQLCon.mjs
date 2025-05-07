import mysql2 from "mysql2/promise";
import dotenv from "dotenv";
import { LogTypes } from "../utils/enums/LogTypes.mjs";
import { log } from "../utils/ConsoleLog.mjs";


let pool;
dotenv.config();
const MYSQL_DB_HOST = process.env.MYSQL_DB_HOST || "172.20.5.10";
const MYSQL_DB_USER = process.env.MYSQL_DB_USER || "root";
const MYSQL_DB_PASSWORD = process.env.MYSQL_DB_PASSWORD || "12345";
const DB_NAME = process.env.DB_NAME || "user_database";


async function initializeDatabase() {
    try {
        // Create connection pool
        pool = mysql2.createPool({
            host: MYSQL_DB_HOST,
            user: MYSQL_DB_USER,
            password: MYSQL_DB_PASSWORD,
            database: DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
        log(LogTypes.INFO, "MySQL Connection Pool Initialized");

        return pool;
    } catch (error) {
        log(LogTypes.ERROR, `Database Initialization Failed ${ error }`);
        process.exit(1);
    }
}

// Export a function that ensures `pool` is ready
export async function getDatabasePool() {
    if (!pool) {
        await initializeDatabase();
    }
    return pool;
}