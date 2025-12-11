# Deployment with Docker Nginx

## Changes Made

1. **docker-compose.yml**: Removed `profiles` from nginx service - now always active
2. **nginx/nginx.conf**: Created Docker Nginx config with SSL support
3. **nginx/ssl/**: Directory for SSL certificates

## Deploy to Server

### 1. Push Changes to Git

```bash
# Di local (F:/kulis/bulan2-modern)
git add .
git commit -m "Add Docker Nginx configuration"
git push origin main
```

### 2. Pull on Server

```bash
# Di server
cd /var/www/To-Do-list
git pull origin main
```

### 3. Get SSL Certificate

```bash
# Stop containers first (to free port 80)
docker-compose down

# Get certificate
sudo certbot certonly --standalone -d this.mylist.web.id

# Copy certificates
sudo cp /etc/letsencrypt/live/this.mylist.web.id/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/this.mylist.web.id/privkey.pem nginx/ssl/

# Fix permissions
sudo chown -R $USER:$USER nginx/ssl
chmod 644 nginx/ssl/*
```

### 4. Start All Containers (Including Nginx)

```bash
docker-compose up -d --build
```

### 5. Verify

```bash
# Check all containers running
docker-compose ps

# Test HTTPS
curl -I https://this.mylist.web.id
```

## Architecture

```
Client (HTTPS)
    ↓
Nginx Container (port 443 → 80)
    ↓
┌─────────────┬──────────────┐
│             │              │
Frontend:3000  Backend:8080  
```

All services run in Docker - clean and isolated! ✅
