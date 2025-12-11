# Bulan2 Modern Stack

Modern rewrite of PHP application using Go + Next.js + Docker

## Tech Stack

- **Backend:** Go 1.21 + Gin + GORM
- **Frontend:** Next.js 14 + TypeScript
- **Database:** MySQL 8.0
- **Cache:** Redis 7
- **Infrastructure:** Docker + Docker Compose

## Features

- ✅ JWT Authentication
- ✅ Role-based Access Control (Admin/User)
- ✅ Student Management (CRUD)
- ✅ Photo Gallery with Upload
- ✅ Todo List Management
- ✅ Comments System
- ✅ Redis Caching
- ✅ Secure File Upload

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Git

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd bulan2-modern
```

2. Copy environment file
```bash
cp .env.example .env
```

3. Edit `.env` and change sensitive values (especially JWT_SECRET)

4. Start all services
```bash
docker-compose up -d
```

5. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- MySQL: localhost:3306
- Redis: localhost:6379

### Default Admin Credentials

(Will be created by seed script)
- Email: admin@example.com
- Password: admin123

## Development

### Backend (Go)

```bash
cd backend
go run main.go
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

## Production Deployment

1. Update `.env` for production
2. Run with production profile:
```bash
docker-compose --profile production up -d
```

## API Documentation

See [API.md](./API.md) for complete API documentation

## License

MIT
