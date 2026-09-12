USE coursconnect;

-- Phase 2: Authentication and User Management

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('STUDENT', 'PROFESSOR', 'ADMIN') NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    ville VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Extend professeurs table with Phase 2 fields
ALTER TABLE professeurs
    ADD COLUMN user_id BIGINT UNIQUE,
    ADD COLUMN experience_years INT,
    ADD COLUMN verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN average_rating DECIMAL(4,2),
    ADD COLUMN total_reviews INT DEFAULT 0;

ALTER TABLE professeurs
    ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE user_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_professeurs_user ON professeurs(user_id);

-- Insert admin user (password: admin123)
-- The password hash below is SHA-256 with salt: "admin123"
-- You can generate a proper hash by running the application
-- For now, we insert a placeholder that the app will need to regenerate
-- INSERT INTO users (first_name, last_name, email, password_hash, phone, role, enabled)
-- VALUES ('Admin', 'CoursConnect', 'admin@coursconnect.fr', 'CHANGE_THIS_HASH', '01 00 00 00 00', 'ADMIN', TRUE);
