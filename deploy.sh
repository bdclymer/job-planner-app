#!/bin/bash

# Job Planner Website Deployment Script
# This script deploys the website to various environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# Check for required commands
check_requirements() {
    print_status "Checking requirements..."
    
    command -v node >/dev/null 2>&1 || { print_error "Node.js is not installed"; exit 1; }
    command -v npm >/dev/null 2>&1 || { print_error "npm is not installed"; exit 1; }
    command -v git >/dev/null 2>&1 || { print_error "git is not installed"; exit 1; }
    
    print_status "All requirements met"
}

# Install dependencies
install_deps() {
    print_status "Installing dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_status "Dependencies installed"
}

# Build for production
build_production() {
    print_status "Building for production..."
    
    # Clean previous builds
    rm -rf dist/ 2>/dev/null || true
    
    # Build assets
    npm run build
    
    print_status "Build complete"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        npm test
        print_status "Tests passed"
    else
        print_warning "No tests configured"
    fi
}

# Start development server
start_dev() {
    print_status "Starting development server..."
    
    if [ -f ".env" ]; then
        print_info "Using existing .env file"
    else
        print_warning "No .env file found, using .env.example"
        cp .env.example .env
    fi
    
    npm run dev
}

# Start production server
start_production() {
    print_status "Starting production server..."
    
    export NODE_ENV=production
    
    if [ ! -f ".env" ]; then
        print_error "No .env file found for production"
        print_info "Create .env file with production variables"
        exit 1
    fi
    
    # Build if not already built
    if [ ! -d "dist" ] && [ -f "package.json" ] && grep -q '"build"' package.json; then
        build_production
    fi
    
    node server.js
}

# Docker deployment
docker_deploy() {
    print_status "Building Docker image..."
    
    if command -v docker >/dev/null 2>&1; then
        docker build -t job-planner-website:latest .
        print_status "Docker image built: job-planner-website:latest"
        
        print_info "To run the container:"
        echo "  docker run -p 3000:3000 \\"
        echo "    -e JOB_PLANNER_API=http://api-server:5000/api \\"
        echo "    -e JOB_PLANNER_API_KEY=your-key \\"
        echo "    job-planner-website:latest"
    else
        print_error "Docker is not installed"
        exit 1
    fi
}

# PM2 deployment
pm2_deploy() {
    print_status "Deploying with PM2..."
    
    if command -v pm2 >/dev/null 2>&1; then
        # Stop existing instance
        pm2 stop job-planner-website 2>/dev/null || true
        pm2 delete job-planner-website 2>/dev/null || true
        
        # Start new instance
        pm2 start server.js --name "job-planner-website" \
            --env production \
            --instances max \
            --exec-mode cluster \
            --max-memory-restart 512M
        
        # Save PM2 configuration
        pm2 save
        
        print_status "PM2 deployment complete"
        print_info "PM2 commands:"
        echo "  pm2 status                    # Check status"
        echo "  pm2 logs job-planner-website  # View logs"
        echo "  pm2 monit                     # Monitor resources"
    else
        print_error "PM2 is not installed"
        print_info "Install with: npm install -g pm2"
        exit 1
    fi
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    local port=${1:-3000}
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "http://localhost:$port/health" >/dev/null 2>&1; then
            print_status "Health check passed on port $port"
            return 0
        fi
        
        print_info "Waiting for server to start... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "Health check failed after $max_attempts attempts"
    return 1
}

# Backup current deployment
backup_deployment() {
    print_status "Creating backup..."
    
    local backup_dir="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup important files
    cp -r public views server.js package.json package-lock.json .env* "$backup_dir/" 2>/dev/null || true
    
    print_status "Backup created: $backup_dir"
}

# Show usage
show_usage() {
    echo "Job Planner Website Deployment Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  dev        Start development server"
    echo "  prod       Start production server"
    echo "  build      Build for production"
    echo "  test       Run tests"
    echo "  docker     Build Docker image"
    echo "  pm2        Deploy with PM2"
    echo "  deploy     Full deployment (build + test + pm2)"
    echo "  health     Perform health check"
    echo "  backup     Create backup of current deployment"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev        # Start development server"
    echo "  $0 deploy     # Full deployment"
    echo "  $0 docker     # Build Docker image"
}

# Main execution
main() {
    local command=${1:-"help"}
    
    case $command in
        dev)
            check_requirements
            install_deps
            start_dev
            ;;
        prod)
            check_requirements
            install_deps
            start_production
            ;;
        build)
            check_requirements
            install_deps
            build_production
            ;;
        test)
            check_requirements
            install_deps
            run_tests
            ;;
        docker)
            docker_deploy
            ;;
        pm2)
            check_requirements
            install_deps
            build_production
            pm2_deploy
            health_check
            ;;
        deploy)
            check_requirements
            backup_deployment
            install_deps
            run_tests
            build_production
            pm2_deploy
            health_check
            ;;
        health)
            health_check ${2:-3000}
            ;;
        backup)
            backup_deployment
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"