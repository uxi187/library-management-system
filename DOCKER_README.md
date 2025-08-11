# 🐳 Docker Setup for Library Management System

Complete Docker configuration for running the full-stack Library Management System with PostgreSQL, Redis, Backend API, and Next.js Frontend.

## 📋 Quick Start

### Development Mode (Recommended for Development)

```bash
# Build and start all services in development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Or run in background
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

# View logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
```

### Production Mode

```bash
# Build and start all services in production mode
docker-compose up --build

# Or run in background
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🏗️ Services Overview

| Service | Port | Description | Health Check |
|---------|------|-------------|--------------|
| **Database** | 5432 | PostgreSQL 15 | `pg_isready` |
| **Backend** | 3001 | Node.js/Express API | `/health` endpoint |
| **Frontend** | 3000 | Next.js App | Root page check |
| **Redis** | 6379 | Caching (optional) | `redis-cli ping` |
| **Nginx** | 80 | Reverse Proxy (production) | Default nginx check |

## 🌐 Access Points

### Development Mode
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432
- **Redis**: localhost:6379

### Production Mode (with Nginx)
- **Application**: http://localhost (Nginx routes to frontend/backend)
- **Direct Frontend**: http://localhost:3000
- **Direct Backend**: http://localhost:3001

## 🔧 Configuration

### Environment Variables

#### Backend (.env in /backend/)
```env
NODE_ENV=development
DATABASE_URL=postgresql://admin:adminpass@db:5432/library_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

#### Frontend (next.config.js handles this)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001  # Development
NEXT_PUBLIC_API_URL=http://backend:5000    # Production (container-to-container)
NODE_ENV=development|production
NEXT_TELEMETRY_DISABLED=1
```

### Docker Networks
All services run on the `library_network` bridge network, allowing container-to-container communication.

## 📂 Docker Files

### Frontend Dockerfiles
- **`Dockerfile`**: Multi-stage production build with standalone output
- **`Dockerfile.dev`**: Development build with hot reload

### Backend Dockerfiles  
- **`Dockerfile`**: Production build with health checks
- **`Dockerfile.dev`**: Development build with nodemon

### Docker Compose Files
- **`docker-compose.yml`**: Base configuration (production-ready)
- **`docker-compose.dev.yml`**: Development overrides

## 🚀 Detailed Commands

### Build Specific Services
```bash
# Build only frontend
docker-compose build frontend

# Build only backend
docker-compose build backend

# Build with no cache
docker-compose build --no-cache
```

### Run Individual Services
```bash
# Start only database and backend
docker-compose up db backend

# Start everything except nginx
docker-compose --profile "!production" up

# Start only frontend (after backend is running)
docker-compose up frontend
```

### Development Workflow
```bash
# Start with development overrides
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Rebuild after code changes
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build frontend

# View specific service logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f backend
```

## 🔍 Monitoring & Debugging

### Health Checks
```bash
# Check service health
docker-compose ps

# Check specific container health
docker inspect library_frontend --format='{{json .State.Health}}'
docker inspect library_backend --format='{{json .State.Health}}'
```

### Container Access
```bash
# Access frontend container
docker exec -it library_frontend sh

# Access backend container  
docker exec -it library_backend sh

# Access database
docker exec -it library_db psql -U admin -d library_db
```

### Logs and Debugging
```bash
# Follow all logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db

# Show last 100 lines
docker-compose logs --tail=100 frontend
```

## 🗄️ Data Persistence

### Volumes
- **`postgres_data`**: Database data persistence
- **`redis_data`**: Redis data persistence
- **Frontend volumes**: Hot reload for development

### Backup Database
```bash
# Create backup
docker exec library_db pg_dump -U admin library_db > backup.sql

# Restore backup
docker exec -i library_db psql -U admin library_db < backup.sql
```

## 🔄 Development Workflow

### Hot Reload Setup
Both frontend and backend support hot reload in development mode:

```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Code changes will automatically reload:
# - Frontend: Next.js hot reload
# - Backend: Nodemon auto-restart
```

### Database Changes
```bash
# Apply Prisma migrations
docker exec library_backend_dev npx prisma migrate dev

# Reset database
docker exec library_backend_dev npx prisma migrate reset

# Generate Prisma client
docker exec library_backend_dev npx prisma generate
```

## 🏭 Production Deployment

### Build Optimization
```bash
# Production build with optimizations
docker-compose build --no-cache

# Start production environment
docker-compose up -d

# Scale services (if needed)
docker-compose up -d --scale frontend=2
```

### SSL/HTTPS Setup
For production, configure Nginx with SSL:

1. Update `docker/nginx.conf` with SSL configuration
2. Add SSL certificates to appropriate volumes
3. Update ports to 443 for HTTPS

## 🛠️ Troubleshooting

### Common Issues

**Frontend can't connect to backend**:
```bash
# Check if backend is healthy
docker-compose ps backend

# Check network connectivity
docker exec library_frontend ping backend

# Verify environment variables
docker exec library_frontend env | grep NEXT_PUBLIC_API_URL
```

**Database connection issues**:
```bash
# Check database health
docker-compose ps db

# Test database connection
docker exec library_backend npx prisma db pull

# Check database logs
docker-compose logs db
```

**Build failures**:
```bash
# Clean build with no cache
docker-compose build --no-cache

# Remove all containers and rebuild
docker-compose down -v
docker-compose up --build
```

**Port conflicts**:
```bash
# Check what's using ports
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Kill processes if needed
sudo kill -9 $(lsof -t -i:3000)
```

### Performance Issues
```bash
# Check resource usage
docker stats

# Limit container resources
docker-compose --compatibility up  # Respects deploy.resources
```

## 📊 Container Health Monitoring

All services include health checks:

- **Database**: `pg_isready -U admin -d library_db`
- **Backend**: `curl -f http://localhost:5000/health`
- **Frontend**: `wget --spider http://localhost:3000/`
- **Redis**: `redis-cli ping`

Services will show as `healthy`, `unhealthy`, or `starting` in `docker-compose ps`.

## 🔐 Security Considerations

### Production Security
- Change default passwords in environment variables
- Use Docker secrets for sensitive data
- Implement proper firewall rules
- Regular security updates of base images
- Use non-root users in containers (already configured)

### Network Security
- Services communicate through internal Docker network
- Only necessary ports are exposed to host
- Nginx can provide additional security headers

## 📦 Container Sizes

Optimized for minimal size:
- **Frontend**: ~150MB (Alpine + Node.js + Next.js standalone)
- **Backend**: ~120MB (Alpine + Node.js + dependencies)
- **Database**: ~200MB (PostgreSQL 15 Alpine)
- **Redis**: ~50MB (Redis 7 Alpine)

## 🚦 Status Indicators

Monitor deployment status:
```bash
# Quick status check
docker-compose ps

# Detailed health status
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# Service dependency status
docker-compose config --services
```

This Docker setup provides a complete, production-ready environment for the Library Management System with proper service orchestration, health checks, and development workflow support! 🎉
