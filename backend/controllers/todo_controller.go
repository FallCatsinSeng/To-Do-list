package controllers

import (
	"bulan2-backend/config"
	"bulan2-backend/models"
	"bulan2-backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetTodos returns user's todos or all todos (for admin)
func GetTodos(c *gin.Context) {
	role, _ := c.Get("role")
	userID, _ := c.Get("user_id")

	// Pagination params
	page := utils.ParseInt(c.DefaultQuery("page", "1"), 1)
	limit := utils.ParseInt(c.DefaultQuery("limit", "20"), 20)
	if limit > 100 {
		limit = 100
	}
	offset := (page - 1) * limit

	var todos []models.Todo
	var total int64
	
	query := config.DB.Model(&models.Todo{}).Preload("User")

	// Regular users only see their own todos
	if role == "user" {
		query = query.Where("user_id = ?", userID)
	}

	// Count total
	query.Count(&total)

	// Get paginated results
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&todos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch todos"})
		return
	}

	totalPages := (int(total) + limit - 1) / limit

	c.JSON(http.StatusOK, gin.H{
		"data": todos,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

// CreateTodo creates a new todo
func CreateTodo(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var input struct {
		Title string `json:"title" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	todo := models.Todo{
		UserID: userID.(uint),
		Title:  input.Title,
		Status: "pending",
	}

	if err := config.DB.Create(&todo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create todo"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Todo created successfully",
		"data":    todo,
	})
}

// ToggleTodoStatus toggles todo status between pending and done
func ToggleTodoStatus(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")

	var todo models.Todo
	if err := config.DB.First(&todo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Todo not found"})
		return
	}

	// Check ownership
	if todo.UserID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	// Toggle status
	if todo.Status == "pending" {
		todo.Status = "done"
	} else {
		todo.Status = "pending"
	}

	if err := config.DB.Save(&todo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update todo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Todo status updated successfully",
		"data":    todo,
	})
}

// DeleteTodo deletes a todo
func DeleteTodo(c *gin.Context) {
	id := c.Param("id")
	role, _ := c.Get("role")
	userID, _ := c.Get("user_id")

	var todo models.Todo
	if err := config.DB.First(&todo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Todo not found"})
		return
	}

	// Check ownership (admin can delete any todo)
	if role == "user" && todo.UserID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	if err := config.DB.Delete(&todo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete todo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Todo deleted successfully"})
}
