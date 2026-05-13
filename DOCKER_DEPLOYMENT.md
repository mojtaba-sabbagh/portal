# Docker Deployment Guide

This guide explains how to deploy the Portal application using Docker and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed on your server
- PostgreSQL database credentials
- Environment variables configured

## Local Testing (Optional)

Before deploying to production, test the Docker setup locally:

```bash
# Build the Docker image
docker-compose build

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## Production Deployment Steps

### 1. Build the Docker Image

```bash
# From your project root
docker build -t portal:latest .
```

### 2. Save and Transfer the Image to Server

```bash
# Save image to a tar file
docker save portal:latest | gzip > portal-latest.tar.gz

# Transfer to your server (adjust server address as needed)
scp portal-latest.tar.gz user@your-server:/tmp/
```

### 3. Load Image on Server

```bash
# SSH into your server
ssh user@your-server

# Navigate to where the image was transferred
cd /tmp

# Load the Docker image
docker load < portal-latest.tar.gz

# Verify the image loaded
docker images | grep portal
```

### 4. Configure Environment Variables

Create a `.env` file on your server with production values:

```bash
# Database Configuration (point to your production PostgreSQL)
DB_NAME=portal
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_PORT=5433

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password

# SMTP Configuration
SMTP_HOST=your.smtp.server
SMTP_PORT=25
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=your-email@example.com
SMTP_SSL_HOST=your.smtp.server
SMTP_TLS_SERVERNAME=your.smtp.server
```

### 5. Copy docker-compose.yml to Server

Transfer the docker-compose.yml file to your server:

```bash
scp docker-compose.yml user@your-server:/path/to/portal/
scp .env user@your-server:/path/to/portal/
```

### 6. Start the Application

```bash
cd /path/to/portal

# Start services in detached mode
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# View app logs specifically
docker-compose logs -f app

# View database logs
docker-compose logs -f postgres
```

## Verification

After deployment, verify everything is working:

```bash
# Check if services are running
docker-compose ps

# Test the app endpoint
curl http://localhost:3000

# Test API endpoints
curl http://localhost:3000/api/banners
curl http://localhost:3000/api/contacts
curl http://localhost:3000/api/news
curl http://localhost:3000/api/videos

# Check app logs
docker-compose logs app

# Check database logs
docker-compose logs postgres
```

## Common Issues and Solutions

### Database Connection Errors
- Ensure PostgreSQL is running and healthy
- Check DATABASE_URL format in docker-compose.yml
- Verify DB credentials match your PostgreSQL setup
- Check firewall rules allow traffic between containers

### Port Already in Use
```bash
# If port 3000 is already in use, change in docker-compose.yml
# Or stop the container using that port
docker ps
docker stop <container_id>
```

### Migrations Not Running
- Check logs: `docker-compose logs app`
- Ensure prisma/schema.prisma and migrations/ folder are copied
- Verify DATABASE_URL is correct

### Restart Services After Code Changes

```bash
# Rebuild and restart
docker-compose down
docker build -t portal:latest .
docker-compose up -d
```

## Updating the Application

When you have new changes:

1. Build new image: `docker build -t portal:latest .`
2. Save and transfer: `docker save portal:latest | gzip > portal-latest.tar.gz`
3. On server:
   ```bash
   docker-compose down
   docker load < portal-latest.tar.gz
   docker-compose up -d
   ```

## Logs and Monitoring

```bash
# Real-time logs for all services
docker-compose logs -f

# Logs for specific service
docker-compose logs -f app
docker-compose logs -f postgres

# View logs with timestamp
docker-compose logs -f --timestamps

# Last 100 lines
docker-compose logs --tail=100 app
```

## Backup and Recovery

### Backup Database
```bash
docker-compose exec postgres pg_dump -U postgres -d portal > backup.sql
```

### Restore Database
```bash
docker-compose exec -T postgres psql -U postgres -d portal < backup.sql
```

## Cleanup

```bash
# Stop services
docker-compose down

# Remove images
docker rmi portal:latest

# Remove volumes (⚠️ This deletes database data)
docker-compose down -v
```

## Environment Variable Reference

See [.env.example](.env.example) for all available environment variables.

## Support

For issues or questions, check the application logs first:
```bash
docker-compose logs -f app
```
