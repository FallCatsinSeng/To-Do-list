package middleware

import (
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// CORS middleware
func CORS() gin.HandlerFunc {
	config := cors.DefaultConfig()
	
	// Get allowed origins from environment variable
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		// Default to localhost for development
		config.AllowOrigins = []string{"http://localhost:3000", "http://localhost:80"}
	} else {
		// Split comma-separated origins
		config.AllowOrigins = strings.Split(allowedOrigins, ",")
	}
	
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.AllowCredentials = true
	config.ExposeHeaders = []string{"Content-Length"}

	return cors.New(config)
}
