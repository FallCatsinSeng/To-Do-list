package controllers

import (
	"bulan2-backend/config"
	"bulan2-backend/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// CreateAssignment - Guru buat tugas baru
func CreateAssignment(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	if role != "guru" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya guru yang bisa membuat tugas"})
		return
	}

	var request struct {
		Title       string `json:"title" binding:"required"`
		Description string `json:"description"`
		DueDate     string `json:"due_date"` // Format: 2006-01-02T15:04:05Z
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	assignment := models.Assignment{
		GuruID:      userID.(uint),
		Title:       request.Title,
		Description: request.Description,
	}

	// Parse due date if provided
	if request.DueDate != "" {
		dueDate, err := time.Parse(time.RFC3339, request.DueDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid due_date format"})
			return
		}
		assignment.DueDate = &dueDate
	}

	if err := config.DB.Create(&assignment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat tugas"})
		return
	}

	// Auto-create submissions for all approved students
	var mahasiswaList []models.MahasiswaGuru
	config.DB.Where("guru_id = ? AND status = ?", userID, "approved").Find(&mahasiswaList)

	for _, mg := range mahasiswaList {
		submission := models.AssignmentSubmission{
			AssignmentID: assignment.ID,
			MahasiswaID:  mg.MahasiswaID,
			Status:       "pending",
		}
		config.DB.Create(&submission)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Tugas berhasil dibuat",
		"data":    assignment,
	})
}

// GetGuruAssignments - Guru lihat semua tugas yang dibuat
func GetGuruAssignments(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	if role != "guru" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya guru yang bisa akses endpoint ini"})
		return
	}

	var assignments []models.Assignment
	if err := config.DB.Where("guru_id = ?", userID).Order("created_at DESC").Find(&assignments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": assignments})
}

// GetAssignmentSubmissions - Guru lihat submissions untuk tugas tertentu
func GetAssignmentSubmissions(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	if role != "guru" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya guru yang bisa akses endpoint ini"})
		return
	}

	id := c.Param("id")
	assignmentID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	// Verify assignment belongs to this guru
	var assignment models.Assignment
	if err := config.DB.Where("id = ? AND guru_id = ?", assignmentID, userID).First(&assignment).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tugas tidak ditemukan"})
		return
	}

	var submissions []models.AssignmentSubmission
	if err := config.DB.Preload("Mahasiswa").Where("assignment_id = ?", assignmentID).Find(&submissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": submissions})
}

// GradeSubmission - Guru beri nilai untuk submission
func GradeSubmission(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	if role != "guru" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya guru yang bisa memberi nilai"})
		return
	}

	id := c.Param("id")
	submissionID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var request struct {
		Grade    float64 `json:"grade" binding:"required"`
		Feedback string  `json:"feedback"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get submission and verify it belongs to guru's assignment
	var submission models.AssignmentSubmission
	if err := config.DB.Preload("Assignment").Where("id = ?", submissionID).First(&submission).Error; err != nil{
		c.JSON(http.StatusNotFound, gin.H{"error": "Submission tidak ditemukan"})
		return
	}

	if submission.Assignment.GuruID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Tidak memiliki akses"})
		return
	}

	submission.Grade = &request.Grade
	submission.Feedback = request.Feedback
	submission.Status = "graded"

	if err := config.DB.Save(&submission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memberi nilai"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Nilai berhasil diberikan",
		"data":    submission,
	})
}

// DeleteAssignment - Guru hapus tugas
func DeleteAssignment(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	if role != "guru" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya guru yang bisa hapus tugas"})
		return
	}

	id := c.Param("id")
	assignmentID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var assignment models.Assignment
	if err := config.DB.Where("id = ? AND guru_id = ?", assignmentID, userID).First(&assignment).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tugas tidak ditemukan"})
		return
	}

	if err := config.DB.Delete(&assignment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus tugas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tugas berhasil dihapus"})
}

// GetMahasiswaAssignments - Mahasiswa lihat tugas dari guru mereka
func GetMahasiswaAssignments(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var submissions []models.AssignmentSubmission
	if err := config.DB.Preload("Assignment").Preload("Assignment.Guru").Where("mahasiswa_id = ?", userID).Order("created_at DESC").Find(&submissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": submissions})
}

// SubmitAssignment - Mahasiswa submit tugas
func SubmitAssignment(c *gin.Context) {
	userID, _ := c.Get("user_id")

	id := c.Param("id")
	submissionID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var submission models.AssignmentSubmission
	if err := config.DB.Where("id = ? AND mahasiswa_id = ?", submissionID, userID).First(&submission).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Submission tidak ditemukan"})
		return
	}

	now := time.Now()
	submission.SubmittedAt = &now
	submission.Status = "submitted"

	if err := config.DB.Save(&submission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal submit tugas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Tugas berhasil di-submit",
		"data":    submission,
	})
}

// GetAssignmentDetail - Mahasiswa lihat detail tugas
func GetAssignmentDetail(c *gin.Context) {
	userID, _ := c.Get("user_id")

	id := c.Param("id")
	submissionID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var submission models.AssignmentSubmission
	if err := config.DB.Preload("Assignment").Preload("Assignment.Guru").Where("id = ? AND mahasiswa_id = ?", submissionID, userID).First(&submission).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tugas tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": submission})
}

