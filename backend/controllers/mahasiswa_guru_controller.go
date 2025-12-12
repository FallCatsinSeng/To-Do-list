package controllers

import (
	"bulan2-backend/config"
	"bulan2-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// RequestGuru - Mahasiswa request guru
func RequestGuru(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	if role != "user" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya mahasiswa yang bisa request guru"})
		return
	}

	var request struct {
		GuruID uint `json:"guru_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if guru exists and has role 'guru'
	var guru models.User
	if err := config.DB.Where("id = ? AND role = ?", request.GuruID, "guru").First(&guru).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Guru tidak ditemukan"})
		return
	}

	// Check if already has approved guru
	var existingApproved models.MahasiswaGuru
	if err := config.DB.Where("mahasiswa_id = ? AND status = ?", userID, "approved").First(&existingApproved).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Anda sudah memiliki guru"})
		return
	}

	// Check if already has pending request to this guru
	var existingPending models.MahasiswaGuru
	if err := config.DB.Where("mahasiswa_id = ? AND guru_id = ? AND status = ?", userID, request.GuruID, "pending").First(&existingPending).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Request ke guru ini sudah ada"})
		return
	}

	// Create new request
	mahasiswaGuru := models.MahasiswaGuru{
		MahasiswaID: userID.(uint),
		GuruID:      request.GuruID,
		Status:      "pending",
	}

	if err := config.DB.Create(&mahasiswaGuru).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Request berhasil dikirim",
		"data":    mahasiswaGuru,
	})
}

// GetMyGuru - Mahasiswa get guru mereka (approved)
func GetMyGuru(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var mahasiswaGuru models.MahasiswaGuru
	if err := config.DB.Preload("Guru").Where("mahasiswa_id = ? AND status = ?", userID, "approved").First(&mahasiswaGuru).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Belum memiliki guru"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": mahasiswaGuru})
}

// GetMahasiswaGuruRequests - Guru lihat pending requests
func GetMahasiswaGuruRequests(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	if role != "guru" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya guru yang bisa akses endpoint ini"})
		return
	}

	var requests []models.MahasiswaGuru
	if err := config.DB.Preload("Mahasiswa").Where("guru_id = ? AND status = ?", userID, "pending").Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": requests})
}

// ApproveMahasiswaGuru - Guru approve request
func ApproveMahasiswaGuru(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	if role != "guru" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya guru yang bisa akses endpoint ini"})
		return
	}

	id := c.Param("id")
	requestID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var mahasiswaGuru models.MahasiswaGuru
	if err := config.DB.Where("id = ? AND guru_id = ? AND status = ?", requestID, userID, "pending").First(&mahasiswaGuru).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Request tidak ditemukan"})
		return
	}

	mahasiswaGuru.Status = "approved"
	if err := config.DB.Save(&mahasiswaGuru).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal approve request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Request berhasil di-approve",
		"data":    mahasiswaGuru,
	})
}

// RejectMahasiswaGuru - Guru reject request
func RejectMahasiswaGuru(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	if role != "guru" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya guru yang bisa akses endpoint ini"})
		return
	}

	id := c.Param("id")
	requestID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var mahasiswaGuru models.MahasiswaGuru
	if err := config.DB.Where("id = ? AND guru_id = ? AND status = ?", requestID, userID, "pending").First(&mahasiswaGuru).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Request tidak ditemukan"})
		return
	}

	mahasiswaGuru.Status = "rejected"
	if err := config.DB.Save(&mahasiswaGuru).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal reject request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Request berhasil di-reject",
		"data":    mahasiswaGuru,
	})
}

// GetGuruMahasiswa - Guru lihat list mahasiswa yang di-approve
func GetGuruMahasiswa(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	if role != "guru" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya guru yang bisa akses endpoint ini"})
		return
	}

	var mahasiswa []models.MahasiswaGuru
	if err := config.DB.Preload("Mahasiswa").Where("guru_id = ? AND status = ?", userID, "approved").Find(&mahasiswa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": mahasiswa})
}

// GetAllGuru - Mahasiswa get list semua guru
func GetAllGuru(c *gin.Context) {
	var gurus []models.User
	if err := config.DB.Where("role = ?", "guru").Find(&gurus).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": gurus})
}

