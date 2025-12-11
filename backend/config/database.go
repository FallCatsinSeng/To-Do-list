package config

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"bulan2-backend/models"
)

var (
	DB          *gorm.DB
	RedisClient *redis.Client
	ctx         = context.Background()
)

// InitDatabase initializes MySQL database connection
func InitDatabase() {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	if host == "" {
		host = "localhost"
	}
	if port == "" {
		port = "3306"
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		user, password, host, port, dbname)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		DisableForeignKeyConstraintWhenMigrating: true,
	})

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Configure connection pool for better performance
	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatalf("Failed to get database instance: %v", err)
	}

	// Connection pool settings
	sqlDB.SetMaxOpenConns(25)                  // Maximum open connections
	sqlDB.SetMaxIdleConns(10)                  // Maximum idle connections
	sqlDB.SetConnMaxLifetime(5 * time.Minute)  // Maximum connection lifetime

	log.Println("Database connection pool configured")

	// Auto migrate models (Gallery excluded - handled via raw SQL)
	err = DB.AutoMigrate(
		&models.User{},
		&models.Siswa{},
		&models.Todo{},
		&models.Comment{},
	)

	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Create gallery table manually to avoid GORM FK constraint issues
	gallerySQL := `
		CREATE TABLE IF NOT EXISTS gallery (
			id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			filename VARCHAR(255) NOT NULL,
			uploader BIGINT UNSIGNED NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			deleted_at DATETIME DEFAULT NULL,
			INDEX idx_gallery_uploader (uploader),
			INDEX idx_gallery_deleted_at (deleted_at)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`
	if err := DB.Exec(gallerySQL).Error; err != nil {
		log.Printf("Warning: Failed to create gallery table: %v", err)
	}
}

// CloseDatabase closes the database connection
func CloseDatabase() {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err == nil {
			sqlDB.Close()
		}
	}
}

// InitRedis initializes Redis connection
func InitRedis() {
	host := os.Getenv("REDIS_HOST")
	port := os.Getenv("REDIS_PORT")

	if host == "" {
		host = "localhost"
	}
	if port == "" {
		port = "6379"
	}

	RedisClient = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", host, port),
		Password: "", // no password by default
		DB:       0,
	})

	// Test connection
	_, err := RedisClient.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	log.Println("Redis connected successfully")
}

// CloseRedis closes Redis connection
func CloseRedis() {
	if RedisClient != nil {
		RedisClient.Close()
	}
}

// CacheSet sets a value in Redis with expiration
func CacheSet(key string, value interface{}, expiration time.Duration) error {
	return RedisClient.Set(ctx, key, value, expiration).Err()
}

// CacheGet gets a value from Redis
func CacheGet(key string) (string, error) {
	return RedisClient.Get(ctx, key).Result()
}

// CacheDel deletes a key from Redis
func CacheDel(key string) error {
	return RedisClient.Del(ctx, key).Err()
}

// CacheSetJSON caches a JSON-serializable object
func CacheSetJSON(key string, value interface{}, expiration time.Duration) error {
	json, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return CacheSet(key, json, expiration)
}

// CacheGetJSON retrieves and unmarshals a cached JSON object
func CacheGetJSON(key string, dest interface{}) error {
	val, err := CacheGet(key)
	if err != nil {
		return err
	}
	return json.Unmarshal([]byte(val), dest)
}
