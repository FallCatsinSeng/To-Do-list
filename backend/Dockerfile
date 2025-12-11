# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./

# Generate go.sum if needed and download dependencies
RUN go mod tidy && go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

# Use /app as working directory to match volume mount
WORKDIR /app

# Copy the binary from builder - use absolute path
COPY --from=builder /app/main /app/main

# Create uploads directory
RUN mkdir -p /app/uploads/gallery /app/uploads/profiles

# Expose port
EXPOSE 8080

# Run the application with absolute path
CMD ["/app/main"]

