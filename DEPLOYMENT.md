# 🚀 Deployment Guide - Bulan2 Modern

## Prerequisites
- Docker & Docker Compose installed
- VPS with Ubuntu 20.04+ (minimum 2GB RAM)
- Domain name (optional, for SSL)

## Quick Start (Development)

1. **Clone or upload project to VPS**
```bash
cd /var/www
# Upload your project folder here
cd bulan2-modern
```

2. **Create environment file**
```bash
cp .env.example .env
nano .env
```

Edit `.env`:
```env
# Database
MYSQL_ROOT_PASSWORD=your_strong_password_here
MYSQL_DATABASE=bulan2_db
MYSQL_USER=bulan2user
MYSQL_PASSWORD=your_db_password_here

# JWT Secret - CHANGE THIS!
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# App Environment
APP_ENV=production

# Frontend API URL
NEXT_PUBLIC_API_URL=http://your-domain.com:8080
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Check status**
```bash
docker-compose ps
docker-compose logs backend
docker-compose logs frontend
```

5. **Access application**
- Frontend: http://your-server-ip:3000
- Backend API: http://your-server-ip:8080
- MySQL: localhost:3306 (internal only)

## Production Deployment with Nginx

1. **Install Nginx on host**
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

2. **Create Nginx config**
```bash
sudo nano /etc/nginx/sites-available/bulan2
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:8080/uploads;
    }
}
```

3. **Enable site**
```bash
sudo ln -s /etc/nginx/sites-available/bulan2 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. **Setup SSL (optional but recommended)**
```bash
sudo certbot --nginx -d your-domain.com
```

5. **Update .env for production**
```env
NEXT_PUBLIC_API_URL=https://your-domain.com
APP_ENV=production
```

6. **Restart services**
```bash
docker-compose down
docker-compose up -d
```

## Database Backup

**Manual backup:**
```bash
docker exec bulan2_mysql mysqldump -u root -p bulan2_db > backup.sql
```

**Restore:**
```bash
docker exec -i bulan2_mysql mysql -u root -p bulan2_db < backup.sql
```

**Automated daily backup (crontab):**
```bash
crontab -e
```

Add:
```
0 2 * * * docker exec bulan2_mysql mysqldump -u root -pYourPassword bulan2_db > /backup/bulan2_$(date +\%Y\%m\%d).sql
```

## Monitoring

**View logs:**
```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# MySQL logs
docker-compose logs -f mysql

# All logs
docker-compose logs -f
```

**Resource usage:**
```bash
docker stats
```

## Troubleshooting

**Port already in use:**
```bash
# Check what's using the port
sudo lsof -i :3000
sudo lsof -i :8080

# Kill process if needed
sudo kill -9 <PID>
```

**Container not starting:**
```bash
# Check logs
docker-compose logs <service-name>

# Restart service
docker-compose restart <service-name>

# Rebuild
docker-compose up -d --build
```

**Database connection failed:**
```bash
# Wait for MySQL to be ready
docker-compose exec mysql mysql -u root -p -e "SELECT 1"

# Check database exists
docker-compose exec mysql mysql -u root -p -e "SHOW DATABASES"
```

## Security Checklist

- [ ] Changed default JWT_SECRET
- [ ] Strong MySQL passwords
- [ ] Enabled firewall (ufw)
- [ ] Setup SSL certificate
- [ ] Regular backups configured
- [ ] Limited SSH access
- [ ] Docker containers auto-restart
- [ ] Redis password (if exposed)

## Firewall Setup

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## Auto-start on Reboot

Docker Compose will auto-restart containers if configured:
```yaml
# Already in docker-compose.yml
restart: unless-stopped
```

## Updating Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Or for zero-downtime
docker-compose up -d --no-deps --build backend
docker-compose up -d --no-deps --build frontend
```

---

**Need help?** Check logs first with `docker-compose logs`
