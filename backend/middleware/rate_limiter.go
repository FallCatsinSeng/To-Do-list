package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// RateLimiter stores request counts per IP
type RateLimiter struct {
	visitors map[string]*Visitor
	mu       sync.RWMutex
	rate     int
	window   time.Duration
}

// Visitor represents a client's request history
type Visitor struct {
	requests  int
	lastReset time.Time
	mu        sync.Mutex
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(rate int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*Visitor),
		rate:     rate,
		window:   window,
	}

	// Cleanup old visitors every minute
	go rl.cleanupVisitors()

	return rl
}

// cleanupVisitors removes stale visitor records
func (rl *RateLimiter) cleanupVisitors() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		for ip, v := range rl.visitors {
			v.mu.Lock()
			if time.Since(v.lastReset) > rl.window*2 {
				delete(rl.visitors, ip)
			}
			v.mu.Unlock()
		}
		rl.mu.Unlock()
	}
}

// getVisitor returns or creates a visitor for an IP
func (rl *RateLimiter) getVisitor(ip string) *Visitor {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	v, exists := rl.visitors[ip]
	if !exists {
		v = &Visitor{
			requests:  0,
			lastReset: time.Now(),
		}
		rl.visitors[ip] = v
	}

	return v
}

// Allow checks if a request should be allowed
func (rl *RateLimiter) Allow(ip string) bool {
	visitor := rl.getVisitor(ip)

	visitor.mu.Lock()
	defer visitor.mu.Unlock()

	// Reset counter if window has passed
	if time.Since(visitor.lastReset) > rl.window {
		visitor.requests = 0
		visitor.lastReset = time.Now()
	}

	// Check if limit exceeded
	if visitor.requests >= rl.rate {
		return false
	}

	visitor.requests++
	return true
}

// RateLimitMiddleware creates a rate limiting middleware
func RateLimitMiddleware(rate int, window time.Duration) gin.HandlerFunc {
	limiter := NewRateLimiter(rate, window)

	return func(c *gin.Context) {
		ip := c.ClientIP()

		if !limiter.Allow(ip) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "Too many requests",
				"message": "Rate limit exceeded. Please try again later.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// LoginRateLimiter creates a rate limiter specifically for login attempts
// Default: 5 requests per minute
func LoginRateLimiter() gin.HandlerFunc {
	return RateLimitMiddleware(5, time.Minute)
}

// RegisterRateLimiter creates a rate limiter specifically for registration
// Default: 1 registration per minute to prevent spam
func RegisterRateLimiter() gin.HandlerFunc {
	return RateLimitMiddleware(1, time.Minute)
}
