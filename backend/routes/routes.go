package routes

import (
	"bulan2-backend/controllers"
	"bulan2-backend/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all application routes
func SetupRoutes(r *gin.Engine) {
	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	api := r.Group("/api")
	{
		// Public routes (no auth required)
		auth := api.Group("/auth")
		{
			// Apply rate limiting to prevent spam registrations
			auth.POST("/register", middleware.RegisterRateLimiter(), controllers.Register)
			// Apply rate limiting to login to prevent brute force attacks
			auth.POST("/login", middleware.LoginRateLimiter(), controllers.Login)
			
			// Google OAuth
			auth.GET("/google/login", controllers.GoogleLogin)
			auth.GET("/google/callback", controllers.GoogleCallback)
		}

		// Protected routes (auth required)
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// Current user
			protected.GET("/auth/me", controllers.GetCurrentUser)
			protected.POST("/auth/upload-photo", controllers.UploadProfilePicture)

			// Gallery
			protected.GET("/gallery", controllers.GetGallery)
			protected.POST("/gallery/upload", controllers.UploadPhotos)
			protected.DELETE("/gallery/:id", controllers.DeletePhoto)

			// Todo
			protected.GET("/todos", controllers.GetTodos)
			protected.POST("/todos", controllers.CreateTodo)
			protected.PUT("/todos/:id/status", controllers.ToggleTodoStatus)
			protected.DELETE("/todos/:id", controllers.DeleteTodo)

			// Comments
			protected.GET("/comments", controllers.GetComments)
			protected.POST("/comments", controllers.CreateComment)
			protected.DELETE("/comments/:id", controllers.DeleteComment)

			// Admin only routes
			admin := protected.Group("")
			admin.Use(middleware.AdminOnly())
			{
				// Students management
				admin.GET("/students", controllers.GetStudents)
				admin.GET("/students/:id", controllers.GetStudent)
				admin.POST("/students", controllers.CreateStudent)
				admin.PUT("/students/:id", controllers.UpdateStudent)
				admin.DELETE("/students/:id", controllers.DeleteStudent)
				admin.GET("/students/export/csv", controllers.ExportStudentsCSV)
			}
		}
	}
}
