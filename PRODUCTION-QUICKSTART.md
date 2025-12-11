# Quick Reference - Production Deployment

## 🔑 Files Needed for Production

1. **`.env`** - Copy from `.env.production.template` and configure
2. **`nginx/bulan2-modern.conf`** - Nginx configuration
3. **`deploy.sh`** - Deployment script
4. **`DEPLOYMENT.md`** - Full deployment guide

## ⚡ Quick Deploy Commands

```bash
# On server
cd /var/www/bulan2-modern
git pull
./deploy.sh
```

## 🌐 Production URLs

**Domain**: `bulan2.yusufsoftware.my.id`

- Frontend: https://bulan2.yusufsoftware.my.id
- Backend: https://bulan2.yusufsoftware.my.id/api
- OAuth: https://bulan2.yusufsoftware.my.id/api/auth/google/login

## 🔧 Ports

| Service | Internal Port | External Access |
|---------|--------------|-----------------|
| Backend | 8081 | Via Nginx (443) |
| Frontend | 3001 | Via Nginx (443) |
| MySQL | 3307 | Localhost only |
| Redis | 6379 | Localhost only |

## 🚨 MUST DO Before Deploy

1. ✅ Generate strong passwords for database
2. ✅ Generate JWT secret: `openssl rand -base64 64`
3. ✅ Update Google OAuth redirect URL in Google Cloud Console
4. ✅ Configure `.env` with production values
5. ✅ Setup SSL certificate: `sudo certbot --nginx -d bulan2.yusufsoftware.my.id`
6. ✅ Copy nginx config to `/etc/nginx/sites-available/`

## 📊 Monitoring

```bash
# Container status
docker-compose ps

# Logs
docker-compose logs -f backend

# Resource usage
docker stats

# Nginx logs
sudo tail -f /var/log/nginx/bulan2-access.log
```

## 🔄 Update Application

```bash
git pull
docker-compose down
docker-compose up -d --build
```

## 🆘 Emergency Commands

```bash
# Stop everything
docker-compose down

# Restart backend only
docker-compose restart backend

# View backend logs
docker-compose logs -f backend

# Database backup
docker-compose exec mysql mysqldump -u root -p bulan2_prod_db > backup.sql
```

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
