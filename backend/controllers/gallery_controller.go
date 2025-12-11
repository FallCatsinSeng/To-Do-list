package controllers

import (
	"bulan2-backend/config"
	"bulan2-backend/models"
	"bulan2-backend/utils"
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

// GetGallery returns gallery photos (filtered by user role)
func GetGallery(c *gin.Context) {
	role, _ := c.Get("role")
	userID, _ := c.Get("user_id")

	// Pagination params
	page := utils.ParseInt(c.DefaultQuery("page", "1"), 1)
	limit := utils.ParseInt(c.DefaultQuery("limit", "20"), 20)
	
	// Limit max page size to prevent abuse
	if limit > 100 {
		limit = 100
	}
	
	offset := (page - 1) * limit

	var photos []models.Gallery
	var total int64
	
	query := config.DB.Model(&models.Gallery{})

	// Users only see their own photos
	if role == "user" {
		query = query.Where("uploader = ?", userID)
	}

	// Get total count
	query.Count(&total)

	// Get paginated results
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&photos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch gallery"})
		return
	}

	totalPages := (int(total) + limit - 1) / limit

	c.JSON(http.StatusOK, gin.H{
		"data": photos,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

// UploadPhotos handles multiple photo uploads
func UploadPhotos(c *gin.Context) {
	userID, _ := c.Get("user_id")

	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	files := form.File["photos"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No files uploaded"})
		return
	}

	var uploadedFiles []string
	uploadDir := "./uploads/gallery"

	for _, file := range files {
		filename, err := utils.UploadFile(file, uploadDir)
		if err != nil {
			// Rollback: delete already uploaded files
			for _, f := range uploadedFiles {
				utils.DeleteFile(filepath.Join(uploadDir, f))
			}
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Save to database
		photo := models.Gallery{
			Filename: filename,
			Uploader: userID.(uint),
		}

		if err := config.DB.Create(&photo).Error; err != nil {
			// Rollback
			utils.DeleteFile(filepath.Join(uploadDir, filename))
			for _, f := range uploadedFiles {
				utils.DeleteFile(filepath.Join(uploadDir, f))
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save photo"})
			return
		}

		uploadedFiles = append(uploadedFiles, filename)
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Photos uploaded successfully",
		"count":   len(uploadedFiles),
	})
}

// DeletePhoto deletes a photo
func DeletePhoto(c *gin.Context) {
	id := c.Param("id")
	role, _ := c.Get("role")
	userID, _ := c.Get("user_id")

	var photo models.Gallery
	if err := config.DB.First(&photo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Photo not found"})
		return
	}

	// Check ownership (users can only delete their own photos)
	if role == "user" && photo.Uploader != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	// Delete file from disk
	filePath := filepath.Join("./uploads/gallery", photo.Filename)
	utils.DeleteFile(filePath)

	// Delete from database
	if err := config.DB.Delete(&photo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete photo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Photo deleted successfully"})
}
