package utils

import (
	"math/rand"
	"strconv"
	"time"
)

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

var seededRand = rand.New(rand.NewSource(time.Now().UnixNano()))

// RandString generates a random string of given length
func RandString(length int) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}

// ParseInt parses string to int with default fallback
func ParseInt(s string, defaultValue int) int {
	val, err := strconv.Atoi(s)
	if err != nil || val < 1 {
		return defaultValue
	}
	return val
}
