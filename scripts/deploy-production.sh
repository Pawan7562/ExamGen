#!/bin/bash

# Production Deployment Script for Exam Monitoring System
# This script prepares and deploys the application to production

set -e  # Exit on any error

echo "🚀 Starting Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're on main branch
if [ "$(git branch --show-current)" != "main" ]; then
    print_error "Not on main branch. Please switch to main branch before deploying."
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    print_error "Working directory is not clean. Please commit or stash changes."
    exit 1
fi

print_status "Running pre-deployment checks..."

# Run tests
print_status "Running tests..."
npm run test

if [ $? -ne 0 ]; then
    print_error "Tests failed. Please fix failing tests before deploying."
    exit 1
fi

print_success "All tests passed!"

# Run linting
print_status "Running linting..."
npm run lint

if [ $? -ne 0 ]; then
    print_warning "Linting issues found. Please fix them before deploying."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Security audit
print_status "Running security audit..."
npm audit --audit-level moderate

if [ $? -ne 0 ]; then
    print_warning "Security vulnerabilities found. Please address them before deploying."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build frontend
print_status "Building frontend..."
cd frontend
npm ci --only=production
npm run build
cd ..

if [ $? -ne 0 ]; then
    print_error "Frontend build failed."
    exit 1
fi

print_success "Frontend built successfully!"

# Create production environment file
print_status "Setting up production environment..."

if [ ! -f "backend/.env.production" ]; then
    print_error "Production environment file not found at backend/.env.production"
    exit 1
fi

# Copy production environment file
cp backend/.env.production backend/.env

# Create logs directory
mkdir -p backend/logs

# Create uploads directory
mkdir -p backend/uploads

# Set permissions
chmod 755 backend/logs
chmod 755 backend/uploads

# Commit and push changes
print_status "Committing and pushing changes..."

git add .
git commit -m "Production deployment: $(date '+%Y-%m-%d %H:%M:%S')

- Updated production configuration
- Built frontend assets
- Added production environment setup
- Security and performance optimizations"

git push origin main

if [ $? -ne 0 ]; then
    print_error "Failed to push changes to remote repository."
    exit 1
fi

print_success "Changes pushed to remote repository!"

# Deployment information
print_status "Deployment preparation complete!"
echo ""
echo -e "${GREEN}🎉 Production deployment initiated!${NC}"
echo ""
echo "Next steps:"
echo "1. Monitor Render deployment: https://dashboard.render.com/"
echo "2. Monitor Vercel deployment: https://vercel.com/dashboard"
echo "3. Test the application at: https://www.pkthenexgenexam.xyz"
echo "4. Check health endpoint: https://exam-monitoring-e7m8.onrender.com/api/health"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo "- Make sure MongoDB Atlas IP whitelist includes Render's IP"
echo "- Verify all environment variables are set correctly"
echo "- Monitor application logs for any issues"
echo ""

# Optional: Open deployment dashboards
read -p "Open Render dashboard? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    xdg-open "https://dashboard.render.com/"
fi

read -p "Open Vercel dashboard? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    xdg-open "https://vercel.com/dashboard"
fi

print_success "Production deployment script completed!"
