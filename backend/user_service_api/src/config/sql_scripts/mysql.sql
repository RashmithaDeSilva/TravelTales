-- Create database
CREATE DATABASE IF NOT EXISTS user_database;

-- Use database that create
USE user_database;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    email_verify BOOLEAN DEFAULT FALSE,
    contact_number VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
    follower_id INT NOT NULL,
    followed_id INT NOT NULL,
    followed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followed_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (followed_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -- Insert dummy users if they don't exist
-- INSERT INTO users (id, user_name, first_name, surname, email, email_verify, contact_number, password_hash)
-- SELECT 
--     1, 'user_1', 'Tom', 'Smith', 'tom@example.com', false, '+94761234567', 
--     '$argon2id$v=19$m=65536,t=3,p=1$4Z0ePixF6hbnfppLSoqlYw$5iLt1QIXlARhJc2mSwXB5yETHH+ZsKslfB03XJpntCg' -- password12345
-- WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 1);

-- INSERT INTO users (id, user_name, first_name, surname, email, email_verify, contact_number, password_hash)
-- SELECT 
--     2, 'user_2', 'Alice', 'Johnson', 'alice@example.com', false, '+94761234568', 
--     '$argon2id$v=19$m=65536,t=3,p=1$5X9nGtN35zEV7MNOBqaE3w$wTkOMIwi3H3gxsRU0eDd5IZl4OdyBdd88x2hFzG2FAY'
-- WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 2);

-- INSERT INTO users (id, user_name, first_name, surname, email, email_verify, contact_number, password_hash)
-- SELECT 
--     3, 'user_3', 'Bob', 'Davis', 'bob@example.com', false, '+94761234569', 
--     '$argon2id$v=19$m=65536,t=3,p=1$8jzKTcFuaF3vPygVGhyn9g$zp2NcezXBHkk2zbhNPPcsZtVLsA3PszkU2q9BcxFuCk'
-- WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 3);

-- -- Insert follow relationships
-- -- User 1 follows User 2
-- INSERT INTO follows (follower_id, followed_id)
-- SELECT 1, 2
-- WHERE NOT EXISTS (SELECT 1 FROM follows WHERE follower_id = 1 AND followed_id = 2);

-- -- User 1 follows User 3
-- INSERT INTO follows (follower_id, followed_id)
-- SELECT 1, 3
-- WHERE NOT EXISTS (SELECT 1 FROM follows WHERE follower_id = 1 AND followed_id = 3);

-- -- User 2 follows User 3
-- INSERT INTO follows (follower_id, followed_id)
-- SELECT 2, 3
-- WHERE NOT EXISTS (SELECT 1 FROM follows WHERE follower_id = 2 AND followed_id = 3);

-- -- User 3 follows User 2
-- INSERT INTO follows (follower_id, followed_id)
-- SELECT 3, 2
-- WHERE NOT EXISTS (SELECT 1 FROM follows WHERE follower_id = 3 AND followed_id = 2);