package utils

import (
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

var allowedExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".gif":  true,
}

var allowedMimeTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/gif":  true,
}

const maxFileSize = 5 * 1024 * 1024 // 5MB

// ValidateFileMagicBytes checks the actual file type by reading magic bytes
func ValidateFileMagicBytes(file *multipart.FileHeader) error {
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	// Read first 512 bytes to detect content type
	buffer := make([]byte, 512)
	_, err = src.Read(buffer)
	if err != nil && err != io.EOF {
		return err
	}

	// Detect MIME type from magic bytes
	contentType := http.DetectContentType(buffer)
	
	// Check if detected MIME type is allowed
	if !allowedMimeTypes[contentType] {
		return errors.New("invalid file type detected. File appears to be: " + contentType)
	}

	return nil
}

// UploadFile handles file upload with validation
func UploadFile(file *multipart.FileHeader, uploadDir string) (string, error) {
	// Check file size
	if file.Size > maxFileSize {
		return "", errors.New("file size exceeds 5MB limit")
	}

	// Check extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !allowedExtensions[ext] {
		return "", errors.New("invalid file type. Only JPG, PNG, and GIF allowed")
	}

	// Validate actual file type using magic bytes
	if err := ValidateFileMagicBytes(file); err != nil {
		return "", err
	}

	// Generate unique filename
	timestamp := time.Now().Unix()
	filename := GenerateFilename(file.Filename, timestamp)

	// Create upload directory if not exists
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		return "", err
	}

	// Open uploaded file
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	// Create destination file
	dst, err := os.Create(filepath.Join(uploadDir, filename))
	if err != nil {
		return "", err
	}
	defer dst.Close()

	// Copy file
	if _, err := io.Copy(dst, src); err != nil {
		return "", err
	}

	return filename, nil
}

// GenerateFilename generates a unique filename
func GenerateFilename(original string, timestamp int64) string {
	ext := filepath.Ext(original)
	return RandString(16) + "_" + string(rune(timestamp)) + ext
}

// DeleteFile deletes a file from disk
func DeleteFile(filePath string) error {
	return os.Remove(filePath)
}
