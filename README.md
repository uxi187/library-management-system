# 📚 Library Management System

A modern, full-stack library management system built with Node.js, Express, Prisma ORM, Next.js, and TailwindCSS. Fully containerized with Docker for easy deployment and development.

## 🚀 Features

- **Full-Stack Architecture**: Complete separation of frontend and backend
- **Modern Tech Stack**: Next.js 14, Node.js, Express, Prisma ORM, PostgreSQL
- **Responsive Design**: TailwindCSS for beautiful, mobile-first UI
- **Docker Ready**: Full containerization with development and production configs
- **Database Management**: Prisma ORM with PostgreSQL
- **Type Safety**: TypeScript throughout the frontend
- **API Documentation**: RESTful API with proper error handling
- **Scalable**: Nginx reverse proxy with load balancing ready

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Authentication**: JWT
- **Security**: Helmet, CORS
- **Validation**: Express Validator

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Language**: TypeScript
- **Icons**: Heroicons
- **HTTP Client**: Fetch API with custom wrapper

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Caching**: Redis (optional)
- **Database**: PostgreSQL with persistent volumes

## 📁 Project Structure

```
Library App/
├── backend/                 # Node.js + Express + Prisma API
│   ├── src/
│   │   └── app.js          # Main Express application
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── package.json
│   ├── Dockerfile
│   ├── Dockerfile.dev      # Development Dockerfile
│   └── config.js           # Environment configuration
├── frontend/               # Next.js + TailwindCSS application
│   ├── app/
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   ├── globals.css     # Global styles
│   │   └── books/
│   │       └── page.tsx    # Books listing page
│   ├── components/         # Reusable React components
│   ├── lib/
│   │   └── api.ts          # API client utilities
│   ├── package.json
│   ├── Dockerfile
│   ├── Dockerfile.dev      # Development Dockerfile
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── tsconfig.json
├── docker/                 # Docker configuration files
│   ├── nginx.conf          # Nginx configuration
│   └── init-db.sql         # Database initialization
├── docker-compose.yml      # Production Docker Compose
├── docker-compose.dev.yml  # Development override
├── setup.sh               # Automated setup script
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Docker (20.10+)
- Docker Compose (2.0+)

### Automated Setup

1. **Clone and enter the project directory**:
   ```bash
   cd "Library App"
   ```

2. **Run the setup script**:
   ```bash
   ./setup.sh
   ```

   This script will:
   - Check dependencies
   - Create environment files
   - Build Docker images
   - Start all services
   - Run database migrations

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Manual Setup

If you prefer manual setup:

1. **Create environment files**:

   **Backend** (`backend/.env`):
   ```env
   DATABASE_URL="postgresql://admin:admin123@db:5432/library_db?schema=public"
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

   **Frontend** (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

2. **Start services**:
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations**:
   ```bash
   docker-compose exec backend npx prisma migrate dev --name init
   ```

## 🔧 Development

### Development Mode

For development with hot reloading:

```bash
# Start in development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Or rebuild and start
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Local Development (without Docker)

1. **Backend**:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Database**: Use the provided Docker Compose database:
   ```bash
   docker-compose up db -d
   ```

### Useful Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Access database shell
docker-compose exec db psql -U postgres -d library_db

# Run Prisma commands
docker-compose exec backend npx prisma studio
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma generate

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Remove volumes (⚠️ destroys data)
docker-compose down -v
```

## 📊 Database Schema

The application uses the following main entities:

- **Authors**: Book authors with biographical information
- **Categories**: Book categories/genres
- **Books**: Main book entity with relationships to authors and categories
- **Users**: Library members and staff
- **Borrowings**: Book borrowing records

## 🔒 Security Features

- **CORS**: Configured for frontend domain
- **Helmet**: Security headers for Express
- **JWT**: Authentication tokens
- **Rate Limiting**: Nginx-based rate limiting
- **Input Validation**: Express Validator for API endpoints
- **Environment Variables**: Sensitive data in environment files

## 🌐 API Endpoints

### Books
- `GET /api/books` - List all books
- `POST /api/books` - Create a new book
- `GET /api/books/:id` - Get book details
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Authors
- `GET /api/authors` - List all authors
- `POST /api/authors` - Create a new author

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create a new category

### Health
- `GET /health` - Health check endpoint

## 🚀 Production Deployment

### Using Docker Compose

1. **Update environment variables** for production
2. **Build and start**:
   ```bash
   docker-compose up -d
   ```

### Environment Variables for Production

**Backend** (`backend/.env`):
- `DATABASE_URL`: PostgreSQL connection string (use admin:admin123 credentials)
- `JWT_SECRET`: Strong JWT secret
- `NODE_ENV`: Set to `production`
- `FRONTEND_URL`: Production frontend URL
- `PORT`: 5000 (internal container port)

**Frontend** (`frontend/.env.local`):
- `NEXT_PUBLIC_API_URL`: Production API URL (port 3001 for local, adjust for production)

## 📈 Performance Considerations

- **Nginx**: Reverse proxy with caching and compression
- **Redis**: Optional caching layer (included in compose)
- **Database**: Connection pooling with Prisma
- **Static Assets**: Optimized with Next.js
- **Images**: Docker multi-stage builds for smaller images

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 5000, and 5432 are available
2. **Database connection**: Wait for database to fully start before migrations
3. **Docker issues**: Restart Docker and try again
4. **Permission issues**: Ensure setup.sh is executable (`chmod +x setup.sh`)

### Reset Everything

```bash
# Stop and remove everything
docker-compose down -v --remove-orphans

# Remove Docker images
docker rmi $(docker images -q)

# Start fresh
./setup.sh
```

## 📞 Support

If you encounter any issues or have questions, please:

1. Check the troubleshooting section
2. Review Docker and Docker Compose logs
3. Ensure all prerequisites are met
4. Open an issue with detailed information

---

**Happy coding! 🚀**