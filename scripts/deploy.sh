#!/bin/bash

# Production deployment script for Exam Monitoring System
# This script handles deployment to both Render (backend) and Vercel (frontend)

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        exit 1
    fi
    
    log_success "All dependencies are installed"
}

# Validate environment variables
validate_env() {
    log_info "Validating environment variables..."
    
    if [ ! -f "backend/.env" ]; then
        log_error "backend/.env file not found"
        exit 1
    fi
    
    if [ ! -f "frontend/.env.example" ]; then
        log_error "frontend/.env.example file not found"
        exit 1
    fi
    
    # Check required backend environment variables
    required_vars=("MONGODB_URI" "JWT_SECRET" "EMAIL_USER" "EMAIL_PASSWORD")
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" backend/.env; then
            log_error "Required environment variable ${var} is missing from backend/.env"
            exit 1
        fi
    done
    
    log_success "Environment variables validated"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Install backend dependencies
    log_info "Installing backend dependencies..."
    cd backend
    npm ci --production=false
    cd ..
    
    # Install frontend dependencies
    log_info "Installing frontend dependencies..."
    cd frontend
    npm ci
    cd ..
    
    log_success "Dependencies installed"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Backend tests
    if [ -d "backend/tests" ]; then
        log_info "Running backend tests..."
        cd backend
        npm test
        cd ..
    else
        log_warning "No backend tests found"
    fi
    
    # Frontend tests
    if [ -d "frontend/tests" ]; then
        log_info "Running frontend tests..."
        cd frontend
        npm test
        cd ..
    else
        log_warning "No frontend tests found"
    fi
    
    log_success "Tests completed"
}

# Build applications
build_apps() {
    log_info "Building applications..."
    
    # Build frontend
    log_info "Building frontend..."
    cd frontend
    npm run build
    cd ..
    
    log_success "Applications built"
}

# Security checks
security_checks() {
    log_info "Running security checks..."
    
    # Backend security audit
    log_info "Running backend security audit..."
    cd backend
    npm audit --audit-level moderate
    cd ..
    
    # Frontend security audit
    log_info "Running frontend security audit..."
    cd frontend
    npm audit --audit-level moderate
    cd ..
    
    log_success "Security checks completed"
}

# Git operations
git_operations() {
    log_info "Performing Git operations..."
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        log_info "Committing changes..."
        git add .
        git commit -m "Production deployment - $(date)"
        log_success "Changes committed"
    else
        log_info "No uncommitted changes"
    fi
    
    # Push to main branch
    log_info "Pushing to main branch..."
    git push origin main
    log_success "Code pushed to main branch"
}

# Deploy to services
deploy_services() {
    log_info "Deploying to services..."
    
    # Deploy backend to Render (automatic on push)
    log_info "Backend will be automatically deployed to Render"
    
    # Deploy frontend to Vercel (automatic on push)
    log_info "Frontend will be automatically deployed to Vercel"
    
    log_success "Deployment initiated"
}

# Health checks
health_checks() {
    log_info "Waiting for deployment to complete..."
    
    # Wait for services to be ready
    sleep 60
    
    # Check backend health
    log_info "Checking backend health..."
    if curl -f -s https://exam-monitoring-e7m8.onrender.com/api/health > /dev/null; then
        log_success "Backend is healthy"
    else
        log_error "Backend health check failed"
    fi
    
    # Check frontend health
    log_info "Checking frontend health..."
    if curl -f -s https://www.pkthenexgenexam.xyz > /dev/null; then
        log_success "Frontend is healthy"
    else
        log_error "Frontend health check failed"
    fi
}

# Main deployment function
main() {
    log_info "Starting production deployment..."
    
    check_dependencies
    validate_env
    install_dependencies
    run_tests
    security_checks
    build_apps
    git_operations
    deploy_services
    health_checks
    
    log_success "Production deployment completed successfully!"
    log_info "Backend URL: https://exam-monitoring-e7m8.onrender.com"
    log_info "Frontend URL: https://www.pkthenexgenexam.xyz"
}

# Handle script arguments
case "${1:-}" in
    "skip-tests")
        log_warning "Skipping tests..."
        check_dependencies
        validate_env
        install_dependencies
        security_checks
        build_apps
        git_operations
        deploy_services
        health_checks
        ;;
    "skip-security")
        log_warning "Skipping security checks..."
        check_dependencies
        validate_env
        install_dependencies
        run_tests
        build_apps
        git_operations
        deploy_services
        health_checks
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [skip-tests|skip-security|help]"
        echo "  skip-tests    - Skip running tests"
        echo "  skip-security - Skip security checks"
        echo "  help         - Show this help message"
        exit 0
        ;;
    "")
        main
        ;;
    *)
        log_error "Unknown argument: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
