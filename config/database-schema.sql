CREATE DATABASE IF NOT EXISTS secure_crud;
USE secure_crud;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(30) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  password_reset_token VARCHAR(255),
  password_reset_expires DATETIME,
  password_changed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (email),
  INDEX (password_reset_token)
) ENGINE=InnoDB;

-- Optional: Create an initial admin user (password: Admin123!)
INSERT INTO users (username, email, password, role) 
VALUES (
  'admin', 
  'admin@example.com', 
  '$2a$12$m7bgG4g5OIRMxGkRSN1Z5OsLEqPO/Q1vlU8TjbZ2zQlw1QVM6IyVy', 
  'admin'
);