# Production Deployment Guide

## Overview

This guide covers deploying the ExamGen application to production environments with security, scalability, and monitoring best practices.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Security Configuration](#security-configuration)
5. [Deployment Options](#deployment-options)
6. [Monitoring and Logging](#monitoring-and-logging)
7. [Performance Optimization](#performance-optimization)
8. [Backup and Recovery](#backup-and-recovery)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Services
- **Node.js 18+** (for local development)
- **MongoDB Atlas** (production database)
- **Redis** (optional, for caching)
- **Email Service** (Gmail/SMTP)
- **SMS Service** (Twilio)
- **File Storage** (AWS S3 or similar)

### Required Tools
- **Docker** and **Docker Compose**
- **Git**
- **SSL Certificate** (for HTTPS)
- **Domain Name**

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file in the backend directory:

```bash
# Server Configuration
NODE_ENV=production
PORT=5001
TRUST_PROXY=true

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/examgen_production
DB_NAME=examgen_production

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
BCRYPT_SALT_ROUNDS=12
SESSION_SECRET=your-session-secret-here

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
AUTH_RATE_LIMIT_MAX=10

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=ExamGen <noreply@yourdomain.com>

# SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads/

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log
ERROR_LOG_FILE=logs/error.log

# Monitoring Configuration
ENABLE_METRICS=true
HEALTH_CHECK_INTERVAL=30000

# Performance Configuration
COMPRESSION_ENABLED=true
CACHE_TTL=3600

# Redis Configuration (Optional)
REDIS_URL=redis://username:password@host:port

# Security Headers
HELMET_ENABLED=true
```

### Frontend Configuration

Update the frontend `.env` file:

```bash
VITE_API_URL=https://your-api-domain.com/api/v1
VITE_APP_NAME=ExamGen
VITE_APP_VERSION=1.0.0
```

## Database Setup

### MongoDB Atlas Configuration

1. **Create a MongoDB Atlas Account**
   - Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster

2. **Configure Security**
   - Create a database user with strong password
   - Configure IP whitelist (0.0.0.0/0 for cloud deployment)
   - Enable authentication

3. **Database Optimization**
   - Enable auto-indexing
   - Configure backup schedule
   - Set up monitoring

4. **Connection String**
   ```bash
   mongodb+srv://username:password@cluster.mongodb.net/examgen_production?retryWrites=true&w=majority
   ```

### Database Indexes

The application automatically creates necessary indexes on startup:

```javascript
// Users collection
{ email: 1 } (unique)
{ studentId: 1 } (sparse)
{ role: 1 }
{ createdAt: 1 }

// Exams collection
{ title: "text", description: "text" }
{ subject: 1 }
{ difficulty: 1 }
{ createdBy: 1 }
{ createdAt: 1 }
{ isActive: 1 }

// Exam submissions collection
{ examId: 1 }
{ studentId: 1 }
{ submittedAt: 1 }
{ score: 1 }
```

## Security Configuration

### SSL/TLS Setup

1. **Obtain SSL Certificate**
   - Use Let's Encrypt (free)
   - Or purchase from a certificate authority

2. **Configure HTTPS**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;
       
       location / {
           proxy_pass http://localhost:5001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

### Security Headers

The application includes comprehensive security headers:

- **Content Security Policy (CSP)**
- **HTTP Strict Transport Security (HSTS)**
- **X-Frame-Options**
- **X-Content-Type-Options**
- **X-XSS-Protection**
- **Referrer Policy**

### Rate Limiting

- **General API**: 1000 requests per 15 minutes
- **Authentication**: 10 requests per 15 minutes
- **Sensitive Operations**: 5 requests per 15 minutes

## Deployment Options

### Option 1: Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t examgen:latest .
   ```

2. **Run with Docker Compose**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "5001:5001"
       environment:
         - NODE_ENV=production
       env_file:
         - backend/.env.production
       volumes:
         - ./logs:/app/logs
         - ./uploads:/app/uploads
       restart: unless-stopped
   ```

3. **Deploy**
   ```bash
   docker-compose up -d
   ```

### Option 2: Render Deployment

1. **Connect GitHub Repository**
   - Create a Render account
   - Connect your GitHub repository
   - Select "Web Service"

2. **Configure Build Settings**
   ```yaml
   buildCommand: "npm run build"
   startCommand: "npm start"
   env: python-3.9.16
   ```

3. **Environment Variables**
   - Add all production environment variables
   - Set `NODE_ENV=production`

### Option 3: AWS Deployment

1. **EC2 Instance Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/your-username/examgen.git
   cd examgen
   
   # Install dependencies
   npm install
   cd frontend && npm install && cd ..
   
   # Build frontend
   cd frontend && npm run build && cd ..
   
   # Start with PM2
   pm2 start ecosystem.config.js --env production
   ```

3. **PM2 Configuration**
   ```javascript
   module.exports = {
     apps: [{
       name: 'examgen',
       script: './backend/server.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 5001
       },
       error_file: './logs/err.log',
       out_file: './logs/out.log',
       log_file: './logs/combined.log',
       time: true
     }]
   };
   ```

## Monitoring and Logging

### Application Monitoring

1. **Health Check Endpoint**
   ```
   GET /api/v1/health
   ```

2. **System Metrics**
   ```
   GET /api/v1/admin/system/metrics
   ```

3. **Performance Monitoring**
   - Response time tracking
   - Error rate monitoring
   - Memory usage tracking
   - Active connections

### Logging Configuration

Logs are automatically configured with Winston:

- **Application Logs**: `logs/app.log`
- **Error Logs**: `logs/error.log`
- **Combined Logs**: `logs/combined.log`

### Log Rotation

Configure log rotation to prevent disk space issues:

```bash
# Install logrotate
sudo apt install logrotate

# Create configuration
sudo nano /etc/logrotate.d/examgen
```

```
/path/to/examgen/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload examgen
    endscript
}
```

## Performance Optimization

### Caching Strategy

1. **Memory Cache** (NodeCache)
   - Default TTL: 1 hour
   - Automatic cleanup every 10 minutes

2. **Redis Cache** (Optional)
   - Persistent caching
   - Distributed cache support

3. **Browser Caching**
   - Static assets: 1 year
   - API responses: Configurable

### Database Optimization

1. **Connection Pooling**
   - Max 10 connections
   - Automatic retry on failure

2. **Index Optimization**
   - Automatic index creation
   - Query optimization

3. **Query Optimization**
   - Pagination for large datasets
   - Efficient aggregation pipelines

### Compression

- **Gzip Compression**: Enabled by default
- **Brotli Compression**: Supported when available
- **Image Optimization**: Automatic headers
- **JSON Minification**: Response optimization

## Backup and Recovery

### Database Backup

1. **MongoDB Atlas Backup**
   - Automatic daily backups
   - Point-in-time recovery
   - Cross-region replication

2. **Manual Backup**
   ```bash
   mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/examgen_production" --out=/backup/
   ```

### File Backup

1. **Uploads Directory**
   ```bash
   # Create backup
   tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
   
   # Sync to cloud storage
   aws s3 sync uploads/ s3://your-backup-bucket/uploads/
   ```

2. **Configuration Backup**
   ```bash
   # Backup environment files
   tar -czf config-backup-$(date +%Y%m%d).tar.gz .env.production backend/.env.production
   ```

### Recovery Procedures

1. **Database Recovery**
   ```bash
   mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/examgen_production" /backup/examgen_production/
   ```

2. **Application Recovery**
   ```bash
   # Restore files
   tar -xzf uploads-backup-YYYYMMDD.tar.gz
   
   # Restart application
   pm2 restart examgen
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB URI
   - Verify IP whitelist
   - Check network connectivity

2. **High Memory Usage**
   - Monitor memory leaks
   - Check cache configuration
   - Optimize database queries

3. **Slow Response Times**
   - Check database indexes
   - Monitor cache hit rates
   - Analyze slow queries

4. **Authentication Issues**
   - Verify JWT secrets
   - Check token expiration
   - Validate CORS configuration

### Debug Mode

Enable debug logging:

```bash
# Set debug environment
DEBUG=* npm start

# Or specific modules
DEBUG=examgen:* npm start
```

### Health Checks

Monitor application health:

```bash
# Check health endpoint
curl https://yourdomain.com/api/v1/health

# Check system metrics
curl -H "Authorization: Bearer YOUR_TOKEN" https://yourdomain.com/api/v1/admin/system/metrics
```

## Security Checklist

- [ ] SSL/TLS certificate installed and valid
- [ ] Environment variables properly configured
- [ ] Database access restricted
- [ ] API rate limiting configured
- [ ] Security headers enabled
- [ ] Input validation implemented
- [ ] Error logging enabled
- [ ] Backup procedures tested
- [ ] Monitoring alerts configured
- [ ] Password policies enforced

## Performance Checklist

- [ ] Database indexes created
- [ ] Caching configured
- [ ] Compression enabled
- [ ] CDN configured for static assets
- [ ] Load balancer configured
- [ ] Auto-scaling rules set
- [ ] Monitoring dashboards set up
- [ ] Performance tests run
- [ ] Bottlenecks identified and resolved

## Support

For deployment issues:

1. Check application logs
2. Verify environment configuration
3. Test database connectivity
4. Monitor system resources
5. Review security configurations

Additional resources:
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Security](https://expressjs.com/en/advanced/security.html)
