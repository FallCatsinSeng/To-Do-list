-- Database Improvements Migration
-- Adds composite indexes and fixes siswa table constraints

-- Add composite indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gallery_uploader_deleted 
    ON gallery(uploader, deleted_at);

CREATE INDEX IF NOT EXISTS idx_todos_user_created 
    ON todo(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_user_created 
    ON comments(user_id, created_at DESC);

-- Fix siswa table - make critical fields NOT NULL and NIM unique
ALTER TABLE siswa 
    MODIFY COLUMN nama VARCHAR(100) NOT NULL,
    MODIFY COLUMN nim VARCHAR(50) NOT NULL;

-- Add unique constraint on NIM if not exists
ALTER TABLE siswa 
    ADD UNIQUE INDEX idx_nim_unique (nim);
