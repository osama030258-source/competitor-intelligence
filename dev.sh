#!/bin/bash
# Development helper scripts for Competitor Intelligence Platform

BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if services are running
check_services() {
    print_status "Checking services..."
    
    if curl -s http://localhost:8000/api/health > /dev/null; then
        print_success "Backend API is running (http://localhost:8000)"
    else
        print_error "Backend API is not running"
    fi
    
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Frontend is running (http://localhost:3000)"
    else
        print_error "Frontend is not running"
    fi
    
    if docker ps | grep -q postgres; then
        print_success "PostgreSQL is running"
    else
        print_error "PostgreSQL is not running"
    fi
    
    if docker ps | grep -q redis; then
        print_success "Redis is running"
    else
        print_error "Redis is not running"
    fi
}

# Clean up
cleanup() {
    print_status "Cleaning up..."
    docker-compose down
    find . -type d -name __pycache__ -exec rm -r {} +
    find . -type d -name .pytest_cache -exec rm -r {} +
    find . -type f -name .DS_Store -delete
    print_success "Cleanup complete"
}

# Reset database
reset_db() {
    print_status "Resetting database..."
    docker exec -it postgres-ci psql -U postgres -c "DROP DATABASE IF EXISTS competitor_intel;"
    docker exec -it postgres-ci psql -U postgres -c "CREATE DATABASE competitor_intel;"
    print_success "Database reset complete"
}

# View logs
view_logs() {
    if [ -z "$1" ]; then
        print_error "Usage: ./dev.sh logs [backend|frontend|postgres|redis|all]"
        return
    fi
    
    case $1 in
        backend)
            docker logs competitor-intel-postgres
            ;;
        frontend)
            docker logs competitor-intel-redis
            ;;
        postgres)
            docker logs competitor-intel-postgres
            ;;
        redis)
            docker logs competitor-intel-redis
            ;;
        all)
            docker-compose logs
            ;;
        *)
            print_error "Unknown service: $1"
            ;;
    esac
}

# Format code
format() {
    print_status "Formatting backend code..."
    cd backend
    black . --exclude venv
    cd ..
    print_success "Backend formatting complete"
}

# Main script
case "$1" in
    check)
        check_services
        ;;
    cleanup)
        cleanup
        ;;
    reset-db)
        reset_db
        ;;
    logs)
        view_logs "$2"
        ;;
    format)
        format
        ;;
    *)
        echo "Competitor Intelligence Development Helper"
        echo ""
        echo "Usage: ./dev.sh [command]"
        echo ""
        echo "Commands:"
        echo "  check           Check if all services are running"
        echo "  cleanup         Clean up containers and cache"
        echo "  reset-db        Reset the database"
        echo "  logs [service]  View logs for a service"
        echo "  format          Format Python code"
        echo ""
        ;;
esac
