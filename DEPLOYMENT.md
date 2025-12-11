# Production Deployment Guide

## 📋 Prerequisites

- [x] VPS dengan Docker dan Docker Compose installed
- [x] Nginx installed dan configured
- [x] Domain siap (`bulan2.yusufsoftware.my.id`)
- [x] SSL certificate (Let's Encrypt)
- [x] Google OAuth credentials

## 🚀 Step-by-Step Deployment

### 1. Setup Server

```bash
# Login ke VPS
ssh root@43.163.85.252

# Clone repository
cd /var/www
git clone <your-repo-url> bulan2-modern
cd bulan2-modern
```

### 2. Configure Environment

```bash
# Copy dan edit .env
cp .env.example .env
nano .env
```

**Penting untuk diubah di `.env`:**
```env
# Database passwords (generate strong passwords!)
MYSQL_ROOT_PASSWORD=<strong-password>
MYSQL_PASSWORD=<strong-password>

# JWT Secret (generate dengan: openssl rand -base64 64)
JWT_SECRET=<very-long-random-string>

# Production URLs
NEXT_PUBLIC_API_URL=https://bulan2.yusufsoftware.my.id
GOOGLE_REDIRECT_URL=https://bulan2.yusufsoftware.my.id/api/auth/google/callback
FRONTEND_URL=https://bulan2.yusufsoftware.my.id
ALLOWED_ORIGINS=https://bulan2.yusufsoftware.my.id

# Google OAuth (dari Google Cloud Console)
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
```

### 3. Configure Nginx

```bash
# Copy nginx config
sudo cp nginx/bulan2-modern.conf /etc/nginx/sites-available/

# Enable site
sudo ln -s /etc/nginx/sites-available/bulan2-modern.conf /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t
```

### 4. Setup SSL Certificate

```bash
# Install certbot (jika belum)
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d bulan2.yusufsoftware.my.id

# Test auto-renewal
sudo certbot renew --dry-run
```

### 5. Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit OAuth 2.0 Client
3. Add Authorized redirect URI:
   ```
   https://bulan2.yusufsoftware.my.id/api/auth/google/callback
   ```
4. Save changes

### 6. Deploy Application

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 7. Verify Deployment

```bash
# Check containers
docker-compose ps

# Check logs
docker-compose logs -f backend

# Test backend
curl https://bulan2.yusufsoftware.my.id/api/health

# Test frontend
curl -I https://bulan2.yusufsoftware.my.id
```

## 🔒 Security Checklist

- [x] Change all default passwords in `.env`
- [x] Generate strong JWT secret
- [x] SSL certificate installed
- [x] CORS configured correctly
- [x] Rate limiting enabled
- [x] Firewall configured (only allow ports 80, 443, 22)
- [x] `.env` file NOT committed to git
- [x] Docker containers auto-restart enabled

## 📊 Monitoring

### Check Application Status
```bash
# Container status
docker-compose ps

# Resource usage
docker stats

# Application logs
docker-compose logs -f
```

### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/bulan2-access.log

# Error logs
sudo tail -f /var/log/nginx/bulan2-error.log
```

### Database Backup
```bash
# Backup database
docker-compose exec mysql mysqldump -u root -p bulan2_prod_db > backup_$(date +%Y%m%d).sql

# Restore database
docker-compose exec -T mysql mysql -u root -p bulan2_prod_db < backup_20231211.sql
```

## 🔄 Update/Redeploy

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
./deploy.sh
```

## 🆘 Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Restart containers
docker-compose restart
```

### Database connection error
```bash
# Check MySQL container
docker-compose logs mysql

# Verify credentials in .env
docker-compose exec backend env | grep DB_
```

### OAuth not working
1. Verify `GOOGLE_REDIRECT_URL` matches Google Cloud Console
2. Check `ALLOWED_ORIGINS` in `.env`
3. Clear browser cookies and try again

### Nginx errors
```bash
# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

## 📈 Performance Tuning

### Database Optimization
```bash
# Increase MySQL memory (docker-compose.yml)
services:
  mysql:
    command: --max_connections=200 --innodb_buffer_pool_size=512M
```

### Redis Cache
Already configured and running on port 6379

### Frontend Build Optimization
Next.js is configured with production optimizations by default

## 🔗 URLs

- **Frontend**: https://bulan2.yusufsoftware.my.id
- **Backend API**: https://bulan2.yusufsoftware.my.id/api
- **Google OAuth**: https://bulan2.yusufsoftware.my.id/api/auth/google/login

## 📞 Support

Jika ada masalah saat deployment, periksa:
1. Container logs: `docker-compose logs`
2. Nginx logs: `/var/log/nginx/bulan2-error.log`
3. Environment variables: Pastikan semua variabel di `.env` sudah benar
