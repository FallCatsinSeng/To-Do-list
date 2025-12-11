package controllers

import (
	"bulan2-backend/config"
	"bulan2-backend/models"
	"bulan2-backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetComments returns all comments
func GetComments(c *gin.Context) {
	// Pagination params
	page := utils.ParseInt(c.DefaultQuery("page", "1"), 1)
	limit := utils.ParseInt(c.DefaultQuery("limit", "20"), 20)
	if limit > 100 {
		limit = 100
	}
	offset := (page - 1) * limit

	var comments []models.Comment
	var total int64
	
	query := config.DB.Model(&models.Comment{}).Preload("User")
	query.Count(&total)

	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
		return
	}

	totalPages := (int(total) + limit - 1) / limit

	c.JSON(http.StatusOK, gin.H{
		"data": comments,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

// CreateComment creates a new comment
func CreateComment(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var input struct {
		Comment string `json:"comment" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	comment := models.Comment{
		UserID:  userID.(uint),
		Comment: input.Comment,
	}

	if err := config.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create comment"})
		return
	}

	// Reload with user data
	config.DB.Preload("User").First(&comment, comment.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Comment created successfully",
		"data":    comment,
	})
}

// DeleteComment deletes a comment
func DeleteComment(c *gin.Context) {
	id := c.Param("id")
	role, _ := c.Get("role")
	userID, _ := c.Get("user_id")

	var comment models.Comment
	if err := config.DB.First(&comment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
		return
	}

	// Check ownership (admin can delete any comment)
	if role == "user" && comment.UserID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	if err := config.DB.Delete(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete comment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Comment deleted successfully"})
}
