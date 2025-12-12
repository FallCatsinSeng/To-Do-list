package controllers

import (
	"bulan2-backend/config"
	"bulan2-backend/models"
	"bulan2-backend/utils"
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

type RegisterRequest struct {
	Nama     string `json:"nama" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Register handles user registration
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if email already exists
	var existingUser models.User
	if err := config.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	// Create new user
	user := models.User{
		Nama:  req.Nama,
		Email: req.Email,
		Role:  "user",
	}

	// Hash password
	user.Password = req.Password
	if err := user.HashPassword(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Save to database
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Registration successful",
		"user": gin.H{
			"id":    user.ID,
			"nama":  user.Nama,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

// Login handles user authentication
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user by email
	var user models.User
	if err := config.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Check password
	if !user.CheckPassword(req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   token,
		"user": gin.H{
			"id":    user.ID,
			"nama":  user.Nama,
			"email": user.Email,
			"role":  user.Role,
			"foto":  user.Foto,
		},
	})
}

// GetCurrentUser returns the authenticated user's information
func GetCurrentUser(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":    user.ID,
			"nama":  user.Nama,
			"email": user.Email,
			"role":  user.Role,
			"foto":  user.Foto,
		},
	})
}

// UploadProfilePicture handles profile picture upload
func UploadProfilePicture(c *gin.Context) {
	userID, _ := c.Get("user_id")

	// Get uploaded file
	file, err := c.FormFile("foto")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	// Upload file
	filename, err := utils.UploadFile(file, "./uploads/profiles")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update user record
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Delete old photo if exists
	if user.Foto != "" {
		oldPath := filepath.Join("./uploads/profiles", user.Foto)
		utils.DeleteFile(oldPath)
	}

	// Update photo
	user.Foto = filename
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile picture"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile picture updated successfully",
		"foto":    filename,
	})
}

// GoogleLogin initiates the OAuth flow
func GoogleLogin(c *gin.Context) {
	// Generate state
	state := generateStateOauthCookie()
	c.SetCookie("oauthstate", state, 3600, "/", "", false, true)

	// Redirect to Google
	url := config.GoogleOauthConfig.AuthCodeURL(state)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

// GoogleCallback handles the OAuth callback
func GoogleCallback(c *gin.Context) {
	// Verify state
	state, _ := c.Cookie("oauthstate")
	if state != c.Query("state") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid state parameter"})
		return
	}

	// Exchange code for token
	code := c.Query("code")
	token, err := config.GoogleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		// return detailed error for debugging (remove or sanitize in production)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to exchange token", "detail": err.Error()})
		return
	}

	// Get user info from Google
	resp, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info"})
		return
	}
	defer resp.Body.Close()

	data, _ := io.ReadAll(resp.Body)
	var googleUser struct {
		Email   string `json:"email"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}
	json.Unmarshal(data, &googleUser)

	// Check if user exists
	var user models.User
	err = config.DB.Where("email = ?", googleUser.Email).First(&user).Error
	
	if err != nil {
		// Create new user
		user = models.User{
			Nama:  googleUser.Name,
			Email: googleUser.Email,
			Role:  "user",
			Foto:  googleUser.Picture,
		}
		
		// Generate random password for OAuth users
		randomPassword := generateRandomPassword()
		user.Password = randomPassword
		if err := user.HashPassword(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
		
		if err := config.DB.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
	}

	// Generate JWT
	jwtToken, err := utils.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Redirect to frontend callback with token and user data
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}
	
	redirectURL := fmt.Sprintf("%s/auth/google/callback?token=%s&userId=%d&email=%s&nama=%s&role=%s&foto=%s",
		frontendURL,
		jwtToken,
		user.ID,
		url.QueryEscape(user.Email),
		url.QueryEscape(user.Nama),
		user.Role,
		url.QueryEscape(user.Foto),
	)
	
	c.Redirect(http.StatusTemporaryRedirect, redirectURL)
}

// generateStateOauthCookie generates a random state string
func generateStateOauthCookie() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)
}

// generateRandomPassword generates a random password for OAuth users
func generateRandomPassword() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)
}
