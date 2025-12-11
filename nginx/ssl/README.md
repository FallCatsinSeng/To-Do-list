# SSL Certificates Directory

This directory will contain SSL certificates on the production server.

## Setup on Server

After deploying to server, run:

```bash
# Get SSL certificate using certbot
sudo certbot certonly --standalone -d this.mylist.web.id

# Copy certificates to this folder
sudo cp /etc/letsencrypt/live/this.mylist.web.id/fullchain.pem /var/www/To-Do-list/nginx/ssl/
sudo cp /etc/letsencrypt/live/this.mylist.web.id/privkey.pem /var/www/To-Do-list/nginx/ssl/

# Fix permissions
sudo chown -R $USER:$USER /var/www/To-Do-list/nginx/ssl
chmod 644 /var/www/To-Do-list/nginx/ssl/*

# Restart nginx container
docker-compose restart nginx
```

## Certificate Renewal

Certificates will auto-renew with certbot. After renewal, copy new certificates:

```bash
sudo cp /etc/letsencrypt/live/this.mylist.web.id/*.pem /var/www/To-Do-list/nginx/ssl/
docker-compose restart nginx
```
