CREATE DATABASE IF NOT EXISTS coursconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE coursconnect;
SET NAMES utf8mb4;

-- ============================================================
-- PHASE 1+2: EXISTING TABLES (kept for backward compatibility)
-- ============================================================

CREATE TABLE IF NOT EXISTS professeurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telephone VARCHAR(20),
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    bio TEXT,
    photo_url VARCHAR(500),
    tarif_horaire DECIMAL(7,2) NOT NULL,
    user_id BIGINT UNIQUE,
    experience_years INT,
    verified BOOLEAN DEFAULT FALSE,
    average_rating DECIMAL(4,2),
    total_reviews INT DEFAULT 0,
    actif BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS matieres (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS niveaux (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    ordre INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS professeur_matiere (
    professeur_id BIGINT NOT NULL,
    matiere_id BIGINT NOT NULL,
    PRIMARY KEY (professeur_id, matiere_id),
    FOREIGN KEY (professeur_id) REFERENCES professeurs(id) ON DELETE CASCADE,
    FOREIGN KEY (matiere_id) REFERENCES matieres(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS professeur_niveau (
    professeur_id BIGINT NOT NULL,
    niveau_id BIGINT NOT NULL,
    PRIMARY KEY (professeur_id, niveau_id),
    FOREIGN KEY (professeur_id) REFERENCES professeurs(id) ON DELETE CASCADE,
    FOREIGN KEY (niveau_id) REFERENCES niveaux(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- PHASE 2: AUTH TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
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
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- MVP: NEW TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS cities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    region VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS levels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    city_id BIGINT,
    profile_photo VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS professors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE,
    city_id BIGINT,
    profile_photo VARCHAR(500),
    bio TEXT,
    teaching_address VARCHAR(500),
    experience_years INT,
    verified BOOLEAN DEFAULT FALSE,
    average_rating DECIMAL(3,2),
    total_reviews INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS professor_subject (
    professor_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    PRIMARY KEY (professor_id, subject_id),
    FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS professor_level (
    professor_id BIGINT NOT NULL,
    level_id BIGINT NOT NULL,
    PRIMARY KEY (professor_id, level_id),
    FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE,
    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS offers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    professor_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(7,2) NOT NULL,
    duration_minutes INT NOT NULL,
    course_type ENUM('INDIVIDUAL', 'GROUP', 'ONLINE') NOT NULL,
    location_type ENUM('STUDENT_HOME', 'PROFESSOR_HOME', 'ONLINE', 'OTHER') NOT NULL,
    meeting_platform VARCHAR(50) NULL,
    meeting_link VARCHAR(500) NULL,
    meeting_instructions TEXT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS availabilities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    professor_id BIGINT NOT NULL,
    day_of_week ENUM('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    professor_id BIGINT NOT NULL,
    offer_id BIGINT NOT NULL,
    scheduled_at DATETIME NOT NULL,
    status ENUM('PENDING','ACCEPTED','REJECTED','CANCELLED','COMPLETED') DEFAULT 'PENDING',
    student_message TEXT,
    professor_response TEXT,
    negotiated_price DECIMAL(7,2) NULL,
    payment_method VARCHAR(20) DEFAULT 'CASH',
    payment_status VARCHAR(20) DEFAULT 'UNPAID',
    amount DECIMAL(8,2) NULL,
    currency VARCHAR(3) DEFAULT 'DH',
    payment_reference VARCHAR(100) NULL,
    paid_at DATETIME NULL,
    meeting_location VARCHAR(500) NULL,
    meeting_link VARCHAR(500) NULL,
    meeting_platform VARCHAR(50) NULL,
    meeting_instructions TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    student_id BIGINT NOT NULL,
    professor_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS professor_favorites (
    student_id BIGINT NOT NULL,
    professor_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, professor_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    reference_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS price_proposals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    offer_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    professor_id BIGINT NOT NULL,
    initial_price DECIMAL(7,2) NOT NULL,
    proposed_price DECIMAL(7,2) NOT NULL,
    message TEXT,
    status ENUM('PENDING','ACCEPTED','REJECTED','CANCELLED') DEFAULT 'PENDING',
    booking_id BIGINT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME NULL,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- INDEXES
-- MySQL does not support "CREATE INDEX IF NOT EXISTS", so indexes
-- are created conditionally via a temporary helper procedure.
-- ============================================================

DROP PROCEDURE IF EXISTS coursconnect_create_index_if_missing;

DELIMITER $$
CREATE PROCEDURE coursconnect_create_index_if_missing(IN tbl_name VARCHAR(64), IN idx_name VARCHAR(64), IN idx_cols VARCHAR(255))
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics
                   WHERE table_schema = DATABASE() AND table_name = tbl_name AND index_name = idx_name) THEN
        SET @ddl = CONCAT('CREATE INDEX ', idx_name, ' ON ', tbl_name, ' (', idx_cols, ')');
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

CALL coursconnect_create_index_if_missing('users', 'idx_users_email', 'email');
CALL coursconnect_create_index_if_missing('users', 'idx_users_role', 'role');
CALL coursconnect_create_index_if_missing('user_sessions', 'idx_user_sessions_token', 'token');
CALL coursconnect_create_index_if_missing('user_sessions', 'idx_user_sessions_expires', 'expires_at');
CALL coursconnect_create_index_if_missing('students', 'idx_students_user', 'user_id');
CALL coursconnect_create_index_if_missing('professors', 'idx_professors_user', 'user_id');
CALL coursconnect_create_index_if_missing('professors', 'idx_professors_city', 'city_id');
CALL coursconnect_create_index_if_missing('professors', 'idx_professors_verified', 'verified');
CALL coursconnect_create_index_if_missing('professors', 'idx_professors_active', 'active');
CALL coursconnect_create_index_if_missing('professors', 'idx_professors_rating', 'average_rating');
CALL coursconnect_create_index_if_missing('offers', 'idx_offers_professor', 'professor_id');
CALL coursconnect_create_index_if_missing('offers', 'idx_offers_active', 'active');
CALL coursconnect_create_index_if_missing('offers', 'idx_offers_price', 'price');
CALL coursconnect_create_index_if_missing('offers', 'idx_offers_course_type', 'course_type');
CALL coursconnect_create_index_if_missing('availabilities', 'idx_availabilities_professor', 'professor_id');
CALL coursconnect_create_index_if_missing('availabilities', 'idx_availabilities_day', 'day_of_week');
CALL coursconnect_create_index_if_missing('bookings', 'idx_bookings_student', 'student_id');
CALL coursconnect_create_index_if_missing('bookings', 'idx_bookings_professor', 'professor_id');
CALL coursconnect_create_index_if_missing('bookings', 'idx_bookings_offer', 'offer_id');
CALL coursconnect_create_index_if_missing('bookings', 'idx_bookings_status', 'status');
CALL coursconnect_create_index_if_missing('bookings', 'idx_bookings_scheduled', 'scheduled_at');
CALL coursconnect_create_index_if_missing('reviews', 'idx_reviews_professor', 'professor_id');
CALL coursconnect_create_index_if_missing('reviews', 'idx_reviews_student', 'student_id');
CALL coursconnect_create_index_if_missing('reviews', 'idx_reviews_booking', 'booking_id');
CALL coursconnect_create_index_if_missing('notifications', 'idx_notifications_user', 'user_id');
CALL coursconnect_create_index_if_missing('notifications', 'idx_notifications_read', 'is_read');
CALL coursconnect_create_index_if_missing('professeurs', 'idx_professeurs_ville', 'ville');

DROP PROCEDURE coursconnect_create_index_if_missing;
