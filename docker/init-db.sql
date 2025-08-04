-- Initialize database with some basic setup
-- This file is executed when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE library_db TO postgres;

-- The Prisma migrations will handle the actual table creation
-- This file is just for any initial database setup that needs to happen before Prisma runs