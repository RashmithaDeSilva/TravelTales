-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS notification_database;

-- Select the database
USE notification_database;

-- Create the notifications table
CREATE TABLE IF NOT EXISTS notification_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- comes from user service
    title VARCHAR(255) NOT NULL,
    content VARCHAR(255) NOT NULL,
    info TEXT,
    is_check BOOLEAN NOT NULL DEFAULT FALSE, -- default false
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_id (user_id),
    INDEX idx_title (title),
    INDEX idx_content (content),
    INDEX idx_created_at (created_at)
);

-- Enable the event scheduler (only for session; not permanent)
-- SET GLOBAL event_scheduler = ON;

-- Create a scheduled event to delete notifications older than 7 days
CREATE EVENT IF NOT EXISTS delete_old_notifications
ON SCHEDULE EVERY 1 DAY
DO
  DELETE FROM notification_tbl
  WHERE created_at < NOW() - INTERVAL 7 DAY;

