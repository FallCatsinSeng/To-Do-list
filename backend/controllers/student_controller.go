package controllers

import (
	"bulan2-backend/config"
	"bulan2-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetStudents returns list of students with pagination and search
func GetStudents(c *gin.Context) {
	var students []models.Siswa
	
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	// Search
	search := c.Query("search")
	
	query := config.DB
	if search != "" {
		query = query.Where("nama LIKE ? OR nim LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Get total count
	var total int64
	query.Model(&models.Siswa{}).Count(&total)

	// Get paginated results
	if err := query.Offset(offset).Limit(limit).Order("id DESC").Find(&students).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch students"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       students,
		"total":      total,
		"page":       page,
		"limit":      limit,
		"totalPages": (int(total) + limit - 1) / limit,
	})
}

// GetStudent returns a single student by ID
func GetStudent(c *gin.Context) {
	id := c.Param("id")
	
	var student models.Siswa
	if err := config.DB.First(&student, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": student})
}

// CreateStudent creates a new student
func CreateStudent(c *gin.Context) {
	var student models.Siswa
	if err := c.ShouldBindJSON(&student); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&student).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create student"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Student created successfully",
		"data":    student,
	})
}

// UpdateStudent updates an existing student
func UpdateStudent(c *gin.Context) {
	id := c.Param("id")
	
	var student models.Siswa
	if err := config.DB.First(&student, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}

	if err := c.ShouldBindJSON(&student); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Save(&student).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update student"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Student updated successfully",
		"data":    student,
	})
}

// DeleteStudent deletes a student
func DeleteStudent(c *gin.Context) {
	id := c.Param("id")
	
	if err := config.DB.Delete(&models.Siswa{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete student"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Student deleted successfully"})
}

// ExportStudentsCSV exports students to CSV
func ExportStudentsCSV(c *gin.Context) {
	var students []models.Siswa
	if err := config.DB.Find(&students).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch students"})
		return
	}

	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=students.csv")

	c.String(http.StatusOK, "ID,NIM,Nama,Jurusan\n")
	for _, s := range students {
		c.String(http.StatusOK, "%d,%s,%s,%s\n", s.ID, s.NIM, s.Nama, s.Jurusan)
	}
}
