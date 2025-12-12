-- Bulan2 Database Schema
-- MySQL 8.0

-- Users table (enhanced)
-- Using BIGINT UNSIGNED to match GORM model definitions
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'guru') DEFAULT 'user',
    foto VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mahasiswa-Guru relationship table
CREATE TABLE IF NOT EXISTS mahasiswa_guru (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mahasiswa_id BIGINT UNSIGNED NOT NULL,
    guru_id BIGINT UNSIGNED NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_mahasiswa (mahasiswa_id),
    INDEX idx_guru (guru_id),
    INDEX idx_status (status),
    UNIQUE KEY unique_mahasiswa_guru_approved (mahasiswa_id, guru_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    guru_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    INDEX idx_guru (guru_id),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assignment submissions table
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    assignment_id BIGINT UNSIGNED NOT NULL,
    mahasiswa_id BIGINT UNSIGNED NOT NULL,
    status ENUM('pending', 'submitted', 'graded') DEFAULT 'pending',
    submitted_at DATETIME,
    grade DECIMAL(5,2),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_assignment (assignment_id),
    INDEX idx_mahasiswa (mahasiswa_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Students table (enhanced)
CREATE TABLE IF NOT EXISTS siswa (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100),
    nim VARCHAR(50),
    jurusan VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    INDEX idx_nama (nama),
    INDEX idx_nim (nim),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gallery table (enhanced)
-- Note: No FK constraint - handled by GORM with DisableForeignKeyConstraintWhenMigrating
CREATE TABLE IF NOT EXISTS gallery (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    uploader BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    INDEX idx_uploader (uploader),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Todo table (enhanced)
-- Note: No FK constraint - handled by application layer
CREATE TABLE IF NOT EXISTS todo (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    status ENUM('pending', 'done') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    INDEX idx_user_status (user_id, status),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comments table (enhanced)
-- Note: No FK constraint - handled by application layer
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user
-- Password: admin123 (bcrypt hashed)
INSERT INTO users (nama, email, password, role) VALUES
('Administrator', 'admin@example.com', '$2a$10$YourBcryptHashHere', 'admin')
ON DUPLICATE KEY UPDATE email=email;
