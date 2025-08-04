// Environment Configuration
// Copy this to .env file and update the values

module.exports = {
  database: {
    url: process.env.DATABASE_URL || "postgresql://postgres:password@db:5432/library_db?schema=public"
  },
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
  }
};

// Create a .env file with these variables:
/*
DATABASE_URL="postgresql://postgres:password@db:5432/library_db?schema=public"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
*/