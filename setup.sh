#!/bin/bash

# Library Management System - Setup Script
echo "🚀 Setting up Library Management System..."

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

# Check if Docker and Docker Compose are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed."
}

# Create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOL
# Database
DATABASE_URL="postgresql://postgres:password@db:5432/library_db?schema=public"

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
EOL
        print_success "Created backend/.env file"
    else
        print_warning "backend/.env already exists, skipping..."
    fi
    
    # Frontend .env.local
    if [ ! -f "frontend/.env.local" ]; then
        cat > frontend/.env.local << EOL
NEXT_PUBLIC_API_URL=http://localhost:5000
EOL
        print_success "Created frontend/.env.local file"
    else
        print_warning "frontend/.env.local already exists, skipping..."
    fi
}

# Build and start services
start_services() {
    print_status "Building and starting services..."
    
    # Build the services
    docker-compose build
    
    if [ $? -eq 0 ]; then
        print_success "Services built successfully"
    else
        print_error "Failed to build services"
        exit 1
    fi
    
    # Start the services
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        print_success "Services started successfully"
    else
        print_error "Failed to start services"
        exit 1
    fi
}

# Wait for database and run migrations
setup_database() {
    print_status "Setting up database..."
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Run Prisma migrations
    print_status "Running database migrations..."
    docker-compose exec backend npx prisma migrate dev --name init
    
    if [ $? -eq 0 ]; then
        print_success "Database migrations completed"
    else
        print_warning "Database migrations failed - you may need to run them manually"
    fi
}

# Display final information
show_completion_info() {
    print_success "🎉 Setup completed!"
    echo ""
    echo "📱 Your Library Management System is now running:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:5000"
    echo "   Database: localhost:5432"
    echo ""
    echo "🔧 Useful commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart: docker-compose restart"
    echo "   Database shell: docker-compose exec db psql -U postgres -d library_db"
    echo ""
    echo "📖 Check the README.md for more information!"
}

# Main execution
main() {
    echo "📚 Library Management System Setup"
    echo "=================================="
    echo ""
    
    check_dependencies
    create_env_files
    start_services
    setup_database
    show_completion_info
}

# Run main function
main